import { USER_TYPES, APPOINTMENT_STATUS } from '@app/constants';

// Tipo para TypeScript (opcional pero recomendado)
export type UserType = (typeof USER_TYPES)[keyof typeof USER_TYPES];
export type AppointmentStatus = (typeof APPOINTMENT_STATUS)[keyof typeof APPOINTMENT_STATUS];
