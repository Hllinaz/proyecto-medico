// services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, from, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { UserCreate, UserType } from '@models';
import { API } from '@app/constants';
import { StateService } from '@services';
import { User } from '@models';

interface LoginResponse {
  access: string;
  refresh: string;
  rol: UserType;
  user_id: string;
}

interface RegisterResponse {
  user: UserId;
}

export interface UserId {
  id: string;
  type: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserId | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private stateService: StateService,
  ) {
    // Verificar si hay un usuario en localStorage al inicializar
    const savedUser: UserId = {
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

  register(user: UserCreate | any, id_rol = 3): Observable<RegisterResponse> {
    const userFormat = {
      nombre: user.name | user.nombre,
      apellido: user.lastname | user.apellido,
      tipo_documento: user.doc_type | user.tipo_documento,
      numero_documento: user.document | user.numero_documento,
      email: user.email | user.email,
      telefono: user.number | user.numero,
      password_hash: user.password | user.password,
      id_rol: id_rol,
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

  getUserData(): User | null {
    try {
      const userData = localStorage.getItem('userData');
      // Verificar si hay datos
      if (!userData || userData.trim() === '') {
        return null;
      }

      const parsed = JSON.parse(userData);

      return parsed;
    } catch (error) {
      console.error('Error al parsear userData:', error);
      return null;
    }
  }

  getAccessToken() {
    return localStorage.getItem('access_token');
  }

  getCurrentUser(): UserId | null {
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
