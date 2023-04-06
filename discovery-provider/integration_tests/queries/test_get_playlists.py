import logging
from datetime import datetime

import pytest
from integration_tests.utils import populate_mock_db
from src.queries.get_playlist_tracks import get_playlist_tracks
from src.queries.get_playlists import GetPlaylistsArgs, get_playlists
from src.utils.db_session import get_db

logger = logging.getLogger(__name__)


@pytest.fixture
def test_entities():
    return {
        "playlists": [
            {
                "playlist_id": 1,
                "playlist_owner_id": 1,
                "playlist_name": "playlist 1",
            },
            {
                "playlist_id": 2,
                "playlist_owner_id": 2,
                "playlist_name": "playlist 2",
                "is_private": True,
            },
            {
                "playlist_id": 3,
                "playlist_owner_id": 3,
                "playlist_name": "playlist 3",
                "is_current": True,
                "playlist_contents": {
                    "track_ids": [
                        {"track": 1},
                        {"track": 2},
                        {"track": 3},
                        {"track": 4},
                    ]
                },
            },
            {
                "playlist_id": 4,
                "playlist_owner_id": 3,
                "playlist_name": "playlist 4",
                "is_private": True,
                "is_current": True,
                "playlist_contents": {
                    "track_ids": [
                        {"track": 1},
                        {"track": 2},
                        {"track": 3},
                        {"track": 4},
                    ]
                },
            },
        ],
        "users": [
            {"user_id": 1, "handle": "user1"},
            {"user_id": 2, "handle": "user2"},
            {"user_id": 3, "handle": "user3"},
        ],
        "playlist_routes": [
            {"slug": "playlist-1", "owner_id": 1, "playlist_id": 1},
            {"slug": "playlist-2", "owner_id": 2, "playlist_id": 2},
            {"slug": "playlist-3", "owner_id": 3, "playlist_id": 3},
            {"slug": "playlist-4", "owner_id": 3, "playlist_id": 4},
        ],
        "tracks": [
            {
                "track_id": 1,
                "title": "track 1",
                "owner_id": 1287289,
                "is_current": True,
                "release_date": "Fri Dec 20 2019 12:00:00 GMT-0800",
                "created_at": datetime(2018, 5, 17),
            },
            {
                "track_id": 2,
                "title": "track 2",
                "owner_id": 1287289,
                "is_current": True,
                "created_at": datetime(2018, 5, 18),
            },
            {
                "track_id": 3,
                "title": "track 3",
                "owner_id": 1287289,
                "is_current": True,
                "release_date": "Wed Dec 18 2019 12:00:00 GMT-0800",
                "created_at": datetime(2020, 5, 17),
                "is_unlisted": True,
            },
            {
                "track_id": 4,
                "title": "track 4",
                "owner_id": 1287289,
                "is_current": True,
                "release_date": "",
                "created_at": datetime(2018, 5, 19),
                "is_unlisted": True,
            },
        ],
    }


def assert_playlist(playlist, playlist_name, playlist_id, playlist_owner_id):
    assert playlist["playlist_name"] == playlist_name
    assert playlist["playlist_id"] == playlist_id
    assert playlist["playlist_owner_id"] == playlist_owner_id


def test_get_playlist_with_playlist_ids(app, test_entities):
    with app.test_request_context(
        # Request context and args are required for passing
        # pagination info into paginate_query inside get_playlists
        data={"limit": 5, "offset": 3},
    ):
        db = get_db()
        populate_mock_db(db, test_entities)
        with db.scoped_session():
            playlist = get_playlists(
                GetPlaylistsArgs(
                    current_user_id=2,
                    playlist_ids=[2],
                ),
            )

            assert len(playlist) == 1
            assert_playlist(
                playlist=playlist[0],
                playlist_id=2,
                playlist_name="playlist 2",
                playlist_owner_id=2,
            )


def test_get_private_playlist_with_playlist_ids(app, test_entities):
    with app.test_request_context(
        # Request context and args are required for passing
        # pagination info into paginate_query inside get_playlists
        data={"limit": 5, "offset": 3},
    ):
        db = get_db()
        populate_mock_db(db, test_entities)
        with db.scoped_session():
            playlist = get_playlists(
                GetPlaylistsArgs(
                    playlist_ids=[2],
                ),
            )

            assert len(playlist) == 0


def test_get_playlist_with_permalink(app, test_entities):
    with app.test_request_context(
        # Request context and args are required for passing
        # pagination info into paginate_query inside get_playlists
        data={"limit": 5, "offset": 3},
    ):
        db = get_db()
        populate_mock_db(db, test_entities)
        with db.scoped_session():
            playlist = get_playlists(
                GetPlaylistsArgs(
                    current_user_id=1,
                    routes=[{"handle": "user1", "slug": "playlist-1"}],
                ),
            )

            playlist_from_other_user = get_playlists(
                GetPlaylistsArgs(
                    current_user_id=2,
                    routes=[{"handle": "user1", "slug": "playlist-1"}],
                ),
            )
            assert len(playlist) == 1
            assert len(playlist_from_other_user) == 1
            assert playlist_from_other_user == playlist
            assert_playlist(
                playlist=playlist[0],
                playlist_id=1,
                playlist_name="playlist 1",
                playlist_owner_id=1,
            )


def test_get_playlist_with_permalink_private_playlist(app, test_entities):
    with app.test_request_context(
        # Request context and args are required for passing
        # pagination info into paginate_query inside get_playlists
        data={"limit": 5, "offset": 3},
    ):
        db = get_db()
        populate_mock_db(db, test_entities)
        with db.scoped_session():
            playlist = get_playlists(
                GetPlaylistsArgs(
                    current_user_id=1,
                    routes=[{"handle": "user2", "slug": "playlist-2"}],
                ),
            )
            assert len(playlist) == 1
            assert_playlist(
                playlist=playlist[0],
                playlist_id=2,
                playlist_name="playlist 2",
                playlist_owner_id=2,
            )


def test_get_playlist_with_listed_and_unlisted_tracks(app, test_entities):
    with app.test_request_context():
        db = get_db()
        populate_mock_db(db, test_entities)
        with db.scoped_session() as session:
            playlists = get_playlist_tracks(
                session, {"playlist_ids": [3, 4], "current_user_id": 3}
            )
            assert len(playlists) == 2
            tracks_playlist_3 = playlists[3]
            tracks_playlist_4 = playlists[4]

            # public, doesnt have all four tracks
            assert len(tracks_playlist_3) == 2
            t1_p3, t2_p3 = tracks_playlist_3
            assert not t1_p3["is_unlisted"]
            assert not t2_p3["is_unlisted"]

            # private, has all four tracks
            assert len(tracks_playlist_4) == 4
            t1_p4, t2_p4, t3_p4, t4_p4 = tracks_playlist_4
            assert not t1_p4["is_unlisted"]
            assert not t2_p4["is_unlisted"]
            assert t3_p4["is_unlisted"]
            assert t4_p4["is_unlisted"]
