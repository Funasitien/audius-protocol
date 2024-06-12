from flask_restx import fields

from src.api.v1.models.extensions.fields import NestedOneOf
from src.api.v1.models.tracks import track_full
from src.api.v1.models.users import user_model, user_model_full

from .access_gate import access_gate, extended_access_gate
from .common import favorite, ns, repost

playlist_artwork = ns.model(
    "playlist_artwork",
    {
        "150x150": fields.String,
        "480x480": fields.String,
        "1000x1000": fields.String,
    },
)

access = ns.model(
    "access",
    {"stream": fields.Boolean, "download": fields.Boolean},
)

playlist_added_timestamp = ns.model(
    "playlist_added_timestamp",
    {
        "metadata_timestamp": fields.Integer(required=True),
        "timestamp": fields.Integer(required=True),
        "track_id": fields.String(required=True),
    },
)
playlist_model = ns.model(
    "playlist",
    {
        "artwork": fields.Nested(playlist_artwork, allow_null=True),
        "description": fields.String,
        "permalink": fields.String,
        "id": fields.String(required=True),
        "is_album": fields.Boolean(required=True),
        "is_image_autogenerated": fields.Boolean(required=True),
        "playlist_name": fields.String(required=True),
        "playlist_contents": fields.List(
            fields.Nested(playlist_added_timestamp), required=True
        ),
        "repost_count": fields.Integer(required=True),
        "favorite_count": fields.Integer(required=True),
        "total_play_count": fields.Integer(required=True),
        "user": fields.Nested(user_model, required=True),
        "ddex_app": fields.String(allow_null=True),
        "access": fields.Nested(access),
        "upc": fields.String(allow_null=True),
    },
)

full_playlist_without_tracks_model = ns.clone(
    "playlist_full_without_tracks",
    playlist_model,
    {
        "blocknumber": fields.Integer(required=True),
        "created_at": fields.String,
        "followee_reposts": fields.List(fields.Nested(repost), required=True),
        "followee_favorites": fields.List(fields.Nested(favorite), required=True),
        "has_current_user_reposted": fields.Boolean(required=True),
        "has_current_user_saved": fields.Boolean(required=True),
        "is_delete": fields.Boolean(required=True),
        "is_private": fields.Boolean(required=True),
        "updated_at": fields.String,
        "added_timestamps": fields.List(
            fields.Nested(playlist_added_timestamp), required=True
        ),
        "user_id": fields.String(required=True),
        "user": fields.Nested(user_model_full, required=True),
        "tracks": fields.List(fields.Nested(track_full), required=False),
        "cover_art": fields.String,
        "cover_art_sizes": fields.String,
        "cover_art_cids": fields.Nested(playlist_artwork, allow_null=True),
        "track_count": fields.Integer(required=True),
        "is_stream_gated": fields.Boolean(required=True),
        "stream_conditions": NestedOneOf(
            access_gate,
            allow_null=True,
            description="How to unlock stream access to the track",
        ),
        "is_scheduled_release": fields.Boolean,
        "release_date": fields.String,
    },
)

full_playlist_model = ns.clone(
    "playlist_full",
    full_playlist_without_tracks_model,
    {
        "tracks": fields.List(fields.Nested(track_full), required=True),
    },
)

album_access_info = ns.model(
    "album_access_info",
    {
        "access": fields.Nested(
            access, description="Describes what access the given user has"
        ),
        "user_id": fields.String(
            required=True, description="The user ID of the owner of this album"
        ),
        "blocknumber": fields.Integer(
            required=True, description="The blocknumber this album was last updated"
        ),
        "is_stream_gated": fields.Boolean(
            description="Whether or not the owner has restricted streaming behind an access gate"
        ),
        "stream_conditions": NestedOneOf(
            extended_access_gate,
            allow_null=True,
            description="How to unlock stream access to the track",
        ),
    },
)
