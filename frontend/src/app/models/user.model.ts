import { UserType } from '@models';

export interface User {
  id?: string;
  name?: string;
  email?: string;
  password?: string;
  type?: UserType; // Desde constants
  avatar?: string;
  phone?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Patient extends User {
  birthDate: Date;
  initial: string;
  insurance: string;
  lastVisit: string;
  emergencyContact?: string;
  medicalHistory?: string;
}

export interface Doctor extends User {
  speciality: string;
  licenseNumber: string;
  status: string;
  consultationPrice: number;
  availableHours?: AvailableHour[];
}

export interface AvailableHour {
  dayOfWeek: number; // 0-6 (Domingo-Sábado)
  startTime: string; // "09:00"
  endTime: string; // "17:00"
}
