"""Phase 2 Initial Schema with pgvector and GIN tsvector index

Revision ID: 001_phase2_initial_schema
Revises: 
Create Date: 2026-10-20 11:55:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import TSVECTOR
from pgvector.sqlalchemy import Vector

# revision identifiers, used by Alembic.
revision = '001_phase2_initial_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Enable pgvector extension and clean legacy empty tables if needed
    op.execute("CREATE EXTENSION IF NOT EXISTS vector;")
    op.execute("DROP TABLE IF EXISTS interview_exchanges CASCADE;")

    # 2. Courses Table
    op.create_table(
        'courses',
        sa.Column('id', sa.String(length=36), primary_key=True, nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False, index=True),
        sa.Column('code', sa.String(length=50), nullable=False, index=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('instructor', sa.String(length=255), nullable=False, server_default='Faculty Instructor'),
        sa.Column('term', sa.String(length=50), nullable=True, server_default='Fall 2026'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # 3. Sources Table
    op.create_table(
        'sources',
        sa.Column('id', sa.String(length=36), primary_key=True, nullable=False),
        sa.Column('course_id', sa.String(length=36), sa.ForeignKey('courses.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('type', sa.String(length=50), nullable=False, index=True),  # 'video' | 'pdf' | 'ppt' | 'notes'
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('file_path', sa.String(length=512), nullable=True),
        sa.Column('version', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='pending', index=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('duration_sec', sa.Float(), nullable=True),
        sa.Column('page_count', sa.Integer(), nullable=True),
        sa.Column('meta', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint('course_id', 'title', 'version', name='uq_source_course_title_version'),
    )

    # 4. Chunks Table (pgvector 768-dim + TSVECTOR with GIN index)
    op.create_table(
        'chunks',
        sa.Column('id', sa.String(length=36), primary_key=True, nullable=False),
        sa.Column('source_id', sa.String(length=36), sa.ForeignKey('sources.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('start_sec', sa.Float(), nullable=True, index=True),
        sa.Column('end_sec', sa.Float(), nullable=True, index=True),
        sa.Column('page', sa.Integer(), nullable=True, index=True),
        sa.Column('slide', sa.Integer(), nullable=True, index=True),
        sa.Column('embedding', Vector(768), nullable=True),
        sa.Column('tsv', TSVECTOR, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_chunks_tsv_gin', 'chunks', ['tsv'], postgresql_using='gin')
    op.create_index('ix_chunks_source_time', 'chunks', ['source_id', 'start_sec', 'end_sec'])

    # 5. Users Table
    op.create_table(
        'users',
        sa.Column('id', sa.String(length=36), primary_key=True, nullable=False),
        sa.Column('email', sa.String(length=255), unique=True, nullable=False, index=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False, server_default='student'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # 6. Sessions Table
    op.create_table(
        'sessions',
        sa.Column('id', sa.String(length=36), primary_key=True, nullable=False),
        sa.Column('user_id', sa.String(length=36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('course_id', sa.String(length=36), sa.ForeignKey('courses.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('current_playback_sec', sa.Float(), nullable=False, server_default='0.0', index=True),
        sa.Column('title', sa.String(length=255), nullable=True, server_default='Interactive Lecture Session'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # 7. Messages Table
    op.create_table(
        'messages',
        sa.Column('id', sa.String(length=36), primary_key=True, nullable=False),
        sa.Column('session_id', sa.String(length=36), sa.ForeignKey('sessions.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('role', sa.String(length=50), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('playback_sec', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('citations', sa.JSON(), nullable=True),
        sa.Column('is_firewalled', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # 8. Attempts Table
    op.create_table(
        'attempts',
        sa.Column('id', sa.String(length=36), primary_key=True, nullable=False),
        sa.Column('session_id', sa.String(length=36), sa.ForeignKey('sessions.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('diagnostic_id', sa.String(length=100), nullable=False, index=True),
        sa.Column('question_text', sa.Text(), nullable=False),
        sa.Column('user_answer', sa.Text(), nullable=False),
        sa.Column('is_correct', sa.Boolean(), nullable=False),
        sa.Column('misconception_tag', sa.String(length=100), nullable=True, index=True),
        sa.Column('explanation', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # 9. Mastery Records Table
    op.create_table(
        'mastery_records',
        sa.Column('id', sa.String(length=36), primary_key=True, nullable=False),
        sa.Column('user_id', sa.String(length=36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('course_id', sa.String(length=36), sa.ForeignKey('courses.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('concept', sa.String(length=255), nullable=False, index=True),
        sa.Column('mastery_score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('attempts_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('misconceptions', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # 10. Interview Sessions Table
    op.create_table(
        'interview_sessions',
        sa.Column('id', sa.String(length=36), primary_key=True, nullable=False),
        sa.Column('user_id', sa.String(length=36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('course_id', sa.String(length=36), sa.ForeignKey('courses.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('target_concept', sa.String(length=255), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='in_progress', index=True),
        sa.Column('overall_score', sa.Float(), nullable=True),
        sa.Column('rubric', sa.JSON(), nullable=True),
        sa.Column('transcript_json', sa.JSON(), nullable=True),
        sa.Column('feedback', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # 11. Interview Exchanges Table
    op.create_table(
        'interview_exchanges',
        sa.Column('id', sa.String(length=36), primary_key=True, nullable=False),
        sa.Column('interview_session_id', sa.String(length=36), sa.ForeignKey('interview_sessions.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('question_text', sa.Text(), nullable=False),
        sa.Column('learner_response', sa.Text(), nullable=True),
        sa.Column('socratic_feedback', sa.Text(), nullable=True),
        sa.Column('rubric_scores', sa.JSON(), nullable=True),
        sa.Column('revision_links', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table('interview_exchanges')
    op.drop_table('interview_sessions')
    op.drop_table('mastery_records')
    op.drop_table('attempts')
    op.drop_table('messages')
    op.drop_table('sessions')
    op.drop_table('users')
    op.drop_table('chunks')
    op.drop_table('sources')
    op.drop_table('courses')
