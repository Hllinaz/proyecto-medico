// src/app/services/state.service.ts
import { Injectable } from '@angular/core';
import { USER_TYPES, APPOINTMENT_STATUS } from '@constants';
import { UserType, AppointmentStatus } from '@models';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  readonly USER_TYPES = USER_TYPES;
  readonly APPOINTMENT_STATUS = APPOINTMENT_STATUS;

  getUser(userType: UserType): string {
    const labels = {
      [this.USER_TYPES.PATIENT]: 'Paciente',
      [this.USER_TYPES.DOCTOR]: 'Médico',
      [this.USER_TYPES.ADMIN]: 'Administrador',
    };
    return labels[userType] || 'Desconocido';
  }

  validateUserType(type: string | null): UserType | null {
    // Si el tipo es válido, lo usamos, sino usamos paciente por defecto
    if (type && this.isValidUserType(type)) {
      return type as UserType;
    }
    return null;
  }

  isValidUserType(type: string): type is UserType {
    return Object.values(USER_TYPES).includes(type as UserType);
  }

  getStatusLabel(appointmentStatus: AppointmentStatus): string {
    const labels = {
      [this.APPOINTMENT_STATUS.PENDING]: 'Pendiente',
      [this.APPOINTMENT_STATUS.CONFIRMED]: 'Confirmado',
      [this.APPOINTMENT_STATUS.COMPLETED]: 'Completado',
      [this.APPOINTMENT_STATUS.CANCELLED]: 'Cancelado',
      [this.APPOINTMENT_STATUS.SCHEDULED]: 'Listado',
    };
    return labels[appointmentStatus] || 'Error';
  }

  getStatusClass(appointmentStatus: AppointmentStatus): string {
    const labels = {
      [this.APPOINTMENT_STATUS.PENDING]: 'pendiente',
      [this.APPOINTMENT_STATUS.CONFIRMED]: 'confirmado',
      [this.APPOINTMENT_STATUS.COMPLETED]: 'completado',
      [this.APPOINTMENT_STATUS.CANCELLED]: 'cancelado',
      [this.APPOINTMENT_STATUS.SCHEDULED]: 'listado',
    };
    return labels[appointmentStatus] || 'Error';
  }
}
