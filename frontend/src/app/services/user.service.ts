import { Injectable, inject, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, filter, map, of, shareReplay, tap } from 'rxjs';
import { UserResponse, User } from '@models';
import { API } from '../constants';
import { StateService, AuthService } from '@services';
import { throwError, catchError } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = `${API}/api/usuarios`;
  private authService = inject(AuthService);
  private stateService = inject(StateService);
  private http = inject(HttpClient);

  private _users = signal<User[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  private _usersCache = signal<Map<string, User[]>>(new Map());
  private _cacheTimestamp = signal<Map<string, number>>(new Map());

  private actualUser = this.authService.getCurrentUser();

  patients = computed(() => this._users());
  isLoading = computed(() => this._loading());
  error = computed(() => this._error());

  private readonly CACHE_DURATION = 5 * 60 * 1000;

  getUsers(forceRefresh = false): Observable<User[]> {
    const cacheKey = `all_users`;

    if (!forceRefresh && this.isCacheValid(cacheKey)) {
      const cachedData = this._usersCache().get(cacheKey);
      if (cachedData) {
        this._users.set(cachedData);
        return of(cachedData);
      }
    }

    this._loading.set(true);
    this._error.set(null);

    return this.http.get<UserResponse[]>(`${this.baseUrl}/`).pipe(
      map((patient) => patient.map((p) => this.transformUser(p))),
      tap({
        next: (patients) => {
          this.updateCache(cacheKey, patients);
          this._users.set(patients);
          this._loading.set(false);
        },
        error: (err) => {
          this._error.set(err.message || 'Error al cargar los usuarios');
          this._loading.set(false);
        },
      }),
      shareReplay(1),
    );
  }

  getUserById(id: number | undefined): Observable<User | null> {
    const userId = Number(id);

    if (isNaN(userId)) {
      return throwError(() => new Error('ID de usuario inválido'));
    }

    this._loading.set(true);
    this._error.set(null);

    return this.http.get<UserResponse>(`${this.baseUrl}/${userId}/`).pipe(
      map((userResponse) => this.transformUser(userResponse)),
      tap({
        next: (user) => {
          // Actualizar en cache de lista si existe
          this.updateUserInCache(user);
          this._loading.set(false);
        },
        error: (err) => {
          this._error.set(`Error al cargar usuario ${userId}: ${err.message}`);
          this._loading.set(false);

          // Fallback: buscar en la lista general
          console.log(`Intentando fallback para usuario ${userId}...`);
          return this.getUserByIdFromList(userId);
        },
      }),
      catchError((error) => {
        console.error(`Error en petición individual de usuario ${userId}:`, error);
        // Fallback a búsqueda en lista
        return this.getUserByIdFromList(userId);
      }),
    );
  }

  // Método auxiliar para buscar usuario en lista
  private getUserByIdFromList(id: number): Observable<User | null> {
    return this.getUsers(true).pipe(
      map((users) => users.find((u) => u.id === id) || null),
      catchError(() => of(null)),
    );
  }

  // Actualizar usuario en cache
  private updateUserInCache(updatedUser: User): void {
    // Buscar en cache de lista
    for (const [cacheKey, users] of this._usersCache().entries()) {
      const index = users.findIndex((u) => u.id === updatedUser.id);

      if (index !== -1) {
        // Actualizar usuario en la lista
        const updatedUsers = [...users];
        updatedUsers[index] = updatedUser;

        // Actualizar el cache
        const newCache = new Map(this._usersCache());
        newCache.set(cacheKey, updatedUsers);
        this._usersCache.set(newCache);

        // Actualizar también el signal
        const currentUsers = this._users();
        const signalIndex = currentUsers.findIndex((u) => u.id === updatedUser.id);
        if (signalIndex !== -1) {
          const updatedSignalUsers = [...currentUsers];
          updatedSignalUsers[signalIndex] = updatedUser;
          this._users.set(updatedSignalUsers);
        }

        console.log(`Usuario ${updatedUser.id} actualizado en cache`);
        return;
      }
    }
  }

  private isCacheValid(cacheKey: string): boolean {
    const timestamp = this._cacheTimestamp().get(cacheKey);
    if (!timestamp) return false;

    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  private updateCache(cacheKey: string, patients: User[]): void {
    const newCache = new Map(this._usersCache());
    newCache.set(cacheKey, patients);
    this._usersCache.set(newCache);

    const newTimestamps = new Map(this._cacheTimestamp());
    newTimestamps.set(cacheKey, Date.now());
    this._cacheTimestamp.set(newTimestamps);
  }

  private transformUser(usuario: UserResponse): User {
    const type = this.stateService.setUser(usuario.id_rol);

    return {
      id: usuario.id_usuario,
      name: usuario.nombre,
      lastname: usuario.apellido,
      document_type: usuario.tipo_documento,
      document: usuario.numero_documento,
      number: usuario.telefono,
      email: usuario.email,
      status: usuario.estado,
      type: type,
      register_date: new Date(usuario.fecha_registro),
    };
  }
}
