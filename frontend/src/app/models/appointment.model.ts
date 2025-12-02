import { AppointmentStatus } from '@models';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: Date;
  time: string;
  doctor: string;
  specialty: string;
  status: AppointmentStatus;
  reason: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppointmentCreate {
  patientId: string;
  doctorId: string;
  date: Date;
  time: string;
  reason: string;
  notes?: string;
}

export interface AppointmentUpdate {
  status?: AppointmentStatus;
  notes?: string;
}
