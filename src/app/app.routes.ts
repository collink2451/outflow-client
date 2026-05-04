import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Expenses } from './expenses/expenses';
import { authGuard } from './guards/auth.guard';
import { Landing } from './landing/landing';
import { PayPeriods } from './pay-periods/pay-periods';
import { RecurringExpenses } from './recurring-expenses/recurring-expenses';

export const routes: Routes = [
  {
    path: '',
    component: Landing,
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard],
  },
  {
    path: 'expenses',
    component: Expenses,
    canActivate: [authGuard],
  },
  {
    path: 'recurring-expenses',
    component: RecurringExpenses,
    canActivate: [authGuard],
  },
  {
    path: 'pay-periods',
    component: PayPeriods,
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
