import { DecimalPipe } from '@angular/common';
import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { ExpenseResponse } from '../models/expense';
import { ExpenseService } from '../services/expense.service';

Chart.register(BarElement, BarController, CategoryScale, LinearScale, Tooltip, Legend);

export interface DescriptionGroup {
  description: string;
  total: number;
}

export interface CategoryGroup {
  category: string;
  descriptions: DescriptionGroup[];
  total: number;
}

const COLORS = [
  '#6366f1',
  '#f59e0b',
  '#10b981',
  '#ef4444',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#84cc16',
];

interface MonthlyCategory {
  category: string;
  monthTotals: number[]; // one per month, index matches months array
}

@Component({
  selector: 'app-dashboard',
  imports: [DecimalPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  @ViewChild('pieCanvas') pieCanvas!: ElementRef<HTMLCanvasElement>;

  private expenseService = inject(ExpenseService);
  private chart: Chart | null = null;

  loading = signal(true);

  categoryGroups = signal<CategoryGroup[]>([]);
  grandTotal = signal<number>(0);

  months = signal<string[]>([]);
  monthlyCategories = signal<MonthlyCategory[]>([]);
  monthlyTotals = signal<number[]>([]);

  filteredCategoryGroups = computed(() => this.categoryGroups().filter((g) => g.total > 0));
  filteredMonthlyCategories = computed(() =>
    this.monthlyCategories().filter((c) => c.monthTotals.some((t) => t !== 0)),
  );

  constructor() {
    effect(() => {
      const groups = this.filteredCategoryGroups();
      if (groups.length && this.pieCanvas) this.renderChart(groups);
    });
  }

  ngOnInit(): void {
    this.expenseService.getAll().subscribe((expenses: ExpenseResponse[]) => {
      this.formatRollingMonth(expenses);
      this.formatMonthly(expenses);

      this.loading.set(false);
    });
  }

  private formatRollingMonth(expenses: ExpenseResponse[]): void {
    // Only consider expenses from the last month
    const rollingMonth = new Date();
    rollingMonth.setMonth(rollingMonth.getMonth() - 1);

    const categoryMap = new Map<string, Map<string, number>>();

    // Group expenses by category and description, summing totals
    expenses.forEach((expense) => {
      if (new Date(expense.date) < rollingMonth) return;

      if (!categoryMap.has(expense.categoryName)) categoryMap.set(expense.categoryName, new Map());

      const descMap = categoryMap.get(expense.categoryName)!;
      descMap.set(expense.description, (descMap.get(expense.description) ?? 0) + expense.amount);
    });

    let grandTotal = 0;
    const groups: CategoryGroup[] = [];

    // Convert the map structure into the CategoryGroup format
    categoryMap.forEach((descMap, category) => {
      const descriptions: DescriptionGroup[] = [];
      let categoryTotal = 0;

      descMap.forEach((total, description) => {
        const rounded = Math.round(total * 100) / 100;
        descriptions.push({ description, total: rounded });
        categoryTotal += rounded;
      });

      const roundedCategoryTotal = Math.round(categoryTotal * 100) / 100;
      groups.push({ category, descriptions, total: roundedCategoryTotal });
      grandTotal += roundedCategoryTotal;
    });

    // Sort categories alphabetically
    groups.sort((a, b) => a.category.localeCompare(b.category));

    // Update signals
    this.categoryGroups.set(groups);
    this.grandTotal.set(Math.round(grandTotal * 100) / 100);
  }

  private formatMonthly(expenses: ExpenseResponse[]): void {
    const now = new Date();
    // Create an array of the last 6 months
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      return {
        label: d.toLocaleString('default', { month: 'short', year: 'numeric' }),
        year: d.getFullYear(),
        month: d.getMonth(),
      };
    });

    const categoryMonthMap = new Map<string, number[]>();

    // Group expenses by category and month, summing totals
    expenses.forEach((expense) => {
      const d = new Date(expense.date);
      const monthIndex = months.findIndex(
        (m) => m.year === d.getFullYear() && m.month === d.getMonth(),
      );
      if (monthIndex === -1) return;

      if (!categoryMonthMap.has(expense.categoryName))
        categoryMonthMap.set(expense.categoryName, Array(6).fill(0));

      categoryMonthMap.get(expense.categoryName)![monthIndex] += expense.amount;
    });

    // Convert the map structure into the MonthlyCategory format
    const monthlyCategories = Array.from(categoryMonthMap.entries())
      .map(([category, monthTotals]) => ({
        category,
        monthTotals: monthTotals.map((t) => Math.round(t * 100) / 100),
      }))
      .sort((a, b) => a.category.localeCompare(b.category));

    const monthlyTotals = months.map(
      (_, i) =>
        Math.round(monthlyCategories.reduce((sum, c) => sum + c.monthTotals[i], 0) * 100) / 100,
    );

    this.months.set(months.map((m) => m.label));
    this.monthlyCategories.set(monthlyCategories);
    this.monthlyTotals.set(monthlyTotals);
  }

  private renderChart(groups: CategoryGroup[]): void {
    if (this.chart) this.chart.destroy();

    groups.sort((a, b) => b.total - a.total).splice(10);
    const total = groups.reduce((sum, g) => sum + g.total, 0);

    this.chart = new Chart(this.pieCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: [''],
        datasets: groups.map((g, i) => ({
          label: g.category + ` (${((g.total / total) * 100).toFixed(0)}%)`,
          data: [(g.total / total) * 100],
          backgroundColor: COLORS[i % COLORS.length],
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
          x: {
            stacked: true,
            ticks: { display: false },
            grid: { display: false },
            border: { display: false },
          },
          y: { stacked: true, display: false },
        },
        plugins: {
          legend: { position: 'bottom' },
        },
      },
    });
  }
}
