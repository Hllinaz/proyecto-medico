import { inject, Injectable } from '@angular/core';
import { Observable, of, tap, map } from 'rxjs';
import { API } from '@app/constants';
import { HttpClient } from '@angular/common/http';
import { StateService } from './states.service';
import { Stadistic, DoctorResponse, Patient, PatientResponse, Doctor } from '@app/models';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private baseUrl = `${API}/api`;
  private stateService = inject(StateService);

  constructor(private http: HttpClient) {}

  getStadistics(nowDate: string, status: string): Observable<Stadistic> {
    return this.http
      .get<Stadistic>(`${this.baseUrl}/citas/estadisticas/?fecha=${nowDate}&estado=${status}`)
      .pipe();
  }

  getDoctors(): Observable<Doctor[]> {
    return this.http
      .get<DoctorResponse[]>(`${API}/api/medicos`)
      .pipe(map((medicos) => medicos.map((m) => this.transformDoctor(m))));
  }

  getPatients(): Observable<Patient[]> {
    return this.http
      .get<PatientResponse[]>(`${API}/api/pacientes`)
      .pipe(map((pacientes) => pacientes.map((p) => this.transformPatient(p))));
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
