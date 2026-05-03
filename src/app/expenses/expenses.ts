import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ExpenseResponse } from '../models/expense';
import { ExpenseCategoryResponse } from '../models/expense-category';
import { ExpenseCategoryService } from '../services/expense-category.service';
import { ExpenseService } from '../services/expense.service';

interface EditableExpense {
  expenseId: number | null;
  expenseCategoryId: number | null;
  description: string;
  date: string;
  amount: number | null;
  saving: boolean;
}

@Component({
  selector: 'app-expenses',
  imports: [FormsModule],
  templateUrl: './expenses.html',
  styleUrl: './expenses.scss',
})
export class Expenses implements OnInit {
  private expenseService = inject(ExpenseService);
  private categoryService = inject(ExpenseCategoryService);

  expenses = signal<EditableExpense[]>([]);
  categories = signal<ExpenseCategoryResponse[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.categoryService.getAll().subscribe((cats) => this.categories.set(cats));

    this.expenseService.getAll().subscribe({
      next: (expenses) => {
        const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date));
        this.expenses.set(sorted.map((e) => this.toEditable(e)));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private toEditable(e: ExpenseResponse): EditableExpense {
    return {
      expenseId: e.expenseId,
      expenseCategoryId: e.expenseCategoryId,
      description: e.description,
      date: e.date.split('T')[0],
      amount: e.amount,
      saving: false,
    };
  }

  addRow(): void {
    const today = new Date().toLocaleDateString('en-CA');
    this.expenses.update((rows) => [
      {
        expenseId: null,
        expenseCategoryId: null,
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
    this.expenses.update((rows) => [...rows]);

    const request = {
      expenseCategoryId: row.expenseCategoryId,
      description: row.description.trim(),
      date: row.date,
      amount: row.amount,
    };

    if (row.expenseId === null) {
      this.expenseService.create(request).subscribe({
        next: (created) => {
          row.expenseId = created.expenseId;
          row.saving = false;
          this.expenses.update((rows) => [...rows]);
        },
        error: () => {
          row.saving = false;
          this.expenses.update((rows) => [...rows]);
        },
      });
    } else {
      this.expenseService.update(row.expenseId, request).subscribe({
        next: () => {
          row.saving = false;
          this.expenses.update((rows) => [...rows]);
        },
        error: () => {
          row.saving = false;
          this.expenses.update((rows) => [...rows]);
        },
      });
    }
  }

  delete(row: EditableExpense): void {
    if (row.expenseId === null) {
      this.expenses.update((rows) => rows.filter((r) => r !== row));
      return;
    }
    this.expenseService.delete(row.expenseId).subscribe(() => {
      this.expenses.update((rows) => rows.filter((r) => r !== row));
    });
  }
}
