import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptors';
import { loadingInterceptor } from './interceptors/loading.interceptor';

// 👉 URL del backend
export const API_URL = 'http://localhost:8000/api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([loadingInterceptor, authInterceptor])),

    // 👉 Registrar el provider de la API
    { provide: 'API_URL', useValue: API_URL },
  ],
};
