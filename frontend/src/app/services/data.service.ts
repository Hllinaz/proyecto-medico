import { Injectable } from '@angular/core';
import { Observable, of, tap, map } from 'rxjs';
import { Doctor, PatientShowAD } from '@models';
import { API } from '@app/constants';
import { HttpClient } from '@angular/common/http';

export interface PatientResponse {
  id_paciente: number;
  fecha_nacimiento: string;
  direccion: string;
  sexo: string;
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private http: HttpClient) {}

  getCountDoctor(): number {
    return 0;
  }

  getCountPatient(): number {
    return 0;
  }

  getCountAppointment(): number {
    return 0;
  }

  getCountSolitude(): number {
    return 0;
  }

  getDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${API}/api/medicos`).pipe(
      tap((response) => {
        console.log(response);
      }),
    );
  }

  getPatients(): Observable<PatientShowAD[]> {
    return this.http
      .get<PatientResponse[]>(`${API}/api/pacientes`)
      .pipe(map((pacientes) => pacientes.map((p) => this.transformPatient(p))));
  }

  private transformPatient(paciente: PatientResponse): PatientShowAD {
    const birthDate = new Date(paciente.fecha_nacimiento);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    return {
      id: paciente.id_paciente,
      birthDate: birthDate,
      address: paciente.direccion,
      gender: paciente.sexo === 'M' ? 'Masculino' : 'Femenino',
      age: age,
      isAdult: age >= 18,
    };
  }
}
