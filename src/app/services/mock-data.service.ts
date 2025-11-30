// services/mock-data.service.ts
import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Patient {
  id: number;
  name: string;
  age: number;
  email: string;
  phone: string;
  initial: String;
  insurance: String;
  lastVisit: String;
}

export interface Doctor {
  id: number;
  name: String;
  speciality: String;
  status: 'inactive' | 'active';
  avatar: String | null;
}

export interface MedicalRecord {
  id: number;
  date: string;
  doctor: string;
  specialty: string;
  diagnosis: string;
  treatment: string[];
}

export interface Appointment {
  id: number;
  date: string;
  time: string;
  doctor: string;
  specialty: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  
  // 📊 Datos de prueba centralizados
  private patients: Patient[] = [
    {
      id: 1,
      name: 'María González',
      age: 35,
      email: 'maria@clinica.com',
      phone: '+57 300 123 4567',
      initial: 'MG',
      insurance: 'Sura',
      lastVisit: '02 Mar, 2025'
    },
    {
      id: 202,
      name: 'Ana Lopez',
      age: 35,
      email: 'maria@clinica.com',
      phone: '+57 300 123 4567',
      initial: 'AL',
      insurance: 'Coomeva',
      lastVisit: '02 Mar, 2025"'
    },
    {
      id: 201,
      name: 'Carlos Jimenez',
      age: 35,
      email: 'maria@clinica.com',
      phone: '+57 300 123 4567',
      initial: 'MG',
      insurance: 'Sura',
      lastVisit: '02 Mar, 2025'
    },
    {
      id: 203,
      name: 'Pedro Martinez',
      age: 35,
      email: 'maria@clinica.com',
      phone: '+57 300 123 4567',
      initial: 'MG',
      insurance: 'Sura',
      lastVisit: '02 Mar, 2025'
    },
  ];

  private doctors: Doctor[] = [
    {
      id: 1,
      name: "Dr. Sebastian J.",
      speciality: "Cardiología",
      status: "active", // active o inactive
      avatar: "https://i.pravatar.cc/150?img=11"
    },
    {
      id: 2,
      name: "Dra. Maria Lopez",
      speciality: "Pediatría",
      status: "active",
      avatar: "https://i.pravatar.cc/150?img=5"
    },
    {
      id: 3,
      name: "Dr. Roberto Gomez",
      speciality: "Dermatología",
      status: "inactive",
      avatar: "https://i.pravatar.cc/150?img=3"
    },
    {
      id: 4,
      name: "Dra. Ana Torres",
      speciality: "Neurología",
      status: "active",
      avatar: null
    }
  ]
    

  private medicalRecords: MedicalRecord[] = [
    {
      id: 1,
      date: '2024-01-15',
      doctor: 'Dr. García',
      specialty: 'Medicina General',
      diagnosis: 'Control rutina - Hipertensión controlada',
      treatment: ['Losartán 50mg', 'Control cada 6 meses']
    },
    {
      id: 2,
      date: '2023-11-20',
      doctor: 'Dr. López',
      specialty: 'Traumatología',
      diagnosis: 'Esguince tobillo derecho grado I',
      treatment: ['Reposo', 'Antiinflamatorios', 'Fisioterapia']
    }
  ];

  private appointments: Appointment[] = [
    {
      id: 1,
      date: '2024-02-10',
      time: '10:30 AM',
      doctor: 'Dr. Rodríguez',
      specialty: 'Cardiología',
      status: 'confirmed'
    },
    {
      id: 2,
      date: '2024-02-15',
      time: '03:00 PM',
      doctor: 'Dra. Martínez',
      specialty: 'Dermatología',
      status: 'pending'
    }
  ];

  // 🎯 Métodos para obtener datos
  getPatients(): Observable<Patient[]> {
    return of(this.patients).pipe(delay(500)); // Simula delay de API
  }

  getPatientById(id: number): Observable<Patient | undefined> {
    const patient = this.patients.find(p => p.id === id);
    return of(patient).pipe(delay(300));
  }

  getDoctors(): Observable<Doctor[]> {
    return of(this.doctors).pipe(delay(500)); // Simula delay de API
  }

  getDoctorById(id: number): Observable<Doctor | undefined> {
    const doctor = this.doctors.find(p => p.id === id);
    return of(doctor).pipe(delay(300));
  }

  getMedicalRecords(patientId?: number): Observable<MedicalRecord[]> {
    let records = this.medicalRecords;
    if (patientId) {
      // Filtrar por paciente si se especifica
      records = this.medicalRecords.filter(r => r.id === patientId);
    }
    return of(records).pipe(delay(400));
  }

  getAppointments(patientId?: number): Observable<Appointment[]> {
    let appointments = this.appointments;
    if (patientId) {
      // Lógica de filtrado por paciente
      appointments = this.appointments.filter(a => a.id === patientId);
    }
    return of(appointments).pipe(delay(350));
  }

  // 🎯 Métodos para agregar/actualizar datos
  addAppointment(appointment: Omit<Appointment, 'id'>): Observable<Appointment> {
    const newAppointment: Appointment = {
      ...appointment,
      id: Math.max(...this.appointments.map(a => a.id)) + 1
    };
    this.appointments.push(newAppointment);
    return of(newAppointment).pipe(delay(200));
  }

  updatePatient(patient: Patient): Observable<Patient> {
    const index = this.patients.findIndex(p => p.id === patient.id);
    if (index !== -1) {
      this.patients[index] = patient;
    }
    return of(patient).pipe(delay(300));
  }
}