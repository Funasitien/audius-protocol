import logging
from collections import defaultdict
from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, TypedDict, Union

from sqlalchemy import bindparam, text
from sqlalchemy.orm.session import Session

logger = logging.getLogger(__name__)


notification_groups_sql = text(
    """
--- Create Intervals of user seen
WITH user_seen as (
  SELECT
    LAG(seen_at, 1, now()::timestamp) OVER ( ORDER BY seen_at desc ) AS seen_at,
    seen_at as prev_seen_at
  FROM
    notification_seen
  WHERE
    user_id = :user_id
  ORDER BY
    seen_at desc
)
SELECT
    n.type,
    n.group_id as group_id,
    array_agg(n.id),
    CASE 
      WHEN user_seen.seen_at is not NULL THEN now()::timestamp != user_seen.seen_at
      ELSE EXISTS(SELECT 1 from notification_seen where user_id = :user_id)
    END as is_seen,
    CASE 
      WHEN user_seen.seen_at is not NULL THEN user_seen.seen_at
      ELSE (
        SELECT seen_at from notification_seen
        WHERE user_id = :user_id
        ORDER BY seen_at ASC
        limit 1
      )
    END as seen_at,
    user_seen.prev_seen_at,
    count(n.group_id)
FROM
    notification n
LEFT JOIN user_seen on
  user_seen.seen_at >= n.timestamp and user_seen.prev_seen_at < n.timestamp
WHERE
  ARRAY[:user_id] && n.user_ids AND
  (:valid_types is NOT NULL AND n.type in :valid_types) AND
  (
    (:timestamp_offset is NULL AND :group_id_offset is NULL) OR
    (:timestamp_offset is NULL AND :group_id_offset is NOT NULL AND n.group_id < :group_id_offset) OR
    (:timestamp_offset is NOT NULL AND user_seen.seen_at is NULL AND n.timestamp < :timestamp_offset) OR
    (:timestamp_offset is NOT NULL AND user_seen.seen_at is NOT NULL AND user_seen.seen_at < :timestamp_offset) OR
    (
        :group_id_offset is NOT NULL AND :timestamp_offset is NOT NULL AND 
        (user_seen.seen_at = :timestamp_offset AND n.group_id < :group_id_offset)
    )
  )
GROUP BY
  n.type, n.group_id, user_seen.seen_at, user_seen.prev_seen_at
ORDER BY
  user_seen.seen_at desc NULLS LAST,
  n.group_id desc
limit :limit;
"""
)
notification_groups_sql = notification_groups_sql.bindparams(
    bindparam("valid_types", expanding=True)
)


MAX_LIMIT = 50
DEFAULT_LIMIT = 20


class NotificationGroup(TypedDict):
    type: str
    group_id: str
    notification_ids: List[int]
    is_seen: bool
    seen_at: datetime
    prev_seen_at: datetime
    count: int


class NotificationType(str, Enum):
    ANNOUNCEMENT = "announcement"
    FOLLOW = "follow"
    REPOST = "repost"
    SAVE = "save"
    REMIX = "remix"
    COSIGN = "cosign"
    CREATE = "create"
    TIP_RECEIVE = "tip_receive"
    TIP_SEND = "tip_send"
    CHALLENGE_REWARD = "challenge_reward"
    REPOST_REPOST = "repost_repost"
    REACTION = "reaction"
    SUPPORTER_DETRONED = "supporter_dethroned"
    SUPPORTER_RANK_UP = "supporter_rank_up"
    SUPPORTING_RANK_UP = "supporting_rank_up"
    MILESTONE = "milestone"
    TRACK_MILESTONE = "track_milestone"
    PLAYLIST_MILSTONE = "playlist_milestone"
    TIER_CHANGE = "tier_change"
    TRENDING = "trending"

    def __str__(self) -> str:
        return str.__str__(self)


default_valid_types = [
    NotificationType.REPOST,
    NotificationType.REPOST_REPOST,
    NotificationType.SAVE,
    NotificationType.FOLLOW,
    NotificationType.TIP_SEND,
    NotificationType.TIP_RECEIVE,
    NotificationType.MILESTONE,
    NotificationType.SUPPORTER_RANK_UP,
    NotificationType.SUPPORTING_RANK_UP,
    NotificationType.CHALLENGE_REWARD,
    NotificationType.TIER_CHANGE,
    NotificationType.CREATE,
    NotificationType.REMIX,
    NotificationType.COSIGN,
    NotificationType.TRENDING,
    NotificationType.SUPPORTER_DETRONED,
    NotificationType.ANNOUNCEMENT,
    NotificationType.REACTION,
]


class GetNotificationArgs(TypedDict):
    user_id: int
    timestamp: Optional[datetime]
    group_id: Optional[str]
    limit: Optional[int]
    valid_types: Optional[List[NotificationType]]


def get_notification_groups(session: Session, args: GetNotificationArgs):
    """
    Gets the user's notifications in the database
    """
    limit = args.get("limit") or DEFAULT_LIMIT
    limit = min(limit, MAX_LIMIT)  # type: ignore

    # Set valid types
    args["valid_types"] = args.get("valid_types", []) + default_valid_types  # type: ignore

    rows = session.execute(
        notification_groups_sql,
        {
            "user_id": args["user_id"],
            "limit": limit,
            "timestamp_offset": args.get("timestamp", None),
            "group_id_offset": args.get("group_id", None),
            "valid_types": args.get("valid_types", None),
        },
    )

    res: List[NotificationGroup] = [
        {
            "type": r[0],
            "group_id": r[1],
            "notification_ids": r[2],
            "is_seen": r[3] if r[3] != None else False,
            "seen_at": r[4],
            "prev_seen_at": r[5],
            "count": r[6],
        }
        for r in rows
    ]
    return res


class FollowNotification(TypedDict):
    follower_user_id: int
    followee_user_id: int


class RepostNotification(TypedDict):
    type: str
    user_id: int
    repost_item_id: int


class RepostRepostNotification(TypedDict):
    type: str
    user_id: int
    repost_repost_item_id: int


class SaveNotification(TypedDict):
    type: str
    user_id: int
    save_item_id: int


class RemixNotification(TypedDict):
    parent_track_id: int
    track_id: int


class CosignRemixNotification(TypedDict):
    parent_track_id: int
    track_owner_id: int
    track_id: int


class CreateTrackNotification(TypedDict):
    track_id: int


class CreatePlaylistNotification(TypedDict):
    is_album: bool
    playlist_id: int


class TipReceiveNotification(TypedDict):
    amount: int
    sender_user_id: int
    receiver_user_id: int
    tx_signature: str
    reaction_value: Optional[int]


class TipSendNotification(TypedDict):
    amount: int
    sender_user_id: int
    receiver_user_id: int
    tx_signature: str


class ChallengeRewardNotification(TypedDict):
    amount: int
    specifier: str
    challenge_id: str


class ReactionNotification(TypedDict):
    reacted_to: str
    reaction_type: str
    reaction_value: int
    sender_wallet: str
    receiver_user_id: int
    sender_user_id: int
    tip_amount: int


class SupporterRankUpNotification(TypedDict):
    rank: int
    sender_user_id: int
    receiver_user_id: int


class SupportingRankUpNotification(TypedDict):
    rank: int
    sender_user_id: int
    receiver_user_id: int


class SupporterDethronedNotification(TypedDict):
    sender_user_id: int
    receiver_user_id: int
    dethroned_user_id: int


class FollowerMilestoneNotification(TypedDict):
    type: str
    user_id: int
    threshold: int


class TrackMilestoneNotification(TypedDict):
    type: str
    track_id: int
    threshold: int


class PlaylistMilestoneNotification(TypedDict):
    type: str
    playlist_id: int
    threshold: int


class TierChangeNotification(TypedDict):
    new_tier: str
    new_tier_value: int
    current_value: str


class TrendingNotification(TypedDict):
    rank: int
    genre: str
    track_id: int
    time_range: str


class AnnouncementNotification(TypedDict):
    title: str
    short_description: str
    long_description: Optional[str]


NotificationData = Union[
    AnnouncementNotification,
    FollowNotification,
    RepostNotification,
    RepostRepostNotification,
    SaveNotification,
    RemixNotification,
    CosignRemixNotification,
    CreateTrackNotification,
    CreatePlaylistNotification,
    TipReceiveNotification,
    TipSendNotification,
    ChallengeRewardNotification,
    ReactionNotification,
    SupporterRankUpNotification,
    SupportingRankUpNotification,
    SupporterDethronedNotification,
    FollowerMilestoneNotification,
    TrackMilestoneNotification,
    PlaylistMilestoneNotification,
    TierChangeNotification,
    TrendingNotification,
]


class NotificationAction(TypedDict):
    specifier: str
    type: str
    group_id: str
    timestamp: datetime
    data: NotificationData


class Notification(TypedDict):
    type: str
    group_id: str
    is_seen: bool
    seen_at: datetime
    actions: List[NotificationAction]


notifications_sql = text(
    """
SELECT
    id,
    type,
    specifier,
    timestamp,
    data,
    group_id
FROM notification n
WHERE n.id in :notification_ids
"""
)
notifications_sql = notifications_sql.bindparams(
    bindparam("notification_ids", expanding=True)
)


def get_notifications(session: Session, args: GetNotificationArgs):
    notifications = get_notification_groups(session, args)
    notification_ids = []
    for notification in notifications:
        notification_ids.extend(notification["notification_ids"])

    rows = session.execute(notifications_sql, {"notification_ids": notification_ids})

    notification_id_data: Dict[int, NotificationAction] = defaultdict()
    for row in rows:
        notification_id_data[row[0]] = {
            "type": row[1],
            "specifier": row[2],
            "timestamp": row[3],
            "data": row[4],
            "group_id": row[5],
        }

    notifications_and_actions = [
        {
            **notification,
            "actions": [
                notification_id_data[id] for id in notification["notification_ids"]
            ],
        }
        for notification in notifications
    ]
    return notifications_and_actions
