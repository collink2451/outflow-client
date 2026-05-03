import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ExpenseCategoryResponse } from '../models/expense-category';
import { FrequencyResponse } from '../models/frequency';
import { RecurringExpenseResponse } from '../models/recurring-expense';
import { ExpenseCategoryService } from '../services/expense-category.service';
import { ExpenseService } from '../services/expense.service';
import { FrequencyService } from '../services/frequency.service';
import { RecurringExpenseService } from '../services/recurring-expense.service';
import { ToastService } from '../services/toast.service';

interface EditableRecurringExpense {
  recurringExpenseId: number | null;
  frequencyId: number | null;
  frequencyName: string;
  expenseCategoryId: number | null;
  categoryName: string;
  description: string;
  startDate: string;
  nextOccurrenceDate: string | null;
  amount: number;
  automaticRun: boolean;
  saving: boolean;
}

@Component({
  selector: 'app-recurring-expenses',
  imports: [FormsModule],
  templateUrl: './recurring-expenses.html',
})
export class RecurringExpenses implements OnInit {
  private expenseService = inject(ExpenseService);
  private recurringExpenseService = inject(RecurringExpenseService);
  private categoryService = inject(ExpenseCategoryService);
  private frequencyService = inject(FrequencyService);
  private toast = inject(ToastService);

  recurringExpenses = signal<EditableRecurringExpense[]>([]);
  categories = signal<ExpenseCategoryResponse[]>([]);
  frequencies = signal<FrequencyResponse[]>([]);
  savingVisible = signal<Set<EditableRecurringExpense>>(new Set());

  loading = signal(true);

  showDeleteDialog = signal(false);
  selectedItem = signal<EditableRecurringExpense | null>(null);

  ngOnInit(): void {
    this.categoryService.getAll().subscribe({
      next: (cats) => this.categories.set(cats),
      error: () => this.toast.show('Failed to load categories', 'error'),
    });

    this.frequencyService.getAll().subscribe({
      next: (freqs) => this.frequencies.set(freqs),
      error: () => this.toast.show('Failed to load frequencies', 'error'),
    });

    this.recurringExpenseService.getAll().subscribe({
      next: (recurringExpenses) => {
        // Sort by date desc by default
        const sorted = [...recurringExpenses].sort((a, b) =>
          a.nextOccurrenceDate.localeCompare(b.nextOccurrenceDate),
        );
        this.recurringExpenses.set(sorted.map((e) => this.toEditable(e)));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.show('Failed to load recurring expenses', 'error');
      },
    });
  }

  private toEditable(e: RecurringExpenseResponse): EditableRecurringExpense {
    return {
      recurringExpenseId: e.recurringExpenseId,
      frequencyId: e.frequencyId,
      frequencyName: e.frequencyName,
      expenseCategoryId: e.expenseCategoryId,
      categoryName: e.categoryName,
      description: e.description,
      startDate: e.startDate.split('T')[0],
      nextOccurrenceDate: e.nextOccurrenceDate.split('T')[0],
      amount: e.amount,
      automaticRun: e.automaticRun,
      saving: false,
    };
  }

  private markSaving(row: EditableRecurringExpense): void {
    setTimeout(() => {
      if (row.saving) this.savingVisible.update((s) => new Set(s).add(row));
    }, 300);
  }

  private clearSaving(row: EditableRecurringExpense): void {
    row.saving = false;
    this.savingVisible.update((s) => {
      const next = new Set(s);
      next.delete(row);
      return next;
    });
  }

  addRow(): void {
    const today = new Date().toLocaleDateString('en-CA');
    this.recurringExpenses.update((rows) => [
      {
        recurringExpenseId: null,
        frequencyId: null,
        frequencyName: '',
        expenseCategoryId: null,
        categoryName: '',
        description: '',
        startDate: today,
        nextOccurrenceDate: null,
        amount: 0,
        automaticRun: false,
        saving: false,
      },
      ...rows,
    ]);
  }

  save(row: EditableRecurringExpense): void {
    if (row.saving) return;
    if (
      !row.expenseCategoryId ||
      !row.frequencyId ||
      !row.description?.trim() ||
      !row.startDate ||
      row.amount == null ||
      isNaN(row.amount)
    )
      return;

    row.saving = true;
    this.markSaving(row);

    const request = {
      frequencyId: row.frequencyId,
      expenseCategoryId: row.expenseCategoryId,
      description: row.description.trim(),
      startDate: row.startDate,
      amount: row.amount,
      automaticRun: row.automaticRun,
    };

    // Check if we're creating a new recurring expense or updating an existing one
    if (row.recurringExpenseId === null) {
      this.recurringExpenseService.create(request).subscribe({
        next: (created) => {
          row.recurringExpenseId = created.recurringExpenseId;
          row.nextOccurrenceDate = created.nextOccurrenceDate.split('T')[0];
          this.clearSaving(row);
          this.recurringExpenses.update((rows) => [...rows]);
        },
        error: () => {
          this.clearSaving(row);
          this.recurringExpenses.update((rows) => [...rows]);
          this.toast.show('Failed to save recurring expense', 'error');
        },
      });
    } else {
      this.recurringExpenseService.update(row.recurringExpenseId, request).subscribe({
        next: (updated) => {
          row.nextOccurrenceDate = updated.nextOccurrenceDate.split('T')[0];
          this.clearSaving(row);
          this.recurringExpenses.update((rows) => [...rows]);
        },
        error: () => {
          this.clearSaving(row);
          this.recurringExpenses.update((rows) => [...rows]);
          this.toast.show('Failed to update recurring expense', 'error');
        },
      });
    }
  }

  openDeleteDialog(row: EditableRecurringExpense) {
    this.selectedItem.set(row);
    this.showDeleteDialog.set(true);
  }

  delete(): void {
    const row = this.selectedItem();
    if (!row) return;

    // If the item has a null ID, it means it's a new unsaved item, so we can just remove it from the list
    if (row.recurringExpenseId === null) {
      this.recurringExpenses.update((rows) => rows.filter((r) => r !== row));
      this.toast.show('Recurring expense deleted', 'success');
      return;
    } else {
      this.recurringExpenseService.delete(row.recurringExpenseId).subscribe({
        next: () => {
          this.recurringExpenses.update((rows) => rows.filter((r) => r !== row));
          this.toast.show('Recurring expense deleted', 'success');
        },
        error: () => this.toast.show('Failed to delete recurring expense', 'error'),
      });
    }
  }

  createExpenseFromRecurring(row: EditableRecurringExpense): void {
    if (row.saving) return;
    if (
      !row.expenseCategoryId ||
      !row.description?.trim() ||
      !row.startDate ||
      row.amount == null ||
      isNaN(row.amount)
    )
      return;

    row.saving = true;
    this.markSaving(row);

    const request = {
      expenseCategoryId: row.expenseCategoryId,
      description: row.description.trim(),
      date: new Date().toLocaleDateString('en-CA'),
      amount: row.amount,
    };

    this.expenseService.create(request).subscribe({
      next: () => {
        this.clearSaving(row);
        this.recurringExpenses.update((rows) => [...rows]);
        this.toast.show('Expense created from recurring expense', 'success');
      },
      error: () => {
        this.clearSaving(row);
        this.recurringExpenses.update((rows) => [...rows]);
        this.toast.show('Failed to create expense from recurring expense', 'error');
      },
    });
  }
}
