import { Component, computed, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogComponent as ConfirmDialog } from '../confirm-dialog/confirm-dialog';
import { ExpenseResponse } from '../models/expense';
import { ExpenseCategoryResponse } from '../models/expense-category';
import { ExpenseCategoryService } from '../services/expense-category.service';
import { ExpenseService } from '../services/expense.service';
import { ToastService } from '../services/toast.service';

type SortColumn = 'date' | 'categoryName' | 'description' | 'amount';

interface EditableExpense {
  expenseId: number | null;
  expenseCategoryId: number | null;
  categoryName: string;
  description: string;
  date: string;
  amount: number | null;
  saving: boolean;
}

interface EditableCategory {
  expenseCategoryId: number | null;
  name: string;
  saving: boolean;
}

@Component({
  selector: 'app-expenses',
  imports: [FormsModule, ConfirmDialog],
  templateUrl: './expenses.html',
})
export class Expenses implements OnInit {
  @ViewChild('categoriesModal') categoriesModal!: ElementRef<HTMLDialogElement>;

  private expenseService = inject(ExpenseService);
  private categoryService = inject(ExpenseCategoryService);
  private toast = inject(ToastService);

  expenses = signal<EditableExpense[]>([]);
  categories = signal<ExpenseCategoryResponse[]>([]);
  editableCategories = signal<EditableCategory[]>([]);
  savingVisible = signal<Set<EditableExpense | EditableCategory>>(new Set());
  loading = signal(true);
  sortColumn = signal<SortColumn>('date');
  sortDirection = signal<'asc' | 'desc'>('desc');

  showDeleteDialog = signal(false);
  selectedItem = signal<EditableExpense | EditableCategory | null>(null);

  // Compute sorted expenses based on current sort column and direction
  sortedExpenses = computed(() => {
    const col = this.sortColumn();
    const dir = this.sortDirection();
    return [...this.expenses()].sort((a, b) => {
      let cmp = 0;
      switch (col) {
        case 'date':
          cmp = a.date.localeCompare(b.date);
          break;
        case 'categoryName':
          cmp = a.categoryName.localeCompare(b.categoryName);
          break;
        case 'description':
          cmp = a.description.localeCompare(b.description);
          break;
        case 'amount':
          cmp = (a.amount ?? 0) - (b.amount ?? 0);
          break;
      }
      return dir === 'asc' ? cmp : -cmp;
    });
  });

  ngOnInit(): void {
    this.categoryService.getAll().subscribe({
      next: (cats) => this.categories.set(cats),
      error: () => this.toast.show('Failed to load categories', 'error'),
    });

    this.expenseService.getAll().subscribe({
      next: (expenses) => {
        // Sort by date desc by default
        const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date));
        this.expenses.set(sorted.map((e) => this.toEditable(e)));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.show('Failed to load expenses', 'error');
      },
    });
  }

  private markSaving(row: EditableExpense): void {
    setTimeout(() => {
      if (row.saving) this.savingVisible.update((s) => new Set(s).add(row));
    }, 300);
  }

  private clearSaving(row: EditableExpense): void {
    row.saving = false;
    this.savingVisible.update((s) => {
      const next = new Set(s);
      next.delete(row);
      return next;
    });
  }

  // Convert API response to editable format
  private toEditable(e: ExpenseResponse): EditableExpense {
    return {
      expenseId: e.expenseId,
      expenseCategoryId: e.expenseCategoryId,
      categoryName: e.categoryName,
      description: e.description,
      date: e.date.split('T')[0],
      amount: e.amount,
      saving: false,
    };
  }

  setSort(col: SortColumn): void {
    if (this.sortColumn() === col) {
      this.sortDirection.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortColumn.set(col);
      this.sortDirection.set('asc');
    }
  }

  addRow(): void {
    const today = new Date().toLocaleDateString('en-CA');
    this.expenses.update((rows) => [
      {
        expenseId: null,
        expenseCategoryId: null,
        categoryName: '',
        description: '',
        date: today,
        amount: null,
        saving: false,
      },
      ...rows,
    ]);
  }

  save(row: EditableExpense): void {
    if (row.saving) return;
    if (
      !row.expenseCategoryId ||
      !row.description?.trim() ||
      !row.date ||
      row.amount == null ||
      isNaN(row.amount)
    )
      return;

    row.saving = true;
    this.markSaving(row);

    const request = {
      expenseCategoryId: row.expenseCategoryId,
      description: row.description.trim(),
      date: row.date,
      amount: row.amount,
    };

    // Check if we're creating a new expense or updating an existing one
    if (row.expenseId === null) {
      this.expenseService.create(request).subscribe({
        next: (created) => {
          row.expenseId = created.expenseId;
          this.clearSaving(row);
          this.expenses.update((rows) => [...rows]);
        },
        error: () => {
          this.clearSaving(row);
          this.expenses.update((rows) => [...rows]);
          this.toast.show('Failed to save expense', 'error');
        },
      });
    } else {
      this.expenseService.update(row.expenseId, request).subscribe({
        next: () => {
          this.clearSaving(row);
          this.expenses.update((rows) => [...rows]);
        },
        error: () => {
          this.clearSaving(row);
          this.expenses.update((rows) => [...rows]);
          this.toast.show('Failed to update expense', 'error');
        },
      });
    }
  }

  openDeleteDialog(row: EditableExpense | EditableCategory) {
    this.selectedItem.set(row);
    this.showDeleteDialog.set(true);
  }

  delete(): void {
    const row = this.selectedItem();
    if (!row) return;

    // If the item has a null ID, it means it's a new unsaved item, so we can just remove it from the list
    if ('expenseId' in row && row.expenseId === null) {
      this.expenses.update((rows) => rows.filter((r) => r !== row));
      this.toast.show('Expense deleted', 'success');
      return;
    }

    // Expense deletion
    if ('expenseId' in row) {
      this.expenseService.delete(row.expenseId!).subscribe({
        next: () => {
          this.expenses.update((rows) => rows.filter((r) => r !== row));
          this.toast.show('Expense deleted', 'success');
        },
        error: () => this.toast.show('Failed to delete expense', 'error'),
      });
      // Category deletion
    } else if ('expenseCategoryId' in row && row.expenseCategoryId !== null) {
      this.categoryService.delete(row.expenseCategoryId).subscribe({
        next: () => {
          this.editableCategories.update((rows) => rows.filter((r) => r !== row));
          this.syncCategories();
          this.toast.show('Category deleted', 'success');
        },
        error: () => this.toast.show('Failed to delete category', 'error'),
      });
    }
  }

  // --- Categories modal ---

  openCategoriesModal(): void {
    this.editableCategories.set(
      this.categories().map((c) => ({
        expenseCategoryId: c.expenseCategoryId,
        name: c.name,
        saving: false,
      })),
    );
    this.categoriesModal.nativeElement.showModal();
  }

  addCategoryRow(): void {
    this.editableCategories.update((rows) => [
      ...rows,
      { expenseCategoryId: null, name: '', saving: false },
    ]);
  }

  saveCategory(row: EditableCategory): void {
    if (row.saving || !row.name.trim()) return;

    row.saving = true;
    this.editableCategories.update((rows) => [...rows]);

    // Check if we're creating a new category or updating an existing one
    if (row.expenseCategoryId === null) {
      this.categoryService.create({ name: row.name.trim() }).subscribe({
        next: (created) => {
          row.expenseCategoryId = created.expenseCategoryId;
          row.name = created.name;
          row.saving = false;
          this.editableCategories.update((rows) => [...rows]);
          this.syncCategories();
        },
        error: () => {
          row.saving = false;
          this.editableCategories.update((rows) => [...rows]);
          this.toast.show('Failed to create category', 'error');
        },
      });
    } else {
      this.categoryService.update(row.expenseCategoryId, { name: row.name.trim() }).subscribe({
        next: (updated) => {
          row.name = updated.name;
          row.saving = false;
          this.editableCategories.update((rows) => [...rows]);
          this.syncCategories();
        },
        error: () => {
          row.saving = false;
          this.editableCategories.update((rows) => [...rows]);
          this.toast.show('Failed to update category', 'error');
        },
      });
    }
  }

  private syncCategories(): void {
    this.categories.set(
      this.editableCategories()
        .filter((c) => c.expenseCategoryId !== null)
        .map((c) => ({ expenseCategoryId: c.expenseCategoryId!, name: c.name })),
    );
  }
}
