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
        children: [
          {
            path: 'create',
            loadComponent: () =>
              import('./components/dashboard/appointment/appointment').then(
                (m) => m.AppointmentComponent,
              ),
          },
          {
            path: 'edit/:id', // Considera agregar parámetro para edición específica
            loadComponent: () =>
              import('./components/dashboard/appointment/appointment').then(
                (m) => m.AppointmentComponent,
              ),
          },
          { path: '', redirectTo: 'home', pathMatch: 'full' },
        ],
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

  // Rutas de autenticación
  {
    path: 'auth/login',
    loadComponent: () => import('./components/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./components/auth/register/register').then((m) => m.Register),
  },

  // Ruta para 404 - considerar crear un componente específico
  {
    path: '**',
    loadComponent: () => import('./components/not_found/not_found').then((m) => m.NotFound),
    // O si prefieres redirigir: redirectTo: 'auth/login'
  },
];
