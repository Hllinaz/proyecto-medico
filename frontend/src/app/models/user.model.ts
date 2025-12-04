import { UserType } from '@models';

export interface UserResponse {
  id_usuario: number;
  nombre: string;
  apellido: string;
  tipo_documento: string;
  numero_documento: string;
  email: string;
  telefono: number;
  estado: string;
  fecha_registro: string;
  id_rol: string;
}

export interface User {
  id: number;
  name: string;
  lastname: string;
  document_type: string;
  document: string;
  email: string;
  number: number;
  status: string;
  register_date: Date;
  type: UserType;
}

export interface UserCreate {
  name: string;
  lastname: string;
  doc_type: string;
  document: string;
  email: string;
  number: string;
  password: string;
}

export interface Stadistic {
  total_medicos: number;
  total_pacientes: number;
  total_citas_dia: number;
  total_citas_estado: number;
}
