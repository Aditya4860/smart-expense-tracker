"""add_performance_composite_indexes

Revision ID: e12a_perf_indexes
Revises: cdd8e42dcf55
Create Date: 2026-08-03 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'e12a_perf_indexes'
down_revision: Union[str, None] = 'cdd8e42dcf55'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Expenses composite indexes
    op.create_index('ix_expenses_user_date', 'expenses', ['user_id', 'date'], unique=False)
    op.create_index('ix_expenses_user_category', 'expenses', ['user_id', 'category_id'], unique=False)
    op.create_index('ix_expenses_user_merchant', 'expenses', ['user_id', 'merchant'], unique=False)

    # Incomes composite indexes
    op.create_index('ix_incomes_user_date', 'incomes', ['user_id', 'date'], unique=False)
    op.create_index('ix_incomes_user_category', 'incomes', ['user_id', 'category_id'], unique=False)
    op.create_index('ix_incomes_user_source', 'incomes', ['user_id', 'source'], unique=False)

    # Goals composite indexes
    op.create_index('ix_goals_user_status', 'goals', ['user_id', 'status'], unique=False)

    # Goal contributions composite indexes
    op.create_index('ix_goal_contrib_goal_date', 'goal_contributions', ['goal_id', 'date'], unique=False)

    # Categories composite indexes
    op.create_index('ix_categories_user_type', 'categories', ['user_id', 'type'], unique=False)
    op.create_index('ix_categories_user_name', 'categories', ['user_id', 'name'], unique=False)

    # Notifications composite indexes
    op.create_index('ix_notifications_user_read', 'notifications', ['user_id', 'is_read'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_notifications_user_read', table_name='notifications')
    op.drop_index('ix_categories_user_name', table_name='categories')
    op.drop_index('ix_categories_user_type', table_name='categories')
    op.drop_index('ix_goal_contrib_goal_date', table_name='goal_contributions')
    op.drop_index('ix_goals_user_status', table_name='goals')
    op.drop_index('ix_incomes_user_source', table_name='incomes')
    op.drop_index('ix_incomes_user_category', table_name='incomes')
    op.drop_index('ix_incomes_user_date', table_name='incomes')
    op.drop_index('ix_expenses_user_merchant', table_name='expenses')
    op.drop_index('ix_expenses_user_category', table_name='expenses')
    op.drop_index('ix_expenses_user_date', table_name='expenses')
