"""Phase 4 Session Mode and Message Explored Ahead

Revision ID: 002_phase4_session_mode
Revises: 001_phase2_initial_schema
Create Date: 2026-10-20 16:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '002_phase4_session_mode'
down_revision = '001_phase2_initial_schema'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add mode to sessions table
    op.add_column(
        'sessions',
        sa.Column('mode', sa.String(length=50), nullable=False, server_default='learn_so_far')
    )
    # Add explored_ahead to messages table
    op.add_column(
        'messages',
        sa.Column('explored_ahead', sa.Boolean(), nullable=False, server_default='false')
    )


def downgrade() -> None:
    op.drop_column('messages', 'explored_ahead')
    op.drop_column('sessions', 'mode')
