import json
import urllib.parse
from typing import Dict, Optional, TypedDict

from src.models.tracks.track import Track
from src.premium_content.premium_content_access_checker import (
    premium_content_access_checker,
)
from src.premium_content.signature import get_premium_content_signature
from src.queries.get_authed_user import get_authed_user


class GetTrackStreamSignature(TypedDict):
    track: Track
    user_data: Optional[str]
    user_signature: Optional[str]
    premium_content_signature: Optional[str]


def get_track_stream_signature(args: Dict):
    track = args["track"]

    if not track["is_premium"]:
        return get_premium_content_signature(
            {
                "id": track["track_id"],
                # todo: use encoding of track cid
                # "id": track["track_cid"],
                "type": "track",
                "is_premium": False,
            }
        )

    # if the track is premium, make sure that the requesting user has access
    user_data = args["user_data"]
    user_signature = args["user_signature"]
    if not user_data or not user_signature:
        return None

    auther_user = get_authed_user(user_data, user_signature)
    if not auther_user:
        return None

    premium_content_signature = args["premium_content_signature"]
    if premium_content_signature:
        # check that authed user is the same as user for whom the premium content signature was signed
        premium_content_signature_obj = json.loads(
            urllib.parse.unquote(premium_content_signature)
        )
        signature_data = json.loads(premium_content_signature_obj["data"])
        if (
            signature_data.get("user_wallet", False) != auther_user["user_wallet"]
            or signature_data.get("premium_content_id", False) != track["track_id"]
            # or signature_data.get("premium_content_id", False) != track["track_cid"]
            or signature_data.get("premium_content_type", False) != "track"
        ):
            return None
    else:
        access = premium_content_access_checker.check_access(
            user_id=auther_user["user_id"],
            premium_content_id=track["track_id"],
            premium_content_type="track",
            premium_content_entity=track,
        )
        if not access["does_user_have_access"]:
            return None

    return get_premium_content_signature(
        {
            "id": track["track_id"],
            # todo: use encoding of track cid
            # "id": track["track_cid"],
            "type": "track",
            "is_premium": True,
        }
    )
