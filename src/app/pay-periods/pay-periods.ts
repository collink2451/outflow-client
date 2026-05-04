import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';
import { FrequencyResponse } from '../models/frequency';
import { PayPeriodResponse } from '../models/pay-period';
import { FrequencyService } from '../services/frequency.service';
import { PayCheckService } from '../services/pay-check.service';
import { PayPeriodService } from '../services/pay-period.service';
import { PayScheduleService } from '../services/pay-schedule.service';
import { ToastService } from '../services/toast.service';

interface EditablePayCheck {
  payCheckId: number | null;
  amount: number | null;
  date: string;
  saving: boolean;
}

interface EditablePaySchedule {
  payScheduleId: number | null;
  frequencyId: number | null;
  amount: number | null;
  description: string;
  startDate: string;
  endDate: string | null;
  saving: boolean;
}

@Component({
  selector: 'app-pay-periods',
  imports: [FormsModule, ConfirmDialog],
  templateUrl: './pay-periods.html',
})
export class PayPeriods implements OnInit {
  private payPeriodService = inject(PayPeriodService);
  private payCheckService = inject(PayCheckService);
  private payScheduleService = inject(PayScheduleService);
  private frequencyService = inject(FrequencyService);
  private toast = inject(ToastService);

  payPeriods = signal<PayPeriodResponse[]>([]);
  payChecks = signal<EditablePayCheck[]>([]);
  paySchedules = signal<EditablePaySchedule[]>([]);
  frequencies = signal<FrequencyResponse[]>([]);
  expandedPeriods = signal<Set<number>>(new Set());
  savingVisible = signal<Set<EditablePayCheck | EditablePaySchedule>>(new Set());
  loading = signal(true);

  showDeleteDialog = signal(false);
  selectedItem = signal<EditablePayCheck | EditablePaySchedule | null>(null);

  reversedPayPeriods = computed(() => [...this.payPeriods()].reverse());

  ngOnInit(): void {
    forkJoin({
      payPeriods: this.payPeriodService.getAll(),
      payChecks: this.payCheckService.getAll(),
      paySchedules: this.payScheduleService.getAll(),
      frequencies: this.frequencyService.getAll(),
    }).subscribe({
      next: ({ payPeriods, payChecks, paySchedules, frequencies }) => {
        this.payPeriods.set(payPeriods);
        this.payChecks.set(
          [...payChecks]
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((pc) => this.toEditablePayCheck(pc)),
        );
        this.paySchedules.set(paySchedules.map((ps) => this.toEditablePaySchedule(ps)));
        this.frequencies.set(frequencies);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.show('Failed to load pay periods', 'error');
      },
    });
  }

  private toEditablePayCheck(pc: {
    payCheckId: number;
    amount: number;
    date: string;
  }): EditablePayCheck {
    return {
      payCheckId: pc.payCheckId,
      amount: pc.amount,
      date: pc.date.split('T')[0],
      saving: false,
    };
  }

  private toEditablePaySchedule(ps: {
    payScheduleId: number;
    frequencyId: number;
    amount: number;
    description: string;
    startDate: string;
    endDate: string | null;
  }): EditablePaySchedule {
    return {
      payScheduleId: ps.payScheduleId,
      frequencyId: ps.frequencyId,
      amount: ps.amount,
      description: ps.description,
      startDate: ps.startDate.split('T')[0],
      endDate: ps.endDate ? ps.endDate.split('T')[0] : null,
      saving: false,
    };
  }

  private markSaving(row: EditablePayCheck | EditablePaySchedule): void {
    setTimeout(() => {
      if (row.saving) this.savingVisible.update((s) => new Set(s).add(row));
    }, 300);
  }

  private clearSaving(row: EditablePayCheck | EditablePaySchedule): void {
    row.saving = false;
    this.savingVisible.update((s) => {
      const next = new Set(s);
      next.delete(row);
      return next;
    });
  }

  private reloadPayPeriods(): void {
    this.payPeriodService.getAll().subscribe({
      next: (periods) => this.payPeriods.set(periods),
      error: () => this.toast.show('Failed to refresh pay periods', 'error'),
    });
  }

  formatDate(dateStr: string): string {
    return dateStr.split('T')[0];
  }

  togglePeriod(payCheckId: number): void {
    this.expandedPeriods.update((s) => {
      const next = new Set(s);
      if (next.has(payCheckId)) next.delete(payCheckId);
      else next.add(payCheckId);
      return next;
    });
  }

  // --- Pay Checks ---

  addPayCheck(): void {
    const today = new Date().toLocaleDateString('en-CA');
    this.payChecks.update((rows) => [
      { payCheckId: null, amount: null, date: today, saving: false },
      ...rows,
    ]);
  }

  savePayCheck(row: EditablePayCheck): void {
    if (row.saving) return;
    if (!row.date || row.amount == null || isNaN(row.amount)) return;

    row.saving = true;
    this.markSaving(row);

    const request = { amount: row.amount, date: row.date };

    if (row.payCheckId === null) {
      this.payCheckService.create(request).subscribe({
        next: (created) => {
          row.payCheckId = created.payCheckId;
          this.clearSaving(row);
          this.payChecks.update((rows) => [...rows]);
          this.reloadPayPeriods();
        },
        error: () => {
          this.clearSaving(row);
          this.payChecks.update((rows) => [...rows]);
          this.toast.show('Failed to save pay check', 'error');
        },
      });
    } else {
      this.payCheckService.update(row.payCheckId, request).subscribe({
        next: () => {
          this.clearSaving(row);
          this.payChecks.update((rows) => [...rows]);
          this.reloadPayPeriods();
        },
        error: () => {
          this.clearSaving(row);
          this.payChecks.update((rows) => [...rows]);
          this.toast.show('Failed to update pay check', 'error');
        },
      });
    }
  }

  // --- Pay Schedules ---

  addPaySchedule(): void {
    const today = new Date().toLocaleDateString('en-CA');
    this.paySchedules.update((rows) => [
      {
        payScheduleId: null,
        frequencyId: null,
        amount: null,
        description: '',
        startDate: today,
        endDate: null,
        saving: false,
      },
      ...rows,
    ]);
  }

  savePaySchedule(row: EditablePaySchedule): void {
    if (row.saving) return;
    if (
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
      amount: row.amount,
      description: row.description.trim(),
      startDate: row.startDate,
      endDate: row.endDate || null,
    };

    if (row.payScheduleId === null) {
      this.payScheduleService.create(request).subscribe({
        next: (created) => {
          row.payScheduleId = created.payScheduleId;
          this.clearSaving(row);
          this.paySchedules.update((rows) => [...rows]);
        },
        error: () => {
          this.clearSaving(row);
          this.paySchedules.update((rows) => [...rows]);
          this.toast.show('Failed to save pay schedule', 'error');
        },
      });
    } else {
      this.payScheduleService.update(row.payScheduleId, request).subscribe({
        next: () => {
          this.clearSaving(row);
          this.paySchedules.update((rows) => [...rows]);
        },
        error: () => {
          this.clearSaving(row);
          this.paySchedules.update((rows) => [...rows]);
          this.toast.show('Failed to update pay schedule', 'error');
        },
      });
    }
  }

  // --- Delete ---

  openDeleteDialog(row: EditablePayCheck | EditablePaySchedule): void {
    this.selectedItem.set(row);
    this.showDeleteDialog.set(true);
  }

  delete(): void {
    const row = this.selectedItem();
    if (!row) return;

    if ('payCheckId' in row) {
      if (row.payCheckId === null) {
        this.payChecks.update((rows) => rows.filter((r) => r !== row));
        return;
      }
      this.payCheckService.delete(row.payCheckId).subscribe({
        next: () => {
          this.payChecks.update((rows) => rows.filter((r) => r !== row));
          this.reloadPayPeriods();
          this.toast.show('Pay check deleted', 'success');
        },
        error: () => this.toast.show('Failed to delete pay check', 'error'),
      });
    } else {
      if (row.payScheduleId === null) {
        this.paySchedules.update((rows) => rows.filter((r) => r !== row));
        return;
      }
      this.payScheduleService.delete(row.payScheduleId).subscribe({
        next: () => {
          this.paySchedules.update((rows) => rows.filter((r) => r !== row));
          this.toast.show('Pay schedule deleted', 'success');
        },
        error: () => this.toast.show('Failed to delete pay schedule', 'error'),
      });
    }
  }
}
