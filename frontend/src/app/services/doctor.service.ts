import { Injectable, inject, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, of } from 'rxjs';
import { Doctor, DoctorResponse, SpecialityResponse, Speciality } from '@models';
import { API } from '../constants';
import { StateService, AuthService } from '@services';
import { catchError } from 'rxjs';

export interface Appointments {
  id_cita: number;
  fecha_cita: string;
  hora_inicio: string;
  hora_fin: string;
  motivo: string;
  estado_cita: string;
  fecha_creacion: string;
  fecha_modificacion: string;
  id_paciente: number;
  id_medico: number;
  id_usuario_crea: number;
}

@Injectable({
  providedIn: 'root',
})
export class DoctorService {
  private baseUrl = `${API}/api/medicos`;
  private http = inject(HttpClient);

  private _doctors = signal<Doctor[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  private _doctorsCache = signal<Map<string, Doctor[]>>(new Map());
  private _cacheTimestamp = signal<Map<string, number>>(new Map());
  private _doctorCache = signal<Map<number, Doctor>>(new Map());

  doctors = computed(() => this._doctors());
  isLoading = computed(() => this._loading());
  error = computed(() => this._error());

  private readonly CACHE_DURATION = 5 * 60 * 1000;

  getAppointments(doctorId: string | undefined): Observable<Appointments[]> {
    return this.http.get<Appointments[]>(`${this.baseUrl}/${doctorId}/citas`);
  }

  getSpecialities(): Observable<Speciality[]> {
    return this.http
      .get<SpecialityResponse[]>(`${API}/api/medico-especialidad/`)
      .pipe(map((speciality) => speciality.map((s) => this.transformSpeciality(s))));
  }

  getDoctorById(id: number | undefined, forceRefresh = false): Observable<Doctor | null> {
    const doctorId = Number(id);

    // 1. Verificar cache individual
    if (!forceRefresh) {
      const cachedDoctor = this._doctorCache().get(doctorId);
      if (cachedDoctor) {
        console.log(`Médico ${doctorId} encontrado en cache individual`);
        return of(cachedDoctor);
      }
    }

    // 2. Verificar en cache de lista
    if (!forceRefresh) {
      const cachedFromList = this.findDoctorInCache(doctorId);
      if (cachedFromList) {
        console.log(`Médico ${doctorId} encontrado en cache de lista`);
        return of(cachedFromList);
      }
    }

    // 3. Hacer petición HTTP individual
    this._loading.set(true);
    this._error.set(null);

    return this.http.get<DoctorResponse>(`${this.baseUrl}/${doctorId}/`).pipe(
      tap({
        next: (doctor) => {
          console.log(doctor);
        },
      }),
      map((doctorResponse) => this.transformDoctor(doctorResponse)),
      tap({
        next: (doctor) => {
          // Guardar en cache individual
          const newIndividualCache = new Map(this._doctorCache());
          newIndividualCache.set(doctorId, doctor);
          this._doctorCache.set(newIndividualCache);

          // También actualizar en cache de lista si existe
          this.updateDoctorInListCache(doctor);

          this._loading.set(false);
          console.log(`Médico ${doctorId} cargado exitosamente`);
        },
        error: (err) => {
          this._error.set(err.message || `Error al cargar el médico ${doctorId}`);
          this._loading.set(false);
          console.error(`Error cargando médico ${doctorId}:`, err);
        },
      }),
      catchError((error) => {
        console.error(`Error en petición individual de médico ${doctorId}:`, error);

        // Fallback: intentar buscar en la lista de doctores
        return this.getDoctors(forceRefresh).pipe(
          map((doctors) => {
            const doctor = doctors.find((d) => d.id === doctorId);
            if (doctor) {
              console.log(`Médico ${doctorId} encontrado en lista general como fallback`);
              return doctor;
            }
            return null;
          }),
          catchError(() => of(null)),
        );
      }),
    );
  }

  // Método auxiliar para buscar médico en cache de lista
  private findDoctorInCache(doctorId: number): Doctor | null {
    // Buscar en todas las entradas del cache
    for (const [, doctors] of this._doctorsCache().entries()) {
      const doctor = doctors.find((d) => d.id === doctorId);
      if (doctor) {
        return doctor;
      }
    }

    // También buscar en el signal actual
    const currentDoctor = this._doctors().find((d) => d.id === doctorId);
    return currentDoctor || null;
  }

  // Método para actualizar médico en cache de lista
  private updateDoctorInListCache(updatedDoctor: Doctor): void {
    // Buscar en todas las entradas del cache
    for (const [cacheKey, doctors] of this._doctorsCache().entries()) {
      const index = doctors.findIndex((d) => d.id === updatedDoctor.id);

      if (index !== -1) {
        // Actualizar el médico en la lista
        const updatedDoctors = [...doctors];
        updatedDoctors[index] = updatedDoctor;

        // Actualizar el cache
        const newCache = new Map(this._doctorsCache());
        newCache.set(cacheKey, updatedDoctors);
        this._doctorsCache.set(newCache);

        // Actualizar también el signal
        const currentDoctors = this._doctors();
        const signalIndex = currentDoctors.findIndex((d) => d.id === updatedDoctor.id);
        if (signalIndex !== -1) {
          const updatedSignalDoctors = [...currentDoctors];
          updatedSignalDoctors[signalIndex] = updatedDoctor;
          this._doctors.set(updatedSignalDoctors);
        }

        console.log(`Médico ${updatedDoctor.id} actualizado en cache de lista: ${cacheKey}`);
        return;
      }
    }
  }

  getDoctors(forceRefresh = false): Observable<Doctor[]> {
    const cacheKey = `users_all`;

    if (!forceRefresh && this.isCacheValid(cacheKey)) {
      const cachedData = this._doctorsCache().get(cacheKey);
      if (cachedData) {
        this._doctors.set(cachedData);
        return new Observable((observer) => {
          observer.next(cachedData);
          observer.complete();
        });
      }
    }

    this._loading.set(true);
    this._error.set(null);

    return this.http.get<DoctorResponse[]>(`${this.baseUrl}/`).pipe(
      map((doctors) => doctors.map((d) => this.transformDoctor(d))),
      tap({
        next: (doctors) => {
          this.updateCache(cacheKey, doctors);
          this._doctors.set(doctors);
          this._loading.set(false);
        },
        error: (err) => {
          this._error.set(err.message || 'Error al cargar los doctores');
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

  private updateCache(cacheKey: string, doctor: Doctor[]): void {
    const newCache = new Map(this._doctorsCache());
    newCache.set(cacheKey, doctor);
    this._doctorsCache.set(newCache);

    const newTimestamps = new Map(this._cacheTimestamp());
    newTimestamps.set(cacheKey, Date.now());
    this._cacheTimestamp.set(newTimestamps);
  }

  private transformSpeciality(especialidad: SpecialityResponse): Speciality {
    return {
      id: especialidad.id_medico,
      name: especialidad.especialidad,
    };
  }

  private transformDoctor(doctor: DoctorResponse): Doctor {
    return {
      id: doctor.id_medico,
      name: doctor.nombre,
      lastname: doctor.apellido,
      speciality: doctor.especialidad,
      status: doctor.estado,
    };
  }
}
