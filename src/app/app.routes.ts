import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Expenses } from './expenses/expenses';
import { Landing } from './landing/landing';

export const routes: Routes = [
  {
    path: '',
    component: Landing,
  },
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
