// guards/admin.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { MockDataService } from '@services';
import { USER_TYPES } from '@constants';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: MockDataService,
    private router: Router,
  ) {}

  canActivate(): boolean | UrlTree {
    const currentUser = this.authService.getCurrentUser();

    console.log('=== AdminGuard (/admin) ===');
    console.log('Usuario:', currentUser?.email, 'Tipo:', currentUser?.type);

    // Solo ADMIN puede acceder a /admin
    if (currentUser?.type === USER_TYPES.ADMIN) {
      console.log('AdminGuard: Admin autorizado → Permitir acceso a /admin');
      return true;
    }

    // Si está logueado pero no es admin, redirigir según su tipo
    if (currentUser) {
      console.log(
        `AdminGuard: Usuario ${currentUser.type} intentando acceder a /admin → Redirigir`,
      );

      switch (currentUser.type) {
        case USER_TYPES.PATIENT:
          return this.router.createUrlTree(['/patient/home']);
        case USER_TYPES.DOCTOR:
          return this.router.createUrlTree(['/doctor/home']);
        default:
          return this.router.createUrlTree(['/auth/login']);
      }
    }

    // No logueado
    console.log('AdminGuard: No logueado → /auth/login');
    return this.router.createUrlTree(['/auth/login']);
  }
}
