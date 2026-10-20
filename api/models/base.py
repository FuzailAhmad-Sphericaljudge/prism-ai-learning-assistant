import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime
from api.database import Base


def utc_now():
    return datetime.now(timezone.utc)


def generate_uuid() -> str:
    return str(uuid.uuid4())


class UUIDMixin:
    id = Column(
        String(36),
        primary_key=True,
        default=generate_uuid,
        index=True,
        nullable=False,
    )


# Alias for compatibility
UUIDPrimaryKeyMixin = UUIDMixin


class TimestampMixin:
    created_at = Column(
        DateTime(timezone=True),
        default=utc_now,
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )
