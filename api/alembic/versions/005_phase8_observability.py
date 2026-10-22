"""phase8_observability

Revision ID: 005_phase8_observability
Revises: 004_phase7_interview_educator
Create Date: 2026-10-22 13:30:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '005_phase8_observability'
down_revision: Union[str, None] = '004_phase7_interview_educator'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'evaluation_records',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('trace_id', sa.String(length=64), nullable=False),
        sa.Column('request_id', sa.String(length=64), nullable=True),
        sa.Column('session_id', sa.String(length=36), nullable=True),
        sa.Column('message_id', sa.String(length=36), nullable=True),
        sa.Column('query', sa.Text(), nullable=False),
        sa.Column('latency_ms', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('playback_sec', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('mode', sa.String(length=32), nullable=False, server_default='learn_so_far'),
        sa.Column('citation_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('admitted_chunks', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('blocked_chunks', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('validation_passed', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('leakage_detected', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('diagnostic_generated', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('eval_metadata', sa.JSON(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_evaluation_records_trace_id'), 'evaluation_records', ['trace_id'], unique=False)
    op.create_index(op.f('ix_evaluation_records_session_id'), 'evaluation_records', ['session_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_evaluation_records_session_id'), table_name='evaluation_records')
    op.drop_index(op.f('ix_evaluation_records_trace_id'), table_name='evaluation_records')
    op.drop_table('evaluation_records')
