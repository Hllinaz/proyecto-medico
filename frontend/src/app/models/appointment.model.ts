// models/appointment.model.ts
import { AppointmentStatus } from './state.model';
// Datos base comunes para creación y edición
export interface AppointmentBase {
  patientId: string;
  patientName: string;
  specialtyId: number;
  doctorId: number;
  date: string; // Formato: YYYY-MM-DD
  startTime: string; // Formato: HH:MM
  endTime: string;
  reason: string;
  notes?: string;
  selectedSlot: number;
}

// Para creación de nueva cita
export interface AppointmentCreate extends AppointmentBase {
  // Puedes agregar propiedades específicas para creación si es necesario
  isEmergency?: boolean;
  selectedSlot: number;
}

// Para edición de cita existente
export interface Appointment extends AppointmentBase {
  id: string;
  appointmentNumber: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  originalDate: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface AppointmentResponse {
  fecha_cita: string;
  hora_inicio: string;
  hora_fin: string;
  motivo: string;
  estado_cita: string;
  id_paciente: string;
  id_medico: number;
  id_usuario_crea: string;
}

// Tipo union para el formulario
export type AppointmentFormData = AppointmentCreate | Appointment;
