// interceptors/loading.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '@services';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // Mostrar loading
  loadingService.show();

  // Ocultar loading cuando termine la petición
  return next(req).pipe(
    finalize(() => {
      loadingService.hide();
    }),
  );
};
