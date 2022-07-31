from typing import List

from integration_tests.challenges.index_helpers import UpdateTask
from integration_tests.utils import populate_mock_db
from src.models.playlists.playlist import Playlist
from src.tasks.audius_data import audius_data_state_update
from src.utils.db_session import get_db
from web3 import Web3
from web3.datastructures import AttributeDict


def test_index_valid_playlists(app, mocker):
    "Tests valid batch of playlists create/update/delete actions"

    # setup db and mocked txs
    with app.app_context():
        db = get_db()
        web3 = Web3()
        update_task = UpdateTask(None, web3, None)

    tx_receipts = {
        "CreatePlaylist1Tx": [
            {
                "args": AttributeDict(
                    {
                        "_entityId": 1,
                        "_entityType": "Playlist",
                        "_userId": 1,
                        "_action": "Create",
                        "_metadata": "QmCreatePlaylist1",
                        "_signer": "User1Wallet",
                    }
                )
            },
        ],
        "UpdatePlaylist1Tx": [
            {
                "args": AttributeDict(
                    {
                        "_entityId": 1,
                        "_entityType": "Playlist",
                        "_userId": 1,
                        "_action": "Update",
                        "_metadata": "QmUpdatePlaylist1",
                        "_signer": "User1Wallet",
                    }
                )
            },
        ],
        "DeletePlaylist1Tx": [
            {
                "args": AttributeDict(
                    {
                        "_entityId": 1,
                        "_entityType": "Playlist",
                        "_userId": 1,
                        "_action": "Delete",
                        "_metadata": "",
                        "_signer": "User1Wallet",
                    }
                )
            },
        ],
        "CreatePlaylist2Tx": [
            {
                "args": AttributeDict(
                    {
                        "_entityId": 2,
                        "_entityType": "Playlist",
                        "_userId": 1,
                        "_action": "Create",
                        "_metadata": "QmCreatePlaylist2",
                        "_signer": "User1Wallet",
                    }
                )
            },
        ],
    }

    audius_data_txs = [
        AttributeDict({"transactionHash": update_task.web3.toBytes(text=tx_receipt)})
        for tx_receipt in tx_receipts
    ]

    def get_events_side_effect(_, tx_receipt):
        return tx_receipts[tx_receipt.transactionHash.decode("utf-8")]

    mocker.patch(
        "src.tasks.audius_data.get_audius_data_events_tx",
        side_effect=get_events_side_effect,
        autospec=True,
    )
    test_metadata = {
        "QmCreatePlaylist1": {
            "playlist_contents": {"track_ids": []},
            "description": "",
            "playlist_image_sizes_multihash": "",
            "playlist_name": "playlist 1",
        },
        "QmCreatePlaylist2": {
            "playlist_contents": {"track_ids": []},
            "description": "test description",
            "playlist_image_sizes_multihash": "",
            "playlist_name": "playlist 2",
        },
        "QmUpdatePlaylist1": {
            "playlist_contents": {"track_ids": []},
            "description": "",
            "playlist_image_sizes_multihash": "",
            "playlist_name": "playlist 1 updated",
        },
    }

    entities = {
        "users": [
            {"user_id": 1, "handle": "user-1", "wallet": "User1Wallet"},
        ]
    }
    populate_mock_db(db, entities)

    with db.scoped_session() as session:
        # index transactions
        audius_data_state_update(
            None,
            update_task,
            session,
            audius_data_txs,
            block_number=0,
            block_timestamp=1585336422,
            block_hash=0,
            ipfs_metadata=test_metadata,
        )

        # validate db records
        all_playlists: List[Playlist] = session.query(Playlist).all()
        assert len(all_playlists) == 4

        playlist_1: Playlist = (
            session.query(Playlist)
            .filter(Playlist.is_current == True, Playlist.playlist_id == 1)
            .first()
        )
        assert playlist_1.playlist_name == "playlist 1 updated"
        assert playlist_1.is_delete == True

        playlist_2: Playlist = (
            session.query(Playlist)
            .filter(Playlist.is_current == True, Playlist.playlist_id == 2)
            .first()
        )
        assert playlist_2.playlist_name == "playlist 2"
        assert playlist_2.is_delete == False


def test_index_invalid_playlists(app, mocker):
    "Tests invalid batch of playlists create/update/delete actions"

    # setup db and mocked txs
    with app.app_context():
        db = get_db()
        web3 = Web3()
        update_task = UpdateTask(None, web3, None)

    tx_receipts = {
        # invalid create
        "CreatePlaylistInvalidOwnership": [
            {
                "args": AttributeDict(
                    {
                        "_entityId": 1,
                        "_entityType": "Playlist",
                        "_userId": 1,
                        "_action": "Create",
                        "_metadata": "",
                        "_signer": "InvalidWallet",
                    }
                )
            },
        ],
        "CreatePlaylistAlreadyExists": [
            {
                "args": AttributeDict(
                    {
                        "_entityId": 1,
                        "_entityType": "Playlist",
                        "_userId": 1,
                        "_action": "Create",
                        "_metadata": "",
                        "_signer": "User1Wallet",
                    }
                )
            },
        ],
        # invalid updates
        "UpdatePlaylistInvalidOwnership": [
            {
                "args": AttributeDict(
                    {
                        "_entityId": 1,
                        "_entityType": "Playlist",
                        "_userId": 1,
                        "_action": "Update",
                        "_metadata": "",
                        "_signer": "InvalidWallet",
                    }
                )
            },
        ],
        "UpdatePlaylistDoesNotExist": [
            {
                "args": AttributeDict(
                    {
                        "_entityId": 2,
                        "_entityType": "Playlist",
                        "_userId": 1,
                        "_action": "Update",
                        "_metadata": "",
                        "_signer": "User1Wallet",
                    }
                )
            },
        ],
        # invalid deletes
        "DeletePlaylistInvalidOwnership": [
            {
                "args": AttributeDict(
                    {
                        "_entityId": 1,
                        "_entityType": "Playlist",
                        "_userId": 1,
                        "_action": "Delete",
                        "_metadata": "",
                        "_signer": "InvalidWallet",
                    }
                )
            },
        ],
        "DeletePlaylistDoesNotExist": [
            {
                "args": AttributeDict(
                    {
                        "_entityId": 2,
                        "_entityType": "Playlist",
                        "_userId": 1,
                        "_action": "Update",
                        "_metadata": "",
                        "_signer": "User1Wallet",
                    }
                )
            },
        ],
    }

    audius_data_txs = [
        AttributeDict({"transactionHash": update_task.web3.toBytes(text=tx_receipt)})
        for tx_receipt in tx_receipts
    ]

    def get_events_side_effect(_, tx_receipt):
        return tx_receipts[tx_receipt.transactionHash.decode("utf-8")]

    mocker.patch(
        "src.tasks.audius_data.get_audius_data_events_tx",
        side_effect=get_events_side_effect,
        autospec=True,
    )

    entities = {
        "users": [
            {"user_id": 1, "handle": "user-1", "wallet": "User1Wallet"},
        ],
        "playlists": [
            {"playlist_id": 1, "playlist_owner_id": 1},
        ],
    }
    populate_mock_db(db, entities)

    with db.scoped_session() as session:
        # index transactions
        audius_data_state_update(
            None,
            update_task,
            session,
            audius_data_txs,
            block_number=0,
            block_timestamp=1585336422,
            block_hash=0,
            ipfs_metadata={},
        )

        # validate db records
        all_playlists: List[Playlist] = session.query(Playlist).all()
        assert len(all_playlists) == 1  # no new playlists indexed
