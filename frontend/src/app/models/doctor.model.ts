export interface DoctorResponse {
  id_medico: number;
  nombre: string;
  apellido: string;
  especialidad: string;
  estado: string;
}

export interface Doctor {
  id: number;
  name: string;
  lastname: string;
  speciality: string;
  status: string;
}

export interface SpecialityResponse {
  id_medico: number;
  especialidad: string;
}

export interface Speciality {
  id: number;
  name: string;
}
