import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { USER_TYPES } from '@constants';
import { AuthService } from '@services';

@Injectable({
  providedIn: 'root',
})
export class TypeValidationGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const userTypeFromRoute = route.paramMap.get('type');
    const currentUser = this.authService.getCurrentUser();
    const currentUrl = this.router.url;

    console.log('=== TypeValidationGuard ===');
    console.log('URL actual:', currentUrl);
    console.log('Tipo en ruta:', userTypeFromRoute);
    console.log('Usuario actual:', currentUser?.id, 'Tipo:', currentUser?.type);

    // 1. Si NO está logueado → ir a login
    if (!currentUser) {
      console.log('Guard: Usuario no logueado → /auth/login');
      return this.router.createUrlTree(['/auth/login']);
    }

    // 2. ADMIN intentando acceder a /admin (esta ruta debería usar otro guard)
    // Pero si llega aquí, lo redirigimos a /doctor/home
    if (userTypeFromRoute === USER_TYPES.ADMIN) {
      console.log('Guard: Ruta /admin detectada → Redirigir a /doctor/home');
      return this.router.createUrlTree(['/doctor/home']);
    }

    // 3. Tipos válidos para este guard (solo patient y doctor)
    const validDashboardTypes = [USER_TYPES.PATIENT, USER_TYPES.DOCTOR];

    // 4. Si el tipo en la ruta NO es patient o doctor
    if (!userTypeFromRoute || !validDashboardTypes.includes(userTypeFromRoute as any)) {
      console.log('Guard: Tipo inválido en ruta → Redirigir según usuario');
      return this.redirectToUserDashboard(currentUser.type || '');
    }

    // 5. Lógica por tipo de usuario
    switch (currentUser.type) {
      case USER_TYPES.PATIENT:
        // Paciente solo puede acceder a /patient
        if (userTypeFromRoute === USER_TYPES.PATIENT) {
          console.log('Guard: Paciente accediendo a su dashboard → Permitir');
          return true;
        } else {
          console.log('Guard: Paciente intentando acceder a doctor → Redirigir a /patient/home');
          return this.router.createUrlTree(['/patient/home']);
        }

      case USER_TYPES.DOCTOR:
        // Doctor solo puede acceder a /doctor
        if (userTypeFromRoute === USER_TYPES.DOCTOR) {
          console.log('Guard: Doctor accediendo a su dashboard → Permitir');
          return true;
        } else {
          console.log('Guard: Doctor intentando acceder a patient → Redirigir a /doctor/home');
          return this.router.createUrlTree(['/doctor/home']);
        }

      case USER_TYPES.ADMIN:
        // Admin puede acceder a /doctor pero NO a /patient
        if (userTypeFromRoute === USER_TYPES.DOCTOR) {
          console.log('Guard: Admin accediendo a doctor dashboard → Permitir');
          return true;
        } else if (userTypeFromRoute === USER_TYPES.PATIENT) {
          console.log('Guard: Admin NO puede acceder a patient → Redirigir a /doctor/home');
          return this.router.createUrlTree(['/doctor/home']);
        }
        break;

      default:
        console.log('Guard: Tipo de usuario desconocido → Login');
        return this.router.createUrlTree(['/auth/login']);
    }

    // 6. Si llegamos aquí, algo salió mal
    console.log('Guard: Caso no manejado → Redirigir a dashboard');
    return this.redirectToUserDashboard(currentUser.type);
  }

  private redirectToUserDashboard(userType: string): UrlTree {
    console.log('RedirectToUserDashboard para:', userType);

    switch (userType) {
      case USER_TYPES.PATIENT:
        return this.router.createUrlTree(['/patient/home']);
      case USER_TYPES.DOCTOR:
      case USER_TYPES.ADMIN:
        // Tanto doctor como admin van a /doctor/home
        return this.router.createUrlTree(['/doctor/home']);
      default:
        return this.router.createUrlTree(['/auth/login']);
    }
  }
}
