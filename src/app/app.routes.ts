import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Expenses } from './expenses/expenses';

export const routes: Routes = [
  {
    path: 'dashboard',
    component: Dashboard,
  },
  {
    path: 'expenses',
    component: Expenses,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
