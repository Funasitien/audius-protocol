// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: reads.sql

package db

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"
)

const getAllRegisteredNodes = `-- name: GetAllRegisteredNodes :many
select rowid, pub_key, endpoint, eth_address, comet_address, eth_block, node_type, sp_id
from core_validators
`

func (q *Queries) GetAllRegisteredNodes(ctx context.Context) ([]CoreValidator, error) {
	rows, err := q.db.Query(ctx, getAllRegisteredNodes)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []CoreValidator
	for rows.Next() {
		var i CoreValidator
		if err := rows.Scan(
			&i.Rowid,
			&i.PubKey,
			&i.Endpoint,
			&i.EthAddress,
			&i.CometAddress,
			&i.EthBlock,
			&i.NodeType,
			&i.SpID,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getAppStateAtHeight = `-- name: GetAppStateAtHeight :one
select block_height, app_hash
from core_app_state
where block_height = $1
limit 1
`

type GetAppStateAtHeightRow struct {
	BlockHeight int64
	AppHash     []byte
}

func (q *Queries) GetAppStateAtHeight(ctx context.Context, blockHeight int64) (GetAppStateAtHeightRow, error) {
	row := q.db.QueryRow(ctx, getAppStateAtHeight, blockHeight)
	var i GetAppStateAtHeightRow
	err := row.Scan(&i.BlockHeight, &i.AppHash)
	return i, err
}

const getInProgressRollupReports = `-- name: GetInProgressRollupReports :many
select id, address, blocks_proposed, sla_rollup_id from sla_node_reports
where sla_rollup_id is null 
order by address
`

func (q *Queries) GetInProgressRollupReports(ctx context.Context) ([]SlaNodeReport, error) {
	rows, err := q.db.Query(ctx, getInProgressRollupReports)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []SlaNodeReport
	for rows.Next() {
		var i SlaNodeReport
		if err := rows.Scan(
			&i.ID,
			&i.Address,
			&i.BlocksProposed,
			&i.SlaRollupID,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getKey = `-- name: GetKey :one
select id, key, value, tx_hash, created_at, updated_at from core_kvstore where key = $1
`

func (q *Queries) GetKey(ctx context.Context, key string) (CoreKvstore, error) {
	row := q.db.QueryRow(ctx, getKey, key)
	var i CoreKvstore
	err := row.Scan(
		&i.ID,
		&i.Key,
		&i.Value,
		&i.TxHash,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const getLatestAppState = `-- name: GetLatestAppState :one
select block_height, app_hash
from core_app_state
order by block_height desc
limit 1
`

type GetLatestAppStateRow struct {
	BlockHeight int64
	AppHash     []byte
}

func (q *Queries) GetLatestAppState(ctx context.Context) (GetLatestAppStateRow, error) {
	row := q.db.QueryRow(ctx, getLatestAppState)
	var i GetLatestAppStateRow
	err := row.Scan(&i.BlockHeight, &i.AppHash)
	return i, err
}

const getLatestSlaRollup = `-- name: GetLatestSlaRollup :one
select id, tx_hash, block_start, block_end, time from sla_rollups order by time desc limit 1
`

func (q *Queries) GetLatestSlaRollup(ctx context.Context) (SlaRollup, error) {
	row := q.db.QueryRow(ctx, getLatestSlaRollup)
	var i SlaRollup
	err := row.Scan(
		&i.ID,
		&i.TxHash,
		&i.BlockStart,
		&i.BlockEnd,
		&i.Time,
	)
	return i, err
}

const getNodeByEndpoint = `-- name: GetNodeByEndpoint :one
select rowid, pub_key, endpoint, eth_address, comet_address, eth_block, node_type, sp_id
from core_validators
where endpoint = $1
limit 1
`

func (q *Queries) GetNodeByEndpoint(ctx context.Context, endpoint string) (CoreValidator, error) {
	row := q.db.QueryRow(ctx, getNodeByEndpoint, endpoint)
	var i CoreValidator
	err := row.Scan(
		&i.Rowid,
		&i.PubKey,
		&i.Endpoint,
		&i.EthAddress,
		&i.CometAddress,
		&i.EthBlock,
		&i.NodeType,
		&i.SpID,
	)
	return i, err
}

const getRecentRollups = `-- name: GetRecentRollups :many
select id, tx_hash, block_start, block_end, time from sla_rollups order by time desc limit 10
`

func (q *Queries) GetRecentRollups(ctx context.Context) ([]SlaRollup, error) {
	rows, err := q.db.Query(ctx, getRecentRollups)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []SlaRollup
	for rows.Next() {
		var i SlaRollup
		if err := rows.Scan(
			&i.ID,
			&i.TxHash,
			&i.BlockStart,
			&i.BlockEnd,
			&i.Time,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getRegisteredNodesByType = `-- name: GetRegisteredNodesByType :many
select rowid, pub_key, endpoint, eth_address, comet_address, eth_block, node_type, sp_id
from core_validators
where node_type = $1
`

func (q *Queries) GetRegisteredNodesByType(ctx context.Context, nodeType string) ([]CoreValidator, error) {
	rows, err := q.db.Query(ctx, getRegisteredNodesByType, nodeType)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []CoreValidator
	for rows.Next() {
		var i CoreValidator
		if err := rows.Scan(
			&i.Rowid,
			&i.PubKey,
			&i.Endpoint,
			&i.EthAddress,
			&i.CometAddress,
			&i.EthBlock,
			&i.NodeType,
			&i.SpID,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getRollupReportsForId = `-- name: GetRollupReportsForId :many
select id, address, blocks_proposed, sla_rollup_id from sla_node_reports
where sla_rollup_id = $1
order by address
`

func (q *Queries) GetRollupReportsForId(ctx context.Context, slaRollupID pgtype.Int4) ([]SlaNodeReport, error) {
	rows, err := q.db.Query(ctx, getRollupReportsForId, slaRollupID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []SlaNodeReport
	for rows.Next() {
		var i SlaNodeReport
		if err := rows.Scan(
			&i.ID,
			&i.Address,
			&i.BlocksProposed,
			&i.SlaRollupID,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getSlaRollupWithId = `-- name: GetSlaRollupWithId :one
select id, tx_hash, block_start, block_end, time from sla_rollups where id = $1
`

func (q *Queries) GetSlaRollupWithId(ctx context.Context, id int32) (SlaRollup, error) {
	row := q.db.QueryRow(ctx, getSlaRollupWithId, id)
	var i SlaRollup
	err := row.Scan(
		&i.ID,
		&i.TxHash,
		&i.BlockStart,
		&i.BlockEnd,
		&i.Time,
	)
	return i, err
}

const getTx = `-- name: GetTx :one
select rowid, block_id, index, created_at, tx_hash, tx_result from core_tx_results where lower(tx_hash) = lower($1) limit 1
`

func (q *Queries) GetTx(ctx context.Context, lower string) (CoreTxResult, error) {
	row := q.db.QueryRow(ctx, getTx, lower)
	var i CoreTxResult
	err := row.Scan(
		&i.Rowid,
		&i.BlockID,
		&i.Index,
		&i.CreatedAt,
		&i.TxHash,
		&i.TxResult,
	)
	return i, err
}

const totalTxResults = `-- name: TotalTxResults :one
select count(tx_hash) from core_tx_results
`

func (q *Queries) TotalTxResults(ctx context.Context) (int64, error) {
	row := q.db.QueryRow(ctx, totalTxResults)
	var count int64
	err := row.Scan(&count)
	return count, err
}
