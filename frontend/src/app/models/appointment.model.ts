// models/appointment.model.ts

// Datos base comunes para creación y edición
export interface AppointmentBase {
  patientId: string;
  patientName: string;
  specialtyId: string;
  doctorId: string;
  date: string; // Formato: YYYY-MM-DD
  time: string; // Formato: HH:MM
  reason: string;
  notes?: string;
}

// Para creación de nueva cita
export interface AppointmentCreate extends AppointmentBase {
  // Puedes agregar propiedades específicas para creación si es necesario
  isEmergency?: boolean;
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

// Tipo union para el formulario
export type AppointmentFormData = AppointmentCreate | Appointment;
