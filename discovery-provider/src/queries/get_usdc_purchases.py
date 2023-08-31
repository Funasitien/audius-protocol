from typing import List, Optional, TypedDict

from sqlalchemy import asc, desc, or_

from src.models.playlists.playlist import Playlist
from src.models.tracks.track import Track
from src.models.users.usdc_purchase import PurchaseType, USDCPurchase
from src.models.users.user import User
from src.queries.query_helpers import (
    PurchaseSortMethod,
    SortDirection,
    add_query_pagination,
)
from src.utils import helpers
from src.utils.db_session import get_db_read_replica


class GetUSDCPurchasesArgs(TypedDict):
    seller_user_id: Optional[int]
    buyer_user_id: Optional[int]
    content_ids: Optional[List[int]]
    content_type: Optional[PurchaseType]
    limit: int
    offset: int
    sort_method: Optional[PurchaseSortMethod]
    sort_direction: Optional[SortDirection]


def _get_usdc_purchases(session, args: GetUSDCPurchasesArgs):
    base_query = session.query(USDCPurchase)
    buyer_user_id = args.get("buyer_user_id")
    seller_user_id = args.get("seller_user_id")
    content_ids = args.get("content_ids")
    content_type = args.get("content_type")
    sort_method = args.get("sort_method", PurchaseSortMethod.date)
    sort_direction = args.get("sort_direction", SortDirection.desc)
    limit = args.get("limit")
    offset = args.get("offset")

    # Basic filters
    if content_ids:
        base_query = base_query.filter(USDCPurchase.content_id == content_ids)
    if buyer_user_id:
        base_query = base_query.filter(USDCPurchase.buyer_user_id == buyer_user_id)
    if seller_user_id:
        base_query = base_query.filter(USDCPurchase.seller_user_id == seller_user_id)
    if content_type:
        base_query = base_query.filter(USDCPurchase.content_type == content_type)

    sort_fn = desc if sort_direction == SortDirection.desc else asc
    if sort_method != PurchaseSortMethod.date:
        # If we're sorting by content related fields we need to join to get those fields
        # First get the playlists
        playlists_query = (
            base_query.filter(
                or_(
                    USDCPurchase.content_type == PurchaseType.playlist,
                    USDCPurchase.content_type == PurchaseType.album,
                )
            )
            .join(Playlist, Playlist.playlist_id == USDCPurchase.content_id)
            .filter(Playlist.is_current == True)
            .add_columns(
                Playlist.playlist_name.label("content_title"),
                Playlist.playlist_owner_id.label("owner_id"),
            )
        )
        # Then the tracks
        tracks_query = (
            base_query.filter(USDCPurchase.content_type == PurchaseType.track)
            .join(Track, Track.track_id == USDCPurchase.content_id)
            .filter(Track.is_current == True)
            .add_columns(
                Track.title.label("content_title"),
                Track.owner_id.label("owner_id"),
            )
        )
        if content_type == PurchaseType.track:
            # Just tracks
            subquery = tracks_query.subquery(name="track_subquery")
        elif (
            content_type == PurchaseType.album or content_type == PurchaseType.playlist
        ):
            # Just playlists
            subquery = playlists_query.subquery(name="playlist_subquery")
        else:
            # Union them together
            subquery = playlists_query.union(tracks_query).subquery(
                name="union_subquery"
            )
        # Select the purchase entities from our subquery, sorting by the extra fields we added
        if sort_method == PurchaseSortMethod.artist_name:
            # Also get users as necessary
            base_query = (
                session.query(USDCPurchase)
                .select_entity_from(subquery)
                .join(User, User.user_id == subquery.c.owner_id)
                .filter(User.is_current == True)
                .order_by(sort_fn(User.name), sort_fn(USDCPurchase.created_at))
            )
        elif sort_method == PurchaseSortMethod.content_title:
            base_query = (
                session.query(USDCPurchase)
                .select_entity_from(subquery)
                .order_by(
                    sort_fn(subquery.c.content_title),
                    sort_fn(USDCPurchase.created_at),
                )
            )
    else:
        base_query = base_query.order_by(sort_fn(USDCPurchase.created_at))

    results = add_query_pagination(base_query, limit, offset).all()
    return helpers.query_result_to_list(results)


def get_usdc_purchases(args: GetUSDCPurchasesArgs):
    """Gets all the USDC purchase entries fitting the given criteria.

    Does not include any other entity metadatas (no tracks, users, playlists)."""
    db = get_db_read_replica()
    with db.scoped_session() as session:
        return _get_usdc_purchases(session, args)
