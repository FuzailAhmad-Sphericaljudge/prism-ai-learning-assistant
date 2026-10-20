"""phase7_interview_educator

Revision ID: 004_phase7_interview_educator
Revises: 003_phase6_practice_mastery
Create Date: 2026-10-20 21:50:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '004_phase7_interview_educator'
down_revision: Union[str, None] = '003_phase6_practice_mastery'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Update interview_sessions table
    op.add_column('interview_sessions', sa.Column('role', sa.String(length=255), nullable=True))
    op.add_column('interview_sessions', sa.Column('topic', sa.String(length=255), nullable=True))
    op.add_column('interview_sessions', sa.Column('current_round', sa.Integer(), server_default='0', nullable=False))
    op.add_column('interview_sessions', sa.Column('max_rounds', sa.Integer(), server_default='3', nullable=False))
    op.add_column('interview_sessions', sa.Column('report_json', sa.JSON(), nullable=True))

    # 2. Update interview_exchanges table
    op.add_column('interview_exchanges', sa.Column('round_number', sa.Integer(), server_default='1', nullable=False))
    op.add_column('interview_exchanges', sa.Column('justification', sa.Text(), nullable=True))
    op.add_column('interview_exchanges', sa.Column('evaluation', sa.JSON(), nullable=True))


def downgrade() -> None:
    # Downgrade interview_exchanges
    op.drop_column('interview_exchanges', 'evaluation')
    op.drop_column('interview_exchanges', 'justification')
    op.drop_column('interview_exchanges', 'round_number')

    # Downgrade interview_sessions
    op.drop_column('interview_sessions', 'report_json')
    op.drop_column('interview_sessions', 'max_rounds')
    op.drop_column('interview_sessions', 'current_round')
    op.drop_column('interview_sessions', 'topic')
    op.drop_column('interview_sessions', 'role')
