// services/appointment.service.ts
import { Injectable, inject, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, of } from 'rxjs';
import {
  AppointmentCreate,
  AppointmentFormData,
  AppointmentStatus,
  AppointmentResponse,
} from '@models';
import { API, APPOINTMENT_STATUS, USER_TYPES } from '../constants';
import { AuthService, StateService } from '@services';
import { formatCurrency } from '@angular/common';
import { UserId } from '@services';
import { catchError } from 'rxjs';
import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';
export interface Appointment {
  estado_cita: string;
  fecha_cita: string;
  fecha_creacion: string;
  fecha_modificacion: string | null;
  hora_fin: string;
  hora_inicio: string;
  id_cita: number;
  id_medico: number;
  id_paciente: number;
  id_usuario_crea: number;
  motivo: string;
}

export interface AppointmentResult {
  status: AppointmentStatus;
  appointment_date: Date;
  created_date: Date;
  modification_date: Date | null;
  start_hour: string;
  end_hour: string;
  id: number;
  doctor_id: number;
  patient_id: number;
  user_create_id: number;
  note: string;
}

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private baseUrl = `${API}/api/citas`;
  private stateService = inject(StateService);

  private _appointments = signal<Appointment[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  private _appointmentsCache = signal<Map<string, Appointment[]>>(new Map());
  private _cacheTimestamp = signal<Map<string, number>>(new Map());

  // Signasls Publico
  appointments = computed(() => this._appointments());
  isLoading = computed(() => this._loading());
  error = computed(() => this._error());

  private readonly CACHE_DURATION = 5 * 60 * 1000;

  constructor(private http: HttpClient) {}

  updatedAppointments(
    id: string,
    actual_id: string | undefined,
    data: AppointmentFormData,
  ): Observable<Appointment> {
    this.invalidateCache();

    const format = {
      fecha_cita: data.date,
      hora_inicio: data.startTime,
      hora_fin: data.endTime,
      motico: data.reason,
      estado_cita: 'AGENDADA',
      id_paciente: data.patientId,
      id_medico: data.doctorId,
      id_usuario_crea: actual_id,
    };

    return this.http.post<Appointment>(`${this.baseUrl}/${id}/reprogramar/`, format);
  }

  getAppointmentById(
    appointmentId: number | string,
    forceRefresh = false,
  ): Observable<Appointment | null> {
    // Primero buscar en el cache local
    if (!forceRefresh) {
      const cachedAppointment = this.findInCache(appointmentId);
      if (cachedAppointment) {
        return of(cachedAppointment);
      }
    }

    // Si no está en cache o forceRefresh=true, hacer petición a la API
    this._loading.set(true);
    this._error.set(null);

    return this.http.get<Appointment>(`${this.baseUrl}/${appointmentId}/`).pipe(
      tap({
        next: (appointment) => {
          // Actualizar cache con esta cita individual
          this.updateAppointmentInCache(appointment);
          this._loading.set(false);
        },
        error: (err) => {
          this._error.set(err.message || `Error al cargar la cita ${appointmentId}`);
          this._loading.set(false);
        },
      }),
      catchError((error) => {
        console.error(`Error obteniendo cita ${appointmentId}:`, error);
        return of(null); // Retornar null en caso de error
      }),
    );
  }

  private findInCache(appointmentId: number | string): Appointment | null {
    // Convertir appointmentId a número para comparar
    const id = Number(appointmentId);

    // Buscar en todas las entradas del cache
    for (const [cacheKey, appointments] of this._appointmentsCache().entries()) {
      const appointment = appointments.find((app) => app.id_cita === id);
      if (appointment) {
        console.log(`Cita ${id} encontrada en cache: ${cacheKey}`);
        return appointment;
      }
    }

    // También buscar en el signal actual
    const currentAppointment = this._appointments().find((app) => app.id_cita === id);
    if (currentAppointment) {
      console.log(`Cita ${id} encontrada en signal actual`);
      return currentAppointment;
    }

    return null;
  }

  private updateAppointmentInCache(appointment: Appointment): void {
    const appointmentId = appointment.id_cita;

    // Buscar en qué cache está esta cita
    for (const [cacheKey, appointments] of this._appointmentsCache().entries()) {
      const index = appointments.findIndex((app) => app.id_cita === appointmentId);

      if (index !== -1) {
        // Actualizar la cita existente
        const updatedAppointments = [...appointments];
        updatedAppointments[index] = appointment;

        // Actualizar el cache
        const newCache = new Map(this._appointmentsCache());
        newCache.set(cacheKey, updatedAppointments);
        this._appointmentsCache.set(newCache);

        console.log(`Cita ${appointmentId} actualizada en cache: ${cacheKey}`);
        return;
      }
    }

    // Si no se encuentra en ningún cache, añadirla al cache "general"
    const generalCacheKey = 'all_appointments';
    const currentGeneralCache = this._appointmentsCache().get(generalCacheKey) || [];
    const newGeneralCache = [...currentGeneralCache, appointment];

    const newCache = new Map(this._appointmentsCache());
    newCache.set(generalCacheKey, newGeneralCache);
    this._appointmentsCache.set(newCache);

    console.log(`Cita ${appointmentId} añadida al cache general`);
  }

  getAppointmentsByPatient(patientId: string, forceRefresh = false): Observable<Appointment[]> {
    const cacheKey = `user_${patientId}`;
    if (!forceRefresh && this.isCacheValid(cacheKey)) {
      const cachedData = this._appointmentsCache().get(cacheKey);
      if (cachedData) {
        this._appointments.set(cachedData);
        return new Observable((observer) => {
          observer.next(cachedData);
          observer.complete();
        });
      }
    }

    this._loading.set(true);
    this._error.set(null);

    return this.http
      .get<Appointment[]>(`${this.baseUrl}/por_paciente/?id_paciente=${patientId}`)
      .pipe(
        tap({
          next: (appointments) => {
            this.updateCache(cacheKey, appointments);
            this._appointments.set(appointments);
            this._loading.set(false);
          },
          error: (err) => {
            this._error.set(err.message || 'Error al cargar las citas');
            this._loading.set(false);
          },
        }),
      );
  }

  getAppointments(adminId: string, forceRefresh = false): Observable<Appointment[]> {
    const cacheKey = `user_${adminId}`;

    if (!forceRefresh && this.isCacheValid(cacheKey)) {
      const cachedData = this._appointmentsCache().get(cacheKey);
      if (cachedData) {
        this._appointments.set(cachedData);
        return new Observable((observer) => {
          observer.next(cachedData);
          observer.complete();
        });
      }
    }

    this._loading.set(true);
    this._error.set(null);

    return this.http.get<Appointment[]>(`${this.baseUrl}/`).pipe(
      tap({
        next: (appointments) => {
          this.updateCache(cacheKey, appointments);
          this._appointments.set(appointments);
          this._loading.set(false);
        },
        error: (err) => {
          this._error.set(err.message || 'Error al cargar las citas');
          this._loading.set(false);
        },
      }),
    );
  }

  getAppointmentsByDoctor(doctorId: string, forceRefresh = true): Observable<Appointment[]> {
    const cacheKey = `user_${doctorId}`;

    if (!forceRefresh && this.isCacheValid(cacheKey)) {
      const cachedData = this._appointmentsCache().get(cacheKey);
      if (cachedData) {
        this._appointments.set(cachedData);
        return new Observable((observer) => {
          observer.next(cachedData);
          observer.complete();
        });
      }
    }

    this._loading.set(true);
    this._error.set(null);

    return this.http.get<Appointment[]>(`${this.baseUrl}/?id_medico=${doctorId}`).pipe(
      tap({
        next: (appointments) => {
          this.updateCache(cacheKey, appointments);
          this._appointments.set(appointments);
          this._loading.set(false);
        },
        error: (err) => {
          this._error.set(err.message || 'Error al cargar las citas');
          this._loading.set(false);
        },
      }),
    );
  }

  createAppointment(data: AppointmentFormData): Observable<AppointmentResponse> {
    this.invalidateCache();

    const format: AppointmentResponse = {
      fecha_cita: data.date,
      hora_inicio: data.startTime,
      hora_fin: data.endTime,
      motivo: data.reason,
      estado_cita: 'AGENDADA',
      id_paciente: data.patientId,
      id_medico: data.doctorId,
      id_usuario_crea: data.patientId,
    };
    return this.http.post<AppointmentResponse>(`${this.baseUrl}/`, format);
  }

  // Obtener citas por médico

  private isCacheValid(cacheKey: string): boolean {
    const timestamp = this._cacheTimestamp().get(cacheKey);
    if (!timestamp) return false;

    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  private updateCache(cacheKey: string, appointments: Appointment[]): void {
    const newCache = new Map(this._appointmentsCache());
    newCache.set(cacheKey, appointments);
    this._appointmentsCache.set(newCache);

    const newTimestamps = new Map(this._cacheTimestamp());
    newTimestamps.set(cacheKey, Date.now());
    this._cacheTimestamp.set(newTimestamps);
  }

  invalidateCache(): void {
    this._appointmentsCache.set(new Map());
    this._cacheTimestamp.set(new Map());
  }

  cancelledAppointment(id: number | undefined): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.baseUrl}/${id}/cancelar/`, { id_cita: id });
  }

  getNextAppointment(): AppointmentResult | null {
    const today = new Date();

    console.log(this._appointments(), this.appointments(), this._appointmentsCache());

    const appointments = this.appointments()
      .map((app) => this.transformAppointment(app))
      .filter((app) => app.appointment_date >= today)
      .sort((a, b) => a.appointment_date.getTime() - b.appointment_date.getTime());

    return appointments.length > 0 ? appointments[0] : null;
  }
  // Reiniciar estado
  reset(): void {
    this._appointments.set([]);
    this._loading.set(false);
    this._error.set(null);
    this.invalidateCache();
  }

  transformAppointments(appointments: Appointment[]): AppointmentResult[] {
    return appointments.map(this.transformAppointment);
  }

  transformAppointment = (appointment: Appointment): AppointmentResult => {
    const status = this.stateService.setAppointment(appointment.estado_cita);

    return {
      status: status,
      appointment_date: new Date(appointment.fecha_cita),
      created_date: new Date(appointment.fecha_creacion),
      modification_date: appointment.fecha_modificacion
        ? new Date(appointment.fecha_modificacion)
        : null,
      start_hour: appointment.hora_inicio,
      end_hour: appointment.hora_fin,
      id: appointment.id_cita,
      doctor_id: appointment.id_medico,
      patient_id: appointment.id_paciente,
      user_create_id: appointment.id_usuario_crea,
      note: appointment.motivo,
    };
  };

  doRequest(
    actualUser: UserId | null,
    appointmentService: AppointmentService,
    forceRefresh = false,
  ): Observable<Appointment[]> | undefined {
    switch (actualUser?.type) {
      case USER_TYPES.PATIENT:
        return appointmentService.getAppointmentsByPatient(actualUser?.id, forceRefresh);
      case USER_TYPES.DOCTOR:
        return appointmentService.getAppointmentsByDoctor(actualUser?.id, forceRefresh);
      case USER_TYPES.ADMIN:
        return appointmentService.getAppointments(actualUser?.id, forceRefresh);
      default:
        return;
    }
  }
}
