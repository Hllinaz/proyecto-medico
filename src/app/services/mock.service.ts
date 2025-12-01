// services/mock-data.service.ts
import { Injectable } from '@angular/core';
import { Observable, of, throwError, delay } from 'rxjs';
import { Patient, Doctor, MedicalRecord, Appointment, AppointmentStatus, User } from '@models';
import { USER_TYPES, APPOINTMENT_STATUS } from '@constants';

@Injectable({
  providedIn: 'root',
})
export class MockDataService {
  private currentUser: User | null = null;

  constructor() {
    // Recuperar usuario de localStorage al iniciar
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
    }
  }

  private users: User[] = [
    // Pacientes
    {
      id: '1',
      name: 'María González',
      email: 'maria@clinica.com',
      password: '123456', // Agregar password
      type: USER_TYPES.PATIENT,
      phone: '+57 300 123 4567',
      createdAt: new Date('2023-01-15'),
      birthDate: new Date('1990-05-15'),
      emergencyContact: '+57 310 555 6677',
      medicalHistory: 'Hipertensión controlada',
      initial: 'MG',
      insurance: 'Sura',
      lastVisit: '02 Mar, 2025',
    } as Patient,
    {
      id: '2',
      name: 'Ana Lopez',
      email: 'ana@clinica.com',
      password: '123456',
      type: USER_TYPES.PATIENT,
      phone: '+57 300 123 8888',
      createdAt: new Date('2023-03-10'),
      birthDate: new Date('1988-08-22'),
      emergencyContact: '+57 320 444 5566',
      medicalHistory: 'Esguince tobillo 2023',
      initial: 'AL',
      insurance: 'Coomeva',
      lastVisit: '15 Feb, 2025',
    } as Patient,
    {
      id: '3',
      name: 'Carlos Jimenez',
      email: 'carlos@clinica.com',
      password: '123456',
      type: USER_TYPES.PATIENT,
      phone: '+57 300 123 9999',
      createdAt: new Date('2023-05-20'),
      birthDate: new Date('1985-12-03'),
      emergencyContact: '+57 315 777 8899',
      medicalHistory: 'Control rutina',
      initial: 'CJ',
      insurance: 'Sura',
      lastVisit: '10 Ene, 2025',
    } as Patient,

    // Doctores
    {
      id: '101',
      name: 'Dr. Sebastian J.',
      email: 'sebastian@clinica.com',
      password: '123456',
      type: USER_TYPES.DOCTOR,
      speciality: 'Cardiología',
      licenseNumber: 'MED-12345',
      consultationPrice: 120000,
      status: 'active',
      avatar: 'https://i.pravatar.cc/150?img=11',
      phone: '+57 301 234 5678',
      createdAt: new Date('2020-03-15'),
      availableHours: [
        { dayOfWeek: 1, startTime: '08:00', endTime: '12:00' },
        { dayOfWeek: 3, startTime: '14:00', endTime: '18:00' },
      ],
    } as Doctor,
    {
      id: '102',
      name: 'Dra. Maria Lopez',
      email: 'maria.lopez@clinica.com',
      password: '123456',
      type: USER_TYPES.DOCTOR,
      speciality: 'Pediatría',
      licenseNumber: 'MED-12346',
      consultationPrice: 90000,
      status: 'active',
      avatar: 'https://i.pravatar.cc/150?img=5',
      phone: '+57 302 345 6789',
      createdAt: new Date('2019-07-22'),
      availableHours: [
        { dayOfWeek: 2, startTime: '09:00', endTime: '13:00' },
        { dayOfWeek: 4, startTime: '15:00', endTime: '19:00' },
      ],
    } as Doctor,
    {
      id: '103',
      name: 'Dr. Roberto Gomez',
      email: 'roberto@clinica.com',
      password: '123456',
      type: USER_TYPES.ADMIN,
      speciality: 'Dermatología',
      licenseNumber: 'MED-12347',
      consultationPrice: 150000,
      status: 'inactive',
      avatar: 'https://i.pravatar.cc/150?img=3',
      phone: '+57 303 456 7890',
      createdAt: new Date('2021-01-10'),
      availableHours: [],
    } as Doctor,
  ];

  private medicalRecords: MedicalRecord[] = [
    {
      id: '1001',
      patientId: '1',
      doctorId: '101',
      date: new Date('2024-01-15'),
      doctor: 'Dr. Sebastian J.',
      specialty: 'Cardiología',
      diagnosis: 'Control rutina - Hipertensión controlada',
      treatment: ['Losartán 50mg', 'Control cada 6 meses'],
      notes: 'Paciente estable, presión arterial dentro de parámetros normales',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: '1002',
      patientId: '1',
      doctorId: '102',
      date: new Date('2023-11-20'),
      doctor: 'Dra. Maria Lopez',
      specialty: 'Pediatría',
      diagnosis: 'Control crecimiento y desarrollo',
      treatment: ['Vacuna influenza', 'Suplemento vitamínico'],
      notes: 'Niño con desarrollo normal para su edad',
      createdAt: new Date('2023-11-20'),
      updatedAt: new Date('2023-11-20'),
    },
  ];

  private appointments: Appointment[] = [
    {
      id: '2001',
      patientId: '1',
      doctorId: '101',
      date: new Date('2024-02-10'),
      time: '10:30',
      doctor: 'Dr. Sebastian J.',
      specialty: 'Cardiología',
      status: APPOINTMENT_STATUS.CONFIRMED,
      reason: 'Control presión arterial',
      notes: 'Traer exámenes de laboratorio',
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-25'),
    },
    {
      id: '2002',
      patientId: '2',
      doctorId: '102',
      date: new Date('2024-02-15'),
      time: '15:00',
      doctor: 'Dra. Maria Lopez',
      specialty: 'Pediatría',
      status: APPOINTMENT_STATUS.PENDING,
      reason: 'Consulta primera vez',
      notes: 'Nuevo paciente',
      createdAt: new Date('2024-01-22'),
      updatedAt: new Date('2024-01-22'),
    },
    {
      id: '2003',
      patientId: '3',
      doctorId: '101',
      date: new Date('2024-02-12'),
      time: '11:00',
      doctor: 'Dr. Sebastian J.',
      specialty: 'Cardiología',
      status: APPOINTMENT_STATUS.CANCELLED,
      reason: 'Evaluación cardíaca',
      notes: 'Paciente canceló por viaje',
      createdAt: new Date('2024-01-18'),
      updatedAt: new Date('2024-01-30'),
    },
  ];

  login(email: string, password: string): Observable<any> {
    console.log('MockDataService.login llamado con:', { email, password });

    // Buscar usuario
    const user = this.users.find((u) => u.email === email && u.password === password);

    console.log('Usuario encontrado:', user);

    if (user) {
      // Crear respuesta
      const response = {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          type: user.type,
        },
        token: 'mock-token-' + user.id,
      };

      this.currentUser = response.user;
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      localStorage.setItem('token', response.token);

      return of(response).pipe(delay(500));
    }
    return throwError(() => new Error('Credenciales inválidas'));
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  getUserType(): string | null {
    return this.currentUser?.type || null;
  }
  // Métodos existentes pero usando el array unificado
  getPatients(): Observable<Patient[]> {
    const patients = this.users.filter((user) => user.type === USER_TYPES.PATIENT) as Patient[];
    return of(patients).pipe(delay(500));
  }

  getDoctors(): Observable<Doctor[]> {
    const doctors = this.users.filter((user) => user.type === USER_TYPES.DOCTOR) as Doctor[];
    return of(doctors).pipe(delay(500));
  }

  // Nuevos métodos usando el array unificado
  getAllUsers(): Observable<User[]> {
    return of(this.users).pipe(delay(300));
  }

  getUserById(id: string): Observable<User | undefined> {
    const user = this.users.find((u) => u.id === id);
    return of(user).pipe(delay(300));
  }

  // Para login
  authenticate(email: string, password: string): Observable<User | undefined> {
    const user = this.users.find((u) => u.email === email && u.password === password);
    return of(user).pipe(delay(400));
  }

  getMedicalRecords(patientId?: string): Observable<MedicalRecord[]> {
    let records = this.medicalRecords;
    if (patientId) {
      records = this.medicalRecords.filter((r) => r.patientId === patientId);
    }
    return of(records).pipe(delay(400));
  }

  getAppointments(patientId?: string): Observable<Appointment[]> {
    let appointments = this.appointments;
    if (patientId) {
      appointments = this.appointments.filter((a) => a.patientId === patientId);
    }
    return of(appointments).pipe(delay(350));
  }

  getAppointmentsByStatus(status: AppointmentStatus): Observable<Appointment[]> {
    const filteredAppointments = this.appointments.filter((a) => a.status === status);
    return of(filteredAppointments).pipe(delay(300));
  }

  addAppointment(
    appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>,
  ): Observable<Appointment> {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.appointments.push(newAppointment);
    return of(newAppointment).pipe(delay(200));
  }

  updateAppointment(
    id: string,
    updates: Partial<Appointment>,
  ): Observable<Appointment | undefined> {
    const index = this.appointments.findIndex((a) => a.id === id);
    if (index !== -1) {
      this.appointments[index] = {
        ...this.appointments[index],
        ...updates,
        updatedAt: new Date(),
      };
      return of(this.appointments[index]).pipe(delay(300));
    }
    return of(undefined);
  }

  addMedicalRecord(
    recordData: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>,
  ): Observable<MedicalRecord> {
    const newRecord: MedicalRecord = {
      ...recordData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.medicalRecords.push(newRecord);
    return of(newRecord).pipe(delay(250));
  }

  // 🔧 Métodos auxiliares
  private generateId(): string {
    return Date.now().toString();
  }
}
