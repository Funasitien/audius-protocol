import logging
import time
from datetime import datetime
from typing import List, Tuple

from redis import Redis
from sqlalchemy import bindparam, text
from sqlalchemy.orm.session import Session
from src.models.notifications.notification import Notification
from src.models.tracks.track import Track
from src.queries.get_trending_tracks import (
    _get_trending_tracks_with_session,
    generate_unpopulated_trending,
    generate_unpopulated_trending_from_mat_views,
    make_trending_cache_key,
)
from src.trending_strategies.trending_strategy_factory import TrendingStrategyFactory
from src.trending_strategies.trending_type_and_version import TrendingType
from src.utils.prometheus_metric import PrometheusMetric, PrometheusMetricNames
from src.utils.redis_cache import set_json_cached_key
from src.utils.redis_constants import trending_tracks_last_completion_redis_key
from src.utils.session_manager import SessionManager

logger = logging.getLogger(__name__)
time_ranges = ["week", "month", "year"]

genre_allowlist = {
    "Acoustic",
    "Alternative",
    "Ambient",
    "Audiobooks",
    "Blues",
    "Classical",
    "Comedy",
    "Country",
    "Deep House",
    "Devotional",
    "Disco",
    "Downtempo",
    "Drum & Bass",
    "Dubstep",
    "Electro",
    "Electronic",
    "Experimental",
    "Folk",
    "Funk",
    "Future Bass",
    "Future House",
    "Glitch Hop",
    "Hardstyle",
    "Hip-Hop/Rap",
    "House",
    "Hyperpop",
    "Jazz",
    "Jersey Club",
    "Jungle",
    "Kids",
    "Latin",
    "Lo-Fi",
    "Metal",
    "Moombahton",
    "Podcasts",
    "Pop",
    "Progressive House",
    "Punk",
    "R&B/Soul",
    "Reggae",
    "Rock",
    "Soundtrack",
    "Spoken Word",
    "Tech House",
    "Techno",
    "Trance",
    "Trap",
    "Tropical House",
    "Vaporwave",
    "World",
}


def get_genres(session: Session) -> List[str]:
    """Returns all genres"""
    genres: List[Tuple[str]] = (session.query(Track.genre).distinct(Track.genre)).all()
    genres = filter(  # type: ignore
        lambda x: x[0] is not None and x[0] != "" and x[0] in genre_allowlist, genres
    )
    return list(map(lambda x: x[0], genres))


trending_strategy_factory = TrendingStrategyFactory()

AGGREGATE_INTERVAL_PLAYS = "aggregate_interval_plays"
TRENDING_PARAMS = "trending_params"


def update_view(session: Session, mat_view_name: str):
    start_time = time.time()
    metric = PrometheusMetric(
        PrometheusMetricNames.UPDATE_TRENDING_VIEW_DURATION_SECONDS
    )
    session.execute(f"REFRESH MATERIALIZED VIEW {mat_view_name}")
    update_time = time.time() - start_time
    metric.save_time({"mat_view_name": mat_view_name})
    logger.info(
        f"index_trending.py | Finished updating {mat_view_name} in: {time.time()-start_time} sec",
        extra={
            "job": "index_trending",
            "update_time": update_time,
            "mat_view_name": mat_view_name,
        },
    )


def index_trending_tracks(db: SessionManager, redis: Redis, timestamp):
    logger.info("index_trending.py | starting indexing")
    update_start = time.time()
    metric = PrometheusMetric(PrometheusMetricNames.INDEX_TRENDING_DURATION_SECONDS)
    with db.scoped_session() as session:
        genres = get_genres(session)

        # Make sure to cache empty genre
        genres.append(None)  # type: ignore

        trending_track_versions = trending_strategy_factory.get_versions_for_type(
            TrendingType.TRACKS
        ).keys()

        update_view(session, AGGREGATE_INTERVAL_PLAYS)
        update_view(session, TRENDING_PARAMS)
        for version in trending_track_versions:
            strategy = trending_strategy_factory.get_strategy(
                TrendingType.TRACKS, version
            )
            if strategy.use_mat_view:
                strategy.update_track_score_query(session)

        for version in trending_track_versions:
            strategy = trending_strategy_factory.get_strategy(
                TrendingType.TRACKS, version
            )
            for genre in genres:
                for time_range in time_ranges:
                    cache_start_time = time.time()
                    if strategy.use_mat_view:
                        res = generate_unpopulated_trending_from_mat_views(
                            session=session,
                            genre=genre,
                            time_range=time_range,
                            strategy=strategy,
                        )
                    else:
                        res = generate_unpopulated_trending(
                            session=session,
                            genre=genre,
                            time_range=time_range,
                            strategy=strategy,
                        )
                    key = make_trending_cache_key(time_range, genre, version)
                    set_json_cached_key(redis, key, res)
                    cache_end_time = time.time()
                    total_time = cache_end_time - cache_start_time
                    logger.info(
                        f"index_trending.py | Cached trending ({version.name} version) \
                        for {genre}-{time_range} in {total_time} seconds"
                    )

    update_end = time.time()
    update_total = update_end - update_start
    metric.save_time()
    logger.info(
        f"index_trending.py | Finished indexing trending in {update_total} seconds",
        extra={"job": "index_trending", "total_time": update_total},
    )
    # Update cache key to track the last time trending finished indexing
    redis.set(trending_tracks_last_completion_redis_key, int(update_end))
    set_last_trending_datetime(redis, timestamp)

    top_trending_tracks = get_top_trending_to_notify(db)

    index_trending_notifications(db, timestamp, top_trending_tracks)
    return top_trending_tracks


def get_top_trending_to_notify(db):
    # The number of tracks to notify for in the top
    NOTIFICATIONS_TRACK_LIMIT = 5
    with db.scoped_session() as session:
        trending_tracks = _get_trending_tracks_with_session(
            session,
            {"time": "week", "exclude_premium": True},
            trending_strategy_factory.get_strategy(TrendingType.TRACKS),
        )
        top_trending = trending_tracks[:NOTIFICATIONS_TRACK_LIMIT]
        return top_trending


def index_trending_notifications(
    db: SessionManager, timestamp: int, top_trending: List[Track]
):
    # Get the top 5 trending tracks from the new trending calculations
    # Get the most recent trending tracks notifications
    # Calculate any diff and write the new notifications if the trending track has moved up in rank
    # Skip if the user was notified of the trending track within the last TRENDING_INTERVAL_HOURS
    # Skip If the new rank is not less than the old rank, skip
    #   ie. Skip if track moved from #2 trending to #3 trending or stayed the same
    # The number of tracks to notify for in the top
    with db.scoped_session() as session:
        top_trending_track_ids = [str(t["track_id"]) for t in top_trending]

        previous_trending_notifications = (
            session.query(Notification)
            .filter(
                Notification.type == "trending",
                Notification.specifier.in_(top_trending_track_ids),
            )
            .all()
        )

        latest_notification_query = text(
            """
                SELECT 
                    DISTINCT ON (specifier) specifier,
                    timestamp,
                    data
                FROM notification
                WHERE 
                    type=:type AND
                    specifier in :track_ids
                ORDER BY
                    specifier desc,
                    timestamp desc
            """
        )
        latest_notification_query = latest_notification_query.bindparams(
            bindparam("track_ids", expanding=True)
        )

        previous_trending_notifications = session.execute(
            latest_notification_query,
            {"track_ids": top_trending_track_ids, "type": "trending"},
        )
        previous_trending = {
            n[0]: {"timestamp": n[1], **n[2]} for n in previous_trending_notifications
        }

        notifications = []

        # Do not send notifications for the same track trending within 24 hours
        NOTIFICATION_INTERVAL_SEC = 60 * 60 * 24

        for index, track in enumerate(top_trending):
            track_id = track["track_id"]
            rank = index + 1
            previous_track_notification = previous_trending.get(str(track["track_id"]))
            if previous_track_notification is not None:
                current_datetime = datetime.fromtimestamp(timestamp)
                prev_notification_datetime = datetime.fromtimestamp(
                    previous_track_notification["timestamp"].timestamp()
                )
                if (
                    current_datetime - prev_notification_datetime
                ).total_seconds() < NOTIFICATION_INTERVAL_SEC:
                    continue
                prev_rank = previous_track_notification["rank"]
                if prev_rank <= rank:
                    continue
            notifications.append(
                {
                    "owner_id": track["owner_id"],
                    "group_id": f"trending:time_range:week:genre:all:rank:{rank}:track_id:{track_id}:timestamp:{timestamp}",
                    "track_id": track_id,
                    "rank": rank,
                }
            )

        session.bulk_save_objects(
            [
                Notification(
                    user_ids=[n["owner_id"]],
                    timestamp=datetime.fromtimestamp(timestamp),
                    type="trending",
                    group_id=n["group_id"],
                    specifier=n["track_id"],
                    data={
                        "time_range": "week",
                        "genre": "all",
                        "rank": n["rank"],
                        "track_id": n["track_id"],
                    },
                )
                for n in notifications
            ]
        )
        logger.info(
            "index_trending.py | Created trending notifications",
            extra={"job": "index_trending", "subtask": "trending notification"},
        )
        return top_trending


last_trending_timestamp = "last_trending_timestamp"


def set_last_trending_datetime(redis: Redis, timestamp: int):
    redis.set(last_trending_timestamp, timestamp)
