import uuid
from typing import Optional, Sequence, Dict, Any, List
from datetime import date
from decimal import Decimal
from app.models.recurring_transaction import RecurringTransaction
from app.models.enums import TransactionType, RecurringStatus, NotificationType
from app.schemas.recurring_transaction_schema import (
    RecurringTransactionCreate,
    RecurringTransactionUpdate,
    RecurringProcessResult,
)
from app.schemas.expense_schema import ExpenseCreate
from app.schemas.income_schema import IncomeCreate
from app.schemas.notification_schema import NotificationCreate
from app.repositories.recurring_transaction_repository import RecurringTransactionRepository
from app.repositories.expense_repository import ExpenseRepository
from app.repositories.income_repository import IncomeRepository
from app.repositories.category_repository import CategoryRepository
from app.repositories.notification_repository import NotificationRepository
from app.utils.date_utils import calculate_next_occurrence
from app.core.exceptions import NotFoundException, BadRequestException
from app.core.logging import logger

class RecurringTransactionService:
    def __init__(
        self,
        repository: RecurringTransactionRepository,
        expense_repository: Optional[ExpenseRepository] = None,
        income_repository: Optional[IncomeRepository] = None,
        category_repository: Optional[CategoryRepository] = None,
        notification_repository: Optional[NotificationRepository] = None,
    ):
        self.repository = repository
        self.expense_repository = expense_repository
        self.income_repository = income_repository
        self.category_repository = category_repository
        self.notification_repository = notification_repository

    async def create_recurring_transaction(
        self, user_id: uuid.UUID, recurring_in: RecurringTransactionCreate
    ) -> RecurringTransaction:
        if recurring_in.amount <= 0:
            raise BadRequestException("Amount must be greater than 0.")

        if self.category_repository:
            category = await self.category_repository.get_category(
                str(recurring_in.category_id), str(user_id)
            )
            if not category:
                seeded = await self.category_repository.seed_default_presets(str(user_id))
                for c in seeded:
                    if str(c.id) == str(recurring_in.category_id) or c.name.lower() == str(recurring_in.category_id).lower():
                        category = c
                        break
                if not category and seeded:
                    for c in seeded:
                        if c.type == recurring_in.type:
                            category = c
                            break
                    if not category:
                        category = seeded[0]
                if category:
                    recurring_in.category_id = category.id
                else:
                    raise NotFoundException("Category not found.")
            else:
                recurring_in.category_id = category.id

        return await self.repository.create_recurring_transaction(user_id, recurring_in)

    async def get_recurring_transaction(
        self, recurring_id: str, user_id: uuid.UUID
    ) -> RecurringTransaction:
        recurring = await self.repository.get_recurring_transaction(recurring_id, user_id)
        if not recurring:
            raise NotFoundException("Recurring transaction not found.")
        return recurring

    async def list_recurring_transactions(
        self,
        user_id: uuid.UUID,
        type: Optional[str] = None,
        status: Optional[str] = None,
        category_id: Optional[uuid.UUID] = None,
        search: Optional[str] = None,
        sort: str = "asc",
        skip: int = 0,
        limit: int = 100,
    ) -> Sequence[RecurringTransaction]:
        if skip < 0 or limit <= 0:
            raise BadRequestException("Invalid pagination parameters.")
        limit = min(limit, 500)

        return await self.repository.list_recurring_transactions(
            user_id=user_id,
            type=type,
            status=status,
            category_id=category_id,
            search=search,
            sort=sort,
            skip=skip,
            limit=limit,
        )

    async def update_recurring_transaction(
        self,
        recurring_id: str,
        user_id: uuid.UUID,
        recurring_in: RecurringTransactionUpdate,
    ) -> RecurringTransaction:
        if recurring_in.amount is not None and recurring_in.amount <= 0:
            raise BadRequestException("Amount must be greater than 0.")

        if recurring_in.category_id and self.category_repository:
            category = await self.category_repository.get_category(
                str(recurring_in.category_id), str(user_id)
            )
            if not category:
                seeded = await self.category_repository.seed_default_presets(str(user_id))
                for c in seeded:
                    if str(c.id) == str(recurring_in.category_id) or c.name.lower() == str(recurring_in.category_id).lower():
                        category = c
                        break
                if category:
                    recurring_in.category_id = category.id
            else:
                recurring_in.category_id = category.id

        updated = await self.repository.update_recurring_transaction(
            recurring_id, user_id, recurring_in
        )
        if not updated:
            raise NotFoundException("Recurring transaction not found.")
        return updated

    async def delete_recurring_transaction(
        self, recurring_id: str, user_id: uuid.UUID
    ) -> bool:
        deleted = await self.repository.delete_recurring_transaction(recurring_id, user_id)
        if not deleted:
            raise NotFoundException("Recurring transaction not found.")
        return True

    async def pause_recurring_transaction(
        self, recurring_id: str, user_id: uuid.UUID
    ) -> RecurringTransaction:
        update_in = RecurringTransactionUpdate(status=RecurringStatus.PAUSED)
        return await self.update_recurring_transaction(recurring_id, user_id, update_in)

    async def resume_recurring_transaction(
        self, recurring_id: str, user_id: uuid.UUID
    ) -> RecurringTransaction:
        recurring = await self.get_recurring_transaction(recurring_id, user_id)
        
        # If next_date has already passed, advance next_date to current or next occurrence
        next_date = recurring.next_date
        today = date.today()
        while next_date < today:
            next_date = calculate_next_occurrence(next_date, recurring.frequency)

        update_in = RecurringTransactionUpdate(
            status=RecurringStatus.ACTIVE,
            next_date=next_date
        )
        return await self.update_recurring_transaction(recurring_id, user_id, update_in)

    async def cancel_recurring_transaction(
        self, recurring_id: str, user_id: uuid.UUID
    ) -> RecurringTransaction:
        update_in = RecurringTransactionUpdate(status=RecurringStatus.CANCELLED)
        return await self.update_recurring_transaction(recurring_id, user_id, update_in)

    async def skip_occurrence(
        self, recurring_id: str, user_id: uuid.UUID
    ) -> RecurringTransaction:
        recurring = await self.get_recurring_transaction(recurring_id, user_id)
        next_occurrence = calculate_next_occurrence(recurring.next_date, recurring.frequency)

        status = recurring.status
        if not recurring.is_never_ending and recurring.end_date and next_occurrence > recurring.end_date:
            status = RecurringStatus.COMPLETED

        update_in = RecurringTransactionUpdate(
            next_date=next_occurrence,
            status=status
        )
        return await self.update_recurring_transaction(recurring_id, user_id, update_in)

    async def process_occurrence(
        self,
        recurring_id: str,
        user_id: uuid.UUID,
        occurrence_date: Optional[date] = None,
    ) -> Dict[str, Any]:
        """Executes a recurring transaction occurrence: creates Expense or Income, updates next_date, and sends notification."""
        recurring = await self.get_recurring_transaction(recurring_id, user_id)
        
        if recurring.status != RecurringStatus.ACTIVE:
            raise BadRequestException(f"Cannot process recurring transaction with status '{recurring.status}'.")

        target_date = occurrence_date or recurring.next_date
        generated_tx = None
        amount_float = float(recurring.amount)

        # 1. Create Transaction in Database
        if recurring.type == TransactionType.EXPENSE:
            if not self.expense_repository:
                raise RuntimeError("ExpenseRepository not initialized.")
            expense_in = ExpenseCreate(
                amount=amount_float,
                date=target_date,
                category_id=recurring.category_id,
                merchant=recurring.merchant or recurring.title or "Recurring Expense",
                description=f"Auto-generated recurring expense ({recurring.frequency.value.lower()})"
                + (f": {recurring.description}" if recurring.description else ""),
                payment_method=recurring.payment_method or "Automated",
            )
            generated_tx = await self.expense_repository.create_expense(user_id, expense_in)
        else:
            if not self.income_repository:
                raise RuntimeError("IncomeRepository not initialized.")
            income_in = IncomeCreate(
                amount=amount_float,
                date=target_date,
                category_id=recurring.category_id,
                source=recurring.merchant or recurring.title or "Recurring Income",
                description=f"Auto-generated recurring income ({recurring.frequency.value.lower()})"
                + (f": {recurring.description}" if recurring.description else ""),
            )
            generated_tx = await self.income_repository.create_income(user_id, income_in)

        # 2. Advance Next Occurrence Date
        next_occurrence = calculate_next_occurrence(target_date, recurring.frequency)
        new_status = RecurringStatus.ACTIVE
        if not recurring.is_never_ending and recurring.end_date and next_occurrence > recurring.end_date:
            new_status = RecurringStatus.COMPLETED

        update_in = RecurringTransactionUpdate(
            next_date=next_occurrence,
            status=new_status,
        )
        await self.repository.update_recurring_transaction(recurring_id, user_id, update_in)
        
        # Set last_processed_date on model directly
        recurring.last_processed_date = target_date
        await self.repository.db.commit()

        # 3. Create Notification
        if self.notification_repository:
            category_label = recurring.category_name or "General"
            title = f"🔄 Recurring {recurring.type.value.title()} Executed"
            message = (
                f"Successfully recorded ₹{amount_float:,.2f} for {category_label} "
                f"({recurring.frequency.value.title()} schedule). Next occurrence: {next_occurrence.strftime('%b %d, %Y')}."
            )
            try:
                await self.notification_repository.create_notification(
                    str(user_id),
                    NotificationCreate(
                        title=title,
                        message=message,
                        type=NotificationType.RECURRING_EXECUTED,
                        data={
                            "recurring_id": str(recurring.id),
                            "transaction_type": recurring.type.value,
                            "amount": amount_float,
                            "category": category_label,
                            "next_date": next_occurrence.isoformat(),
                        },
                    ),
                )
            except Exception as e:
                logger.error(f"Failed to create recurring notification: {e}")

        return {
            "recurring_id": str(recurring.id),
            "type": recurring.type.value,
            "amount": amount_float,
            "date": target_date.isoformat(),
            "next_date": next_occurrence.isoformat(),
            "status": new_status.value,
            "generated_id": str(generated_tx.id) if generated_tx else None,
        }

    async def process_all_due(
        self, user_id: uuid.UUID, target_date: Optional[date] = None
    ) -> RecurringProcessResult:
        """Processes all active recurring transactions that are due on or before target_date."""
        effective_date = target_date or date.today()
        due_items = await self.repository.get_due_recurring_transactions(user_id, effective_date)

        generated = []
        messages = []

        for item in due_items:
            try:
                res = await self.process_occurrence(str(item.id), user_id, item.next_date)
                generated.append(res)
                messages.append(
                    f"Processed {item.type.value} of ₹{float(item.amount):,.2f} for {item.category_name or 'category'}."
                )
            except Exception as e:
                logger.error(f"Failed to process recurring transaction {item.id}: {e}")
                messages.append(f"Error processing {item.id}: {str(e)}")

        return RecurringProcessResult(
            processed_count=len(generated),
            generated_transactions=generated,
            messages=messages,
        )

    async def get_counts(self, user_id: uuid.UUID) -> Dict[str, Any]:
        return await self.repository.get_counts(user_id)
