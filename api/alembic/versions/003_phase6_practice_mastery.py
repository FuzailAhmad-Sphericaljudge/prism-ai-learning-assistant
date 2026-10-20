"""phase6_practice_mastery

Revision ID: 003_phase6_practice_mastery
Revises: 002_phase4_session_mode
Create Date: 2026-10-20 18:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '003_phase6_practice_mastery'
down_revision: Union[str, None] = '002_phase4_session_mode'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Update attempts table for standalone practice & multimodal evidence tracking
    op.alter_column('attempts', 'session_id', existing_type=sa.String(length=36), nullable=True)
    op.alter_column('attempts', 'diagnostic_id', existing_type=sa.String(length=100), nullable=True)
    
    op.add_column('attempts', sa.Column('user_id', sa.String(length=36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=True))
    op.add_column('attempts', sa.Column('course_id', sa.String(length=36), sa.ForeignKey('courses.id', ondelete='CASCADE'), nullable=True))
    op.add_column('attempts', sa.Column('concept_tag', sa.String(length=255), nullable=True))
    op.add_column('attempts', sa.Column('question_type', sa.String(length=50), server_default='mcq', nullable=False))
    op.add_column('attempts', sa.Column('options', sa.JSON(), nullable=True))
    op.add_column('attempts', sa.Column('feedback', sa.Text(), nullable=True))
    op.add_column('attempts', sa.Column('revision_action', sa.JSON(), nullable=True))
    op.add_column('attempts', sa.Column('linked_evidence', sa.JSON(), nullable=True))

    op.create_index('ix_attempts_user_id', 'attempts', ['user_id'])
    op.create_index('ix_attempts_course_id', 'attempts', ['course_id'])
    op.create_index('ix_attempts_concept_tag', 'attempts', ['concept_tag'])

    # 2. Update mastery_records table for derived assessed evidence states
    op.add_column('mastery_records', sa.Column('status', sa.String(length=50), server_default='not_assessed', nullable=False))
    op.add_column('mastery_records', sa.Column('correct_count', sa.Integer(), server_default='0', nullable=False))
    op.add_column('mastery_records', sa.Column('last_assessed_at', sa.DateTime(timezone=True), nullable=True))

    op.create_index('ix_mastery_records_status', 'mastery_records', ['status'])


def downgrade() -> None:
    op.drop_index('ix_mastery_records_status', table_name='mastery_records')
    op.drop_column('mastery_records', 'last_assessed_at')
    op.drop_column('mastery_records', 'correct_count')
    op.drop_column('mastery_records', 'status')

    op.drop_index('ix_attempts_concept_tag', table_name='attempts')
    op.drop_index('ix_attempts_course_id', table_name='attempts')
    op.drop_index('ix_attempts_user_id', table_name='attempts')

    op.drop_column('attempts', 'linked_evidence')
    op.drop_column('attempts', 'revision_action')
    op.drop_column('attempts', 'feedback')
    op.drop_column('attempts', 'options')
    op.drop_column('attempts', 'question_type')
    op.drop_column('attempts', 'concept_tag')
    op.drop_column('attempts', 'course_id')
    op.drop_column('attempts', 'user_id')

    op.alter_column('attempts', 'diagnostic_id', existing_type=sa.String(length=100), nullable=False)
    op.alter_column('attempts', 'session_id', existing_type=sa.String(length=36), nullable=False)
