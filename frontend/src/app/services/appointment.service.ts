// services/appointment.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AppointmentCreate, AppointmentFormData, AppointmentStatus } from '@models';
import { API } from '../constants';
import { StateService } from '@services';

interface AppointmentResponse {
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

export interface Appointment {
  id: number;
  name: number | string;
  doctor: number | string;
  date: Date;
  stateConfirmed: AppointmentStatus;
}

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private baseUrl = `${API}/api/citas`;
  private stateService = inject(StateService);

  constructor(private http: HttpClient) {}

  getAppointments(): Observable<Appointment[]> {
    return this.http
      .get<AppointmentResponse[]>(`${this.baseUrl}/`)
      .pipe(map((citas) => citas.map((p) => this.transformAppointment(p))));
  }

  // Obtener citas por paciente
  getAppointmentsByPatient(patientId: string): Observable<Appointment[]> {
    return this.http
      .get<AppointmentResponse[]>(`${this.baseUrl}/por_paciente/?id_paciente=${patientId}`)
      .pipe(map((citas) => citas.map((p) => this.transformAppointment(p))));
  }

  private transformAppointment(citas: AppointmentResponse): Appointment {
    const date = new Date(citas.fecha_cita);

    const state = this.stateService.setAppointment(citas.estado_cita);

    return {
      id: citas.id_cita,
      name: citas.id_paciente,
      doctor: citas.id_medico,
      date: date,
      stateConfirmed: state,
    };
  }

  // Obtener citas por médico
  getAppointmentsByDoctor(doctorId: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.baseUrl}/por_medico/?id_medico=${doctorId}`);
  }
}
