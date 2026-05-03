import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Expenses } from './expenses/expenses';
import { authGuard } from './guards/auth.guard';
import { Landing } from './landing/landing';

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
    path: '**',
    redirectTo: '',
  },
];
