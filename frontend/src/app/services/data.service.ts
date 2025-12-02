import { Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { Doctor, Patient } from '@models';
import { API } from '@app/constants';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private doctor: Doctor[] = [];
  private patient: Patient[] = [];

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

  getPatients(): Observable<Patient[]> {
    return of(this.patient);
  }
}
