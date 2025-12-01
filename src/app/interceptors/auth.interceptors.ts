// interceptors/auth.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  console.log(`[Interceptor] ${req.method} ${req.url}`);

  // Obtener token de localStorage
  const token = localStorage.getItem('token');

  // Clonar request para agregar headers
  let clonedReq = req;

  if (token) {
    clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    console.log('[Interceptor] Token agregado');
  } else {
    clonedReq = req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
  }

  // Agregar header de tipo de usuario si existe
  const userType = localStorage.getItem('userType');
  if (userType) {
    clonedReq = clonedReq.clone({
      setHeaders: {
        'X-User-Type': userType,
      },
    });
  }

  // Procesar la request y manejar errores
  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('[Interceptor] Error:', error);

      // Manejo específico de errores HTTP
      switch (error.status) {
        case 401: // Unauthorized
          console.log('[Interceptor] Token inválido/expirado');
          localStorage.removeItem('token');
          localStorage.removeItem('currentUser');
          localStorage.removeItem('userType');
          router.navigate(['/auth/login']);
          break;

        case 403: // Forbidden
          console.log('[Interceptor] Acceso denegado');
          // Podrías redirigir a una página de acceso denegado
          break;

        case 404: // Not Found
          console.log('[Interceptor] Recurso no encontrado');
          break;

        case 500: // Internal Server Error
          console.error('[Interceptor] Error del servidor');
          // Podrías mostrar un toast de error
          break;

        default:
          console.log(`[Interceptor] Error ${error.status}: ${error.message}`);
      }

      return throwError(() => error);
    }),
  );
};
