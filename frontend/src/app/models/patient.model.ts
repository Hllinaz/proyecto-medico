import { User } from './user.model';

export interface Patient extends User {
  birthDate: Date;
  gender: string;
  address: string;
  age: number;
  isAdult: boolean;
}

export interface PatientShowAD {
  id: number;
  birthDate: Date;
  address: string;
  gender: string;
  age: number;
  isAdult: boolean;
  fullName?: string; // Vamos a agregar esto
}
