import json
import time
from typing import Optional, TypedDict, Union, cast

from src.exceptions import IndexingValidationError
from src.models.dashboard_wallet_user.dashboard_wallet_user import DashboardWalletUser
from src.tasks.entity_manager.utils import (
    Action,
    EntityType,
    ManageEntityParameters,
    copy_record,
    get_address_from_signature,
)
from src.utils.helpers import decode_string_id
from src.utils.indexing_errors import EntityMissingRequiredFieldError
from src.utils.model_nullable_validator import all_required_fields_present
from src.utils.structured_logger import StructuredLogger

logger = StructuredLogger(__name__)


class Signature(TypedDict):
    message: str
    signature: str


class CreateDashboardWalletUserMetadata(TypedDict):
    wallet_signature: Union[Signature, None]
    wallet: Union[str, None]


class DeleteDashboardWalletUserMetadata(TypedDict):
    wallet: Union[str, None]


def is_within_5_minutes(timestamp_str):
    current_timestamp = int(time.time())
    input_timestamp = int(timestamp_str)
    time_difference = abs(current_timestamp - input_timestamp)
    return time_difference < 5 * 60


def matches_user_id(hash_or_int_id, int_id):
    return hash_or_int_id == str(int_id) or decode_string_id(hash_or_int_id) == int_id


def get_create_dashboard_wallet_user_metadata_from_raw(
    raw_metadata: Optional[str],
) -> Optional[CreateDashboardWalletUserMetadata]:
    metadata: CreateDashboardWalletUserMetadata = {
        "wallet": None,
        "wallet_signature": None,
    }
    if raw_metadata:
        try:
            json_metadata = json.loads(raw_metadata)

            metadata["wallet_signature"] = json_metadata.get("wallet_signature", None)
            raw_wallet = json_metadata.get("wallet", None)
            if raw_wallet:
                metadata["wallet"] = raw_wallet.lower()

            return metadata
        except Exception as e:
            logger.error(
                f"entity_manager | developer_app.py | Unable to parse dashboard wallet user metadata while indexing: {e}"
            )
            return None
    return metadata


def get_delete_dashboard_wallet_user_metadata_from_raw(
    raw_metadata: Optional[str],
) -> Optional[DeleteDashboardWalletUserMetadata]:
    metadata: DeleteDashboardWalletUserMetadata = {"wallet": None}
    if raw_metadata:
        try:
            json_metadata = json.loads(raw_metadata)

            raw_wallet = json_metadata.get("wallet", None)
            if raw_wallet:
                metadata["wallet"] = raw_wallet.lower()

            return metadata
        except Exception as e:
            logger.error(
                f"entity_manager | developer_app.py | Unable to parse dashboard wallet user metadata while indexing: {e}"
            )
            return None
    return metadata


def validate_dashboard_wallet_user_tx(params: ManageEntityParameters, metadata):
    user_id = params.user_id
    dashboard_wallet = metadata["wallet"]

    if params.entity_type != EntityType.DASHBOARD_WALLET_USER:
        raise IndexingValidationError(
            f"Invalid Dashboard Wallet User Transaction, wrong entity type {params.entity_type}"
        )
    if not dashboard_wallet:
        raise IndexingValidationError(
            f"Invalid {params.action} Dashboard Wallet User Transaction, dashboard wallet address is required and was not provided"
        )
    if not user_id:
        raise IndexingValidationError(
            f"Invalid {params.action} Dashboard Wallet User Transaction, user id is required and was not provided"
        )
    if user_id not in params.existing_records["User"]:
        raise IndexingValidationError(
            f"Invalid {params.action} Dashboard Wallet User Transaction, user id {user_id} does not exist"
        )

    user_wallet = params.existing_records["User"][user_id].wallet
    user_matches_signer = user_wallet and user_wallet.lower() == params.signer.lower()
    if params.action == Action.DELETE:
        if dashboard_wallet not in params.existing_records["DashboardWalletUser"]:
            raise IndexingValidationError(
                f"Invalid Delete Dashboard Wallet User Transaction, dashboard wallet user with wallet {dashboard_wallet} does not exist"
            )
        # Either the user or the dashboard wallet can sign the Delete tx
        if not user_matches_signer and not params.signer.lower() == dashboard_wallet:
            raise IndexingValidationError(
                "Invalid Delete Dashboard Wallet User Transaction, signature does not match user or dashboard wallet"
            )
        # If the user is the one who signed the tx, make sure it matches the user id assigned to the wallet
        if (
            user_matches_signer
            and not user_id
            == params.existing_records["DashboardWalletUser"][dashboard_wallet].user_id
        ):
            raise IndexingValidationError(
                "Invalid Delete Dashboard Wallet User Transaction, user is not assigned to this wallet"
            )
    elif params.action == Action.CREATE:
        if not user_matches_signer:
            raise IndexingValidationError(
                "Invalid Create Dashboard Wallet User Transaction, signature does not match user"
            )
        if not metadata["wallet_signature"]:
            raise IndexingValidationError(
                "Invalid Create Dashboard Wallet User Transaction, wallet signature is required and was not provided"
            )
        if (
            dashboard_wallet in params.existing_records["DashboardWalletUser"]
            and params.existing_records["DashboardWalletUser"][
                dashboard_wallet
            ].is_delete
            == False
        ):
            raise IndexingValidationError(
                f"Invalid Create Dashboard Wallet User Transaction, dashboard wallet {dashboard_wallet} already has an assigned user"
            )
        # Expect wallet_signature message to be "Connecting Audius user id {user hash id} at {timestamp}"
        if (
            not isinstance(metadata["wallet_signature"], dict)
            or not metadata["wallet_signature"]
            .get("message", "")
            .startswith("Connecting Audius user id")
            or not matches_user_id(
                (metadata["wallet_signature"].get("message", "").split()[-3]), user_id
            )
            or not is_within_5_minutes(
                (metadata["wallet_signature"].get("message", "").split())[-1]
            )
        ):
            raise IndexingValidationError(
                "Invalid Create Dashboard Wallet Transaction, wallet signature provided does not have correct message"
            )
        try:
            signature_address = get_address_from_signature(metadata["wallet_signature"])
        except:
            raise IndexingValidationError(
                "Invalid Create Dashboard Wallet User Transaction, signature provided is invalid"
            )
        if not signature_address or not signature_address.lower() == dashboard_wallet:
            raise IndexingValidationError(
                "Invalid Create Dashboard Wallet User Transaction, signature provided is invalid"
            )
    else:
        raise IndexingValidationError(
            f"Invalid Dashboard Wallet User Transaction, action {params.action} is not valid"
        )


def validate_dashboard_wallet_user_record(dashboard_wallet_user):
    if not all_required_fields_present(DashboardWalletUser, dashboard_wallet_user):
        raise EntityMissingRequiredFieldError(
            "dashboard_wallet_user",
            dashboard_wallet_user,
            f"Error parsing {dashboard_wallet_user} with entity missing required field(s)",
        )

    return dashboard_wallet_user


def create_dashboard_wallet_user(params: ManageEntityParameters):
    metadata = get_create_dashboard_wallet_user_metadata_from_raw(params.metadata)
    if not metadata:
        raise IndexingValidationError(
            "Invalid Dashboard Wallet User Transaction, unable to parse metadata"
        )
    validate_dashboard_wallet_user_tx(params, metadata)
    user_id = params.user_id
    dashboard_wallet = metadata["wallet"]

    dashboard_wallet_user_record = DashboardWalletUser(
        user_id=user_id,
        wallet=cast(
            str, dashboard_wallet
        ),  # cast to assert non null (since we validated above)
        txhash=params.txhash,
        blockhash=params.event_blockhash,
        blocknumber=params.block_number,
        updated_at=params.block_datetime,
        created_at=params.block_datetime,
    )

    validate_dashboard_wallet_user_record(dashboard_wallet_user_record)
    params.add_record(dashboard_wallet, dashboard_wallet_user_record)
    return dashboard_wallet_user_record


def delete_dashboard_wallet_user(params: ManageEntityParameters):
    metadata = get_delete_dashboard_wallet_user_metadata_from_raw(params.metadata)
    if not metadata:
        raise IndexingValidationError(
            "Invalid Dashboard Wallet User Transaction, unable to parse metadata"
        )
    validate_dashboard_wallet_user_tx(params, metadata)
    dashboard_wallet = cast(str, metadata["wallet"])
    existing_dashboard_wallet_user = params.existing_records["DashboardWalletUser"][
        dashboard_wallet
    ]
    if dashboard_wallet in params.new_records["DashboardWalletUser"]:
        existing_dashboard_wallet_user = params.new_records["DashboardWalletUser"][
            dashboard_wallet
        ][-1]

    deleted_dashboard_wallet_user = copy_record(
        existing_dashboard_wallet_user,
        params.block_number,
        params.event_blockhash,
        params.txhash,
        params.block_datetime,
    )

    deleted_dashboard_wallet_user.is_delete = True

    validate_dashboard_wallet_user_record(deleted_dashboard_wallet_user)
    params.add_record(dashboard_wallet, deleted_dashboard_wallet_user)
    return deleted_dashboard_wallet_user
