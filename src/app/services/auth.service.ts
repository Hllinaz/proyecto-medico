// services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, from, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '@models';

interface LoginResponse {
  user: User;
  token: string;
}

interface RegisterResponse {
  user: User;
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
  ) {
    // Verificar si hay un usuario en localStorage al inicializar
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/auth/login', { email, password }).pipe(
      tap((response) => {
        // Guardar usuario y token
        this.currentUserSubject.next(response.user);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        localStorage.setItem('token', response.token);
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
      .pipe(
        tap((response) => {
          this.currentUserSubject.next(response.user);
        }),
      );
  }

  logout() {
    // Limpiar datos de sesión
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.router.navigate(['/auth/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  getUserType(): string | null {
    return this.currentUserSubject.value?.type || null;
  }
}
