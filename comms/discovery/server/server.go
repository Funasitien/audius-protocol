package server

import (
	"encoding/json"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"time"

	discoveryConfig "comms.audius.co/discovery/config"
	"comms.audius.co/discovery/db"
	"comms.audius.co/discovery/db/queries"
	"comms.audius.co/discovery/misc"
	"comms.audius.co/discovery/pubkeystore"
	"comms.audius.co/discovery/rpcz"
	"comms.audius.co/discovery/schema"
	sharedConfig "comms.audius.co/shared/config"
	"comms.audius.co/shared/peering"
	"github.com/gobwas/ws"
	"github.com/inconshreveable/log15"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/nats-io/nats.go"
)

func NewServer(jsc nats.JetStreamContext, proc *rpcz.RPCProcessor) *ChatServer {
	e := echo.New()
	e.HideBanner = true
	e.Debug = true

	// Middleware
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	s := &ChatServer{
		Echo: e,
		jsc:  jsc,
		proc: proc,
	}

	e.GET("/", func(c echo.Context) error {
		return c.String(http.StatusOK, "comms are UP... but this is /... see /comms")
	})

	g := e.Group("/comms")

	g.GET("", func(c echo.Context) error {
		return c.String(http.StatusOK, "comms are UP: v1")
	})

	g.GET("/pubkey/:id", s.getPubkey)
	g.GET("/chats", s.getChats)
	g.GET("/chats/ws", s.chatWebsocket)
	g.GET("/chats/:id", s.getChat)
	g.GET("/chats/:id/messages", s.getMessages)
	g.POST("/mutate", s.mutate)

	g.GET("/debug/stream", func(c echo.Context) error {

		info, err := jsc.StreamInfo(discoveryConfig.GlobalStreamName)
		if err != nil {
			return err
		}
		return c.JSON(200, info)
	})

	g.GET("/debug/consumer", func(c echo.Context) error {
		info, err := jsc.ConsumerInfo(discoveryConfig.GlobalStreamName, discoveryConfig.GetDiscoveryConfig().PeeringConfig.Keys.DelegatePublicKey)
		if err != nil {
			return err
		}
		return c.JSON(200, info)
	})

	g.GET("/debug/vars", echo.WrapHandler(http.StripPrefix("/comms", http.DefaultServeMux)))
	g.GET("/debug/pprof/*", echo.WrapHandler(http.StripPrefix("/comms", http.DefaultServeMux)))

	return s
}

var (
	logger = log15.New()
)

func init() {
	logger.SetHandler(log15.StreamHandler(os.Stdout, log15.TerminalFormat()))
}

type ChatServer struct {
	*echo.Echo
	jsc  nats.JetStreamContext
	proc *rpcz.RPCProcessor
}

func (s *ChatServer) mutate(c echo.Context) error {
	payload, wallet, err := peering.ReadSignedRequest(c)
	if err != nil {
		return c.JSON(400, "bad request: "+err.Error())
	}

	// unmarshal RPC and call validator
	var rawRpc schema.RawRPC
	err = json.Unmarshal(payload, &rawRpc)
	if err != nil {
		return c.JSON(400, "bad request: "+err.Error())
	}

	userId, err := queries.GetUserIDFromWallet(db.Conn, c.Request().Context(), wallet)
	if err != nil {
		return c.String(400, "wallet not found: "+err.Error())
	}

	// call validator
	err = s.proc.Validate(userId, rawRpc)
	if err != nil {
		return c.JSON(400, "bad request: "+err.Error())
	}

	// Publish data to the subject
	subject := "audius.rpc"
	msg := nats.NewMsg(subject)
	msg.Header.Add(sharedConfig.SigHeader, c.Request().Header.Get(sharedConfig.SigHeader))
	msg.Data = payload

	ok, err := s.proc.SubmitAndWait(msg)
	if err != nil {
		logger.Warn(string(payload), "wallet", wallet, "err", err)
		return err
	}
	logger.Debug(string(payload), "seq", ok.Sequence, "wallet", wallet, "relay", true)
	return c.JSON(200, ok)
}

func (s *ChatServer) getHealthStatus() schema.Health {
	return schema.Health{
		IsHealthy: true,
	}
}

func (s *ChatServer) getPubkey(c echo.Context) error {
	id, err := misc.DecodeHashId(c.Param("id"))
	if err != nil {
		return c.String(400, "bad id parameter: "+err.Error())
	}

	pubkey, err := pubkeystore.RecoverUserPublicKeyBase64(c.Request().Context(), id)
	if err != nil {
		return err
	}

	return c.JSON(200, map[string]interface{}{
		"data": pubkey,
	})
}

func (s *ChatServer) chatWebsocket(c echo.Context) error {
	ctx := c.Request().Context()

	// Check that timestamp is less than 5 seconds old
	timestamp, err := strconv.ParseInt(c.QueryParam("timestamp"), 0, 64)
	if err != nil || time.Now().UnixMilli()-timestamp > 5000 {
		return c.String(400, "Invalid signature timestamp")
	}

	// Websockets from the client can't send headers, so instead, the signature is a query parameter
	// Strip out the signature query parameter to get the true signature payload
	u, err := url.Parse(c.Request().RequestURI)
	if err != nil {
		return c.String(400, "Could not parse URL")
	}
	q := u.Query()
	q.Del("signature")
	u.RawQuery = q.Encode()
	signature := c.QueryParam("signature")
	signedData := []byte(u.String())

	// Now that we have the data that was actually signed, we can recover the wallet
	wallet, err := peering.ReadSigned(signature, signedData)
	if err != nil {
		return c.String(400, "bad request: "+err.Error())
	}

	userId, err := queries.GetUserIDFromWallet(db.Conn, ctx, wallet)
	if err != nil {
		return c.String(400, "wallet not found: "+err.Error())
	}

	w := c.Response()
	r := c.Request()

	conn, _, _, err := ws.UpgradeHTTP(r, w)
	if err != nil {
		return err
	}

	rpcz.RegisterWebsocket(userId, conn)
	return nil
}

func (s *ChatServer) getChats(c echo.Context) error {
	ctx := c.Request().Context()
	_, wallet, err := peering.ReadSignedRequest(c)
	if err != nil {
		return c.String(400, "bad request: "+err.Error())
	}

	userId, err := queries.GetUserIDFromWallet(db.Conn, ctx, wallet)
	if err != nil {
		return c.String(400, "wallet not found: "+err.Error())
	}

	params := queries.UserChatsParams{UserID: int32(userId), Before: time.Now().UTC(), After: time.Time{}, Limit: 50}
	if c.QueryParam("before") != "" {
		beforeCursor, err := time.Parse(time.RFC3339Nano, c.QueryParam("before"))
		if err != nil {
			return err
		}
		params.Before = beforeCursor
	}
	if c.QueryParam("after") != "" {
		afterCursor, err := time.Parse(time.RFC3339Nano, c.QueryParam("after"))
		if err != nil {
			return err
		}
		params.After = afterCursor
	}
	if c.QueryParam("limit") != "" {
		limit, err := strconv.Atoi(c.QueryParam("limit"))
		if err != nil {
			return err
		}
		params.Limit = int32(limit)
	}

	chats, err := queries.UserChats(db.Conn, ctx, params)
	if err != nil {
		return err
	}
	responseData := make([]schema.UserChat, len(chats))
	for i := range chats {
		members, err := queries.ChatMembers(db.Conn, ctx, chats[i].ChatID)
		if err != nil {
			return err
		}
		responseData[i] = ToChatResponse(chats[i], members)
	}
	beforeCursorPos := params.Before
	afterCursorPos := params.After
	if len(chats) > 0 {
		beforeCursorPos = chats[len(chats)-1].LastMessageAt
		afterCursorPos = chats[0].LastMessageAt
	}
	summary, err := queries.UserChatsSummary(db.Conn, ctx, queries.UserChatsSummaryParams{UserID: userId, Before: beforeCursorPos, After: afterCursorPos})
	if err != nil {
		return err
	}
	responseSummary := ToSummaryResponse(beforeCursorPos.Format(time.RFC3339Nano), afterCursorPos.Format(time.RFC3339Nano), summary)
	response := schema.CommsResponse{
		Health:  s.getHealthStatus(),
		Data:    responseData,
		Summary: &responseSummary,
	}
	return c.JSON(200, response)
}

func (s *ChatServer) getChat(c echo.Context) error {
	ctx := c.Request().Context()
	_, wallet, err := peering.ReadSignedRequest(c)
	if err != nil {
		return c.String(400, "bad request: "+err.Error())
	}

	userId, err := queries.GetUserIDFromWallet(db.Conn, ctx, wallet)
	if err != nil {
		return c.String(400, "wallet not found: "+err.Error())
	}
	chat, err := queries.UserChat(db.Conn, ctx, queries.ChatMembershipParams{UserID: int32(userId), ChatID: c.Param("id")})
	if err != nil {
		return err
	}
	members, err := queries.ChatMembers(db.Conn, ctx, chat.ChatID)
	if err != nil {
		return err
	}
	response := schema.CommsResponse{
		Health: s.getHealthStatus(),
		Data:   ToChatResponse(chat, members),
	}
	return c.JSON(200, response)
}

func (s *ChatServer) getMessages(c echo.Context) error {
	ctx := c.Request().Context()
	_, wallet, err := peering.ReadSignedRequest(c)
	if err != nil {
		return c.String(400, "bad request: "+err.Error())
	}

	userId, err := queries.GetUserIDFromWallet(db.Conn, ctx, wallet)
	if err != nil {
		return c.String(400, "wallet not found: "+err.Error())
	}

	params := queries.ChatMessagesAndReactionsParams{UserID: int32(userId), ChatID: c.Param("id"), Before: time.Now().UTC(), After: time.Time{}, Limit: 50}
	if c.QueryParam("before") != "" {
		beforeCursor, err := time.Parse(time.RFC3339Nano, c.QueryParam("before"))
		if err != nil {
			return err
		}
		params.Before = beforeCursor
	}
	if c.QueryParam("after") != "" {
		afterCursor, err := time.Parse(time.RFC3339Nano, c.QueryParam("after"))
		if err != nil {
			return err
		}
		params.After = afterCursor
	}
	if c.QueryParam("limit") != "" {
		limit, err := strconv.Atoi(c.QueryParam("limit"))
		if err != nil {
			return err
		}
		params.Limit = int32(limit)
	}

	messages, err := queries.ChatMessagesAndReactions(db.Conn, ctx, params)
	if err != nil {
		return err
	}

	beforeCursorPos := params.Before
	afterCursorPos := params.After
	if len(messages) > 0 {
		beforeCursorPos = messages[len(messages)-1].CreatedAt
		afterCursorPos = messages[0].CreatedAt
	}
	summary, err := queries.ChatMessagesSummary(db.Conn, ctx, queries.ChatMessagesSummaryParams{UserID: userId, ChatID: c.Param("id"), Before: beforeCursorPos, After: afterCursorPos})
	if err != nil {
		return err
	}
	responseSummary := ToSummaryResponse(beforeCursorPos.Format(time.RFC3339Nano), afterCursorPos.Format(time.RFC3339Nano), summary)
	response := schema.CommsResponse{
		Health:  s.getHealthStatus(),
		Data:    Map(messages, ToMessageResponse),
		Summary: &responseSummary,
	}
	return c.JSON(200, response)
}
