from sqlalchemy import Boolean, Column, DateTime, Integer, String, text

from src.models.base import Base
from src.models.model_utils import RepresentableMixin


class PlaylistsTracksRelations(Base, RepresentableMixin):
    __tablename__ = "playlists_tracks_relations"

    playlist_id = Column(String, nullable=False, primary_key=True, index=True)
    track_id = Column(Integer, nullable=False, primary_key=True, index=True)
    is_delete = Column(Boolean, nullable=False)
    created_at = Column(
        DateTime, nullable=False, index=True, server_default=text("CURRENT_TIMESTAMP")
    )
