import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard/home', pathMatch: 'full' },
  { path: 'auth', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard').then((m) => m.Dashboard),
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadComponent: () => import('./components/dashboard/home/home').then((m) => m.Home),
      },
    ],
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./components/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./components/auth/register/register').then((m) => m.Register),
  },
  {
    path: 'admin',
    loadComponent: () => import('./components/admin/admin').then((m) => m.Admin),
  },
];
