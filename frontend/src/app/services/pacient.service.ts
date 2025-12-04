// services/appointment.service.ts
import { Injectable, inject, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { PatientResponse } from '@models';
import { API } from '../constants';
import { StateService, AuthService } from '@services';
import { Patient } from '@models';

@Injectable({
  providedIn: 'root',
})
export class PacientService {
  private baseUrl = `${API}/api/pacientes`;
  private authService = inject(AuthService);
  private stateService = inject(StateService);
  private http = inject(HttpClient);

  private _patients = signal<Patient[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  private _patientsCache = signal<Map<string, Patient[]>>(new Map());
  private _cacheTimestamp = signal<Map<string, number>>(new Map());

  private actualUser = this.authService.getCurrentUser();

  patients = computed(() => this._patients());
  isLoading = computed(() => this._loading());
  error = computed(() => this._error());

  private readonly CACHE_DURATION = 5 * 60 * 1000;

  getPatient(forceRefresh = false): Observable<Patient[]> {
    const cacheKey = `user_${this.actualUser?.id}`;

    if (!forceRefresh && this.isCacheValid(cacheKey)) {
      const cachedData = this._patientsCache().get(cacheKey);
      if (cachedData) {
        this._patients.set(cachedData);
        return new Observable((observer) => {
          observer.next(cachedData);
          observer.complete();
        });
      }
    }

    this._loading.set(true);
    this._error.set(null);

    return this.http.get<PatientResponse[]>(`${this.baseUrl}/`).pipe(
      map((patient) => patient.map((p) => this.transformPatient(p))),
      tap({
        next: (patients) => {
          this.updateCache(cacheKey, patients);
          this._patients.set(patients);
          this._loading.set(false);
        },
        error: (err) => {
          this._error.set(err.message || 'Error al cargar los pacientes');
          this._loading.set(false);
        },
      }),
    );
  }

  private isCacheValid(cacheKey: string): boolean {
    const timestamp = this._cacheTimestamp().get(cacheKey);
    if (!timestamp) return false;

    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  private updateCache(cacheKey: string, patients: Patient[]): void {
    const newCache = new Map(this._patientsCache());
    newCache.set(cacheKey, patients);
    this._patientsCache.set(newCache);

    const newTimestamps = new Map(this._cacheTimestamp());
    newTimestamps.set(cacheKey, Date.now());
    this._cacheTimestamp.set(newTimestamps);
  }

  private transformPatient(paciente: PatientResponse): Patient {
    return {
      id: paciente.id_paciente,
      name: paciente.nombre,
      lastname: paciente.apellido,
      document_type: paciente.tipo_documento,
      document: paciente.numero_documento,
      gender: paciente.sexo === 'M' ? 'Masculino' : 'Femenino',
    };
  }
}
