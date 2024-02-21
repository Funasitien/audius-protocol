import json
import logging
import pprint
from datetime import datetime, timedelta
from typing import List

from web3 import Web3
from web3.datastructures import AttributeDict

from integration_tests.challenges.index_helpers import UpdateTask
from integration_tests.utils import populate_mock_db
from src.challenges.challenge_event_bus import ChallengeEventBus, setup_challenge_bus
from src.models.playlists.playlists_tracks_relations import PlaylistsTracksRelations
from src.tasks.entity_manager.entity_manager import entity_manager_update
from src.tasks.entity_manager.utils import PLAYLIST_ID_OFFSET
from src.utils.db_session import get_db

logger = logging.getLogger(__name__)

# Insert Playlist with two new tracks and check that a notification is created for the track owners
now = datetime.now()
entities = {
    "users": [
        {"user_id": 1, "handle": "user-1", "wallet": "user1wallet"},
    ],
    "tracks": [
        {"track_id": 20, "owner_id": 1},
        {"track_id": 10, "owner_id": 2},
        {"track_id": 30, "owner_id": 15},
        {"track_id": 40, "owner_id": 12},
    ],
    "playlists": [
        {
            "playlist_owner_id": 1,
            "playlist_id": PLAYLIST_ID_OFFSET,
            "created_at": now,
            "updated_at": now,
            "playlist_name": "test_playlist",
            "description": "test_description",
            "playlist_contents": {
                "track_ids": [
                    {"time": datetime.timestamp(now), "track": 20},
                    {"time": datetime.timestamp(now), "track": 30},
                    {"time": datetime.timestamp(now), "track": 10},
                    {
                        "time": datetime.timestamp(now - timedelta(minutes=1)),
                        "track": 40
                    },
                ]
            },
        },
    ],
}

test_metadata = {
    "PlaylistToCreate": {
        "playlist_contents": {
            "track_ids": [
                {"time": 1660927554, "track": 10},
                {"time": 1660927554, "track": 20},
            ]
        },
        "playlist_name": "created_playlist",
    },
    "AlbumTracklistUpdate": {
        "playlist_contents": {
            "track_ids": [
                {"time": 1660927554, "track": 20},
                {"time": 1660927554, "track": 30},
            ]
        }
    },
    "RemoveFromAlbumTracklistUpdate": {
        "playlist_contents": {
            "track_ids": [
                {"time": 1660927554, "track": 30},
            ]
        }
    },
}

create_playlist_tx_receipts = {
    "CreatePlaylist": [
        {
            "args": AttributeDict(
                {
                    "_entityId": PLAYLIST_ID_OFFSET + 1,
                    "_entityType": "Playlist",
                    "_userId": 1,
                    "_action": "Create",
                    "_metadata": f'{{"cid": "QmCreatePlaylist1", "data": {json.dumps(test_metadata["PlaylistToCreate"])}}}',
                    "_signer": "user1wallet",
                }
            )
        },
    ]
}

update_album_tx_receipts = {
    "UpdateAlbumTracklistUpdate": [
        {
            "args": AttributeDict(
                {
                    "_entityId": PLAYLIST_ID_OFFSET,
                    "_entityType": "Playlist",
                    "_userId": 1,
                    "_action": "Update",
                    "_metadata": f'{{"cid": "AlbumTracklistUpdate", "data": {json.dumps(test_metadata["AlbumTracklistUpdate"])}, "timestamp": {datetime.timestamp(now)}}}',
                    "_signer": "user1wallet",
                }
            )
        }
    ]
}

remove_track_from_album_tx_receipts = {
        "UpdateAlbumTracklistUpdate": [
        {
            "args": AttributeDict(
                {
                    "_entityId": PLAYLIST_ID_OFFSET,
                    "_entityType": "Playlist",
                    "_userId": 1,
                    "_action": "Update",
                    "_metadata": f'{{"cid": "AlbumTracklistUpdate", "data": {json.dumps(test_metadata["AlbumTracklistUpdate"])}, "timestamp": {datetime.timestamp(now)}}}',
                    "_signer": "user1wallet",
                }
            )
        }
    ],
    "RemoveTrackFromAlbumUpdate": [
        {
            "args": AttributeDict(
                {
                    "_entityId": PLAYLIST_ID_OFFSET,
                    "_entityType": "Playlist",
                    "_userId": 1,
                    "_action": "Update",
                    "_metadata": f'{{"cid": "AlbumTracklistUpdate", "data": {json.dumps(test_metadata["RemoveFromAlbumTracklistUpdate"])}, "timestamp": {datetime.timestamp(now)}}}',
                    "_signer": "user1wallet",
                }
            )
        }
    ]
}


restore_removed_track_to_album_tx_receipts = {
    "UpdateAlbumTracklistUpdate": [
        {
            "args": AttributeDict(
                {
                    "_entityId": PLAYLIST_ID_OFFSET,
                    "_entityType": "Playlist",
                    "_userId": 1,
                    "_action": "Update",
                    "_metadata": f'{{"cid": "AlbumTracklistUpdate", "data": {json.dumps(test_metadata["AlbumTracklistUpdate"])}, "timestamp": {datetime.timestamp(now)}}}',
                    "_signer": "user1wallet",
                }
            )
        }
    ],
    "RemoveTrackFromAlbumUpdate": [
        {
            "args": AttributeDict(
                {
                    "_entityId": PLAYLIST_ID_OFFSET,
                    "_entityType": "Playlist",
                    "_userId": 1,
                    "_action": "Update",
                    "_metadata": f'{{"cid": "AlbumTracklistUpdate", "data": {json.dumps(test_metadata["RemoveFromAlbumTracklistUpdate"])}, "timestamp": {datetime.timestamp(now)}}}',
                    "_signer": "user1wallet",
                }
            )
        }
    ],
    "RestoreTrackToAlbum": [
        {
            "args": AttributeDict(
                {
                    "_entityId": PLAYLIST_ID_OFFSET,
                    "_entityType": "Playlist",
                    "_userId": 1,
                    "_action": "Update",
                    "_metadata": f'{{"cid": "AlbumTracklistUpdate", "data": {json.dumps(test_metadata["AlbumTracklistUpdate"])}, "timestamp": {datetime.timestamp(now)}}}',
                    "_signer": "user1wallet",
                }
            )
        }
    ]
}

def setup_db(app, mocker, entities, tx_receipts):
    with app.app_context():
        db = get_db()
        web3 = Web3()
        challenge_event_bus: ChallengeEventBus = setup_challenge_bus()
        update_task = UpdateTask(web3, challenge_event_bus)

    def get_events_side_effect(_, tx_receipt):
        return tx_receipts[tx_receipt["transactionHash"].decode("utf-8")]

    mocker.patch(
        "src.tasks.entity_manager.entity_manager.get_entity_manager_events_tx",
        side_effect=get_events_side_effect,
        autospec=True,
    )

    entity_manager_txs = [
        AttributeDict({"transactionHash": update_task.web3.to_bytes(text=tx_receipt)})
        for tx_receipt in tx_receipts
    ]

    populate_mock_db(db, entities)

    return db, update_task, entity_manager_txs



def test_create_playlist(app, mocker):
    db, update_task, entity_manager_txs = setup_db(app, mocker, entities, create_playlist_tx_receipts)

    with db.scoped_session() as session:
        entity_manager_update(
            update_task,
            session,
            entity_manager_txs,
            block_number=0,
            block_timestamp=1585336422,
            block_hash=hex(0),
        )
        relations: List[PlaylistsTracksRelations] = session.query(
            PlaylistsTracksRelations
        ).all()
        assert len(relations) == 2
        for id in [10, 20]:
            assert any([relation.track_id == id for relation in relations])
        for id in [30, 40]:
            assert not any([relation.track_id == id for relation in relations])



def test_add_tracks_to_playlist(app, mocker):
    db, update_task, entity_manager_txs = setup_db(app, mocker, entities, update_album_tx_receipts)

    with db.scoped_session() as session:
        entity_manager_update(
            update_task,
            session,
            entity_manager_txs,
            block_number=0,
            block_timestamp=1585336422,
            block_hash=hex(0),
        )
        relations: List[PlaylistsTracksRelations] = session.query(
            PlaylistsTracksRelations
        ).all()
        assert len(relations) == 2
        for id in [20, 30]:
            assert any([relation.track_id == id for relation in relations])
        for id in [10, 40]:
            assert not any([relation.track_id == id for relation in relations])


def test_remove_track_from_album(app, mocker):
    db, update_task, entity_manager_txs = setup_db(app, mocker, entities, remove_track_from_album_tx_receipts)

    with db.scoped_session() as session:
        entity_manager_update(
            update_task,
            session,
            entity_manager_txs,
            block_number=0,
            block_timestamp=1585336422,
            block_hash=hex(0),
        )
        relations: List[PlaylistsTracksRelations] = session.query(
            PlaylistsTracksRelations
        ).all()
        assert len(relations) == 2
        assert any([relation.is_delete and relation.track_id == 20 for relation in relations])
        assert any([not relation.is_delete and relation.track_id == 30 for relation in relations])
        # Check for duplicate add
        assert len([relation for relation in relations if relation.track_id == 30]) == 1
        for id in [10, 40]:
            assert not any([relation.track_id == id for relation in relations])


def test_restore_removed_track_to_album(app, mocker):
    db, update_task, entity_manager_txs = setup_db(app, mocker, entities, restore_removed_track_to_album_tx_receipts)

    with db.scoped_session() as session:
        entity_manager_update(
            update_task,
            session,
            entity_manager_txs,
            block_number=0,
            block_timestamp=1585336422,
            block_hash=hex(0),
        )
        relations: List[PlaylistsTracksRelations] = session.query(
            PlaylistsTracksRelations
        ).all()
        assert len(relations) == 2
        for id in [20, 30]:
            assert any([relation.track_id == id and not relation.is_delete for relation in relations])
        for id in [10, 40]:
            assert not any([relation.track_id == id and relation.is_delete for relation in relations])
