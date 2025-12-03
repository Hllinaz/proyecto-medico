// services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, from, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { UserCreate, UserType } from '@models';
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

export interface User {
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

  register(user: UserCreate): Observable<RegisterResponse> {
    const userFormat = {
      nombre: user.name,
      apellido: user.lastname,
      tipo_documento: user.doc_type,
      numero_documetno: user.document,
      email: user.email,
      telefono: user.number,
      password_hash: user.password,
      id_rol: 1,
    };

    return this.http.post<RegisterResponse>(`${API}/api/usuarios/`, userFormat);
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
