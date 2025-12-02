// app.routes.ts
import { Routes } from '@angular/router';
import { TypeValidationGuard } from '@guards/type.guard';
import { AdminGuard } from '@guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'auth', redirectTo: 'auth/login', pathMatch: 'full' },

  // Ruta específica para admin (sin guard de tipo)
  {
    path: 'admin',
    loadComponent: () => import('./components/admin/admin').then((m) => m.Admin),
    canActivate: [AdminGuard],
  },

  // Rutas de dashboard con validación de tipos
  {
    path: ':type',
    loadComponent: () => import('./components/dashboard/dashboard').then((m) => m.Dashboard),
    canActivate: [TypeValidationGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () => import('./components/dashboard/home/home').then((m) => m.Home),
      },
      {
        path: 'appointment',
        loadComponent: () => import('./components/dashboard/appoinment/cita').then((m) => m.Cita),
      },
      {
        path: 'schedule',
        loadComponent: () =>
          import('./components/dashboard/schedule/schedule').then((m) => m.Schedule),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./components/dashboard/profile/profile').then((m) => m.Profile),
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

  { path: '**', redirectTo: 'home' },
];
