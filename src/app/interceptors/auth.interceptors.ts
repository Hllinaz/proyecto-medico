// interceptors/auth.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '@services';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  console.log(`[Interceptor] ${req.method} ${req.url}`);

  // Obtener token desde el AuthService (usa 'access' internamente)
  const token = auth.getAccessToken();

  // Construimos los headers base
  const baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  // Si hay token, agregamos Authorization
  if (token) {
    baseHeaders['Authorization'] = `Bearer ${token}`;
    console.log('[Interceptor] Token agregado');
  }

  // Agregar header de tipo de usuario si existe (admin/doctor/patient)
  const userType = auth.getUserType();
  if (userType) {
    baseHeaders['X-User-Type'] = userType;
  }

  const clonedReq = req.clone({
    setHeaders: baseHeaders,
  });

  // Procesar la request y manejar errores
  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('[Interceptor] Error:', error);

      switch (error.status) {
        case 401: // Unauthorized
          console.log('[Interceptor] Token inválido/expirado');
          // usamos el logout centralizado del AuthService
          auth.logout();
          break;

        case 403: // Forbidden
          console.log('[Interceptor] Acceso denegado');
          break;

        case 404:
          console.log('[Interceptor] Recurso no encontrado');
          break;

        case 500:
          console.error('[Interceptor] Error del servidor');
          break;

        default:
          console.log(`[Interceptor] Error ${error.status}: ${error.message}`);
      }

      return throwError(() => error);
    }),
  );
};
