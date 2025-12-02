// services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, from, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { UserType } from '@models';
import { API } from '@app/constants';
import { StateService } from '@services';

interface LoginResponse {
  access: string;
  refresh: string;
  rol: UserType;
  user_id: string;
}

interface RegisterResponse {
  user: User;
}

interface User {
  id: string;
  type: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private stateService: StateService,
  ) {
    // Verificar si hay un usuario en localStorage al inicializar
    const savedUser: User = {
      id: localStorage.getItem('user') || '',
      type: localStorage.getItem('type') || '',
    };
    if (savedUser) {
      this.currentUserSubject.next(savedUser);
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API}/api/login/`, { email, password }).pipe(
      tap((response) => {
        // Guardar tokens
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);

        const type = this.stateService.setUser(response.rol);

        // Guardar usuario
        this.currentUserSubject.next({ id: response.user_id, type: type });
        localStorage.setItem('user', response.user_id);
        localStorage.setItem('type', type);
      }),
    );
  }

  register(
    name: string,
    lastname: string,
    email: string,
    password: string,
  ): Observable<RegisterResponse> {
    return this.http
      .post<RegisterResponse>('/api/auth/register', { name, lastname, email, password })
      .pipe(tap((response) => {}));
  }

  logout() {
    // Limpiar datos de sesión
    this.currentUserSubject.next(null);
    localStorage.removeItem('user');
    localStorage.removeItem('admin');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.router.navigate(['/auth/login']);
  }

  getAccessToken() {
    return localStorage.getItem('access_token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  getUserType(): string | null {
    const user = this.currentUserSubject.value;
    return user ? user.type : null;
  }
}
