import { DecimalPipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
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

@Component({
  selector: 'app-dashboard',
  imports: [DecimalPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit, AfterViewInit {
  @ViewChild('pieCanvas') pieCanvas!: ElementRef<HTMLCanvasElement>;

  private expenseService = inject(ExpenseService);
  private chart: Chart | null = null;

  categoryGroups = signal<CategoryGroup[]>([]);
  grandTotal = signal<number>(0);

  constructor() {
    effect(() => {
      const groups = this.categoryGroups();
      if (groups.length && this.pieCanvas) this.renderChart(groups);
    });
  }

  ngOnInit(): void {
    this.expenseService.getAll().subscribe((expenses: ExpenseResponse[]) => {
      // Only consider expenses from the last month
      const rollingMonth = new Date();
      rollingMonth.setMonth(rollingMonth.getMonth() - 1);

      const categoryMap = new Map<string, Map<string, number>>();

      // Group expenses by category and description, summing totals
      expenses.forEach((expense) => {
        if (new Date(expense.date) < rollingMonth) return;

        if (!categoryMap.has(expense.categoryName))
          categoryMap.set(expense.categoryName, new Map());

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
    });
  }

  ngAfterViewInit(): void {
    const groups = this.categoryGroups();
    if (groups.length) this.renderChart(groups);
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
          x: { stacked: true },
          y: { stacked: true, display: false },
        },
        plugins: {
          legend: { position: 'bottom' },
        },
      },
    });
  }
}
