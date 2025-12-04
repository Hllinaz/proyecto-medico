export interface PatientResponse {
  id_paciente: number;
  nombre: string;
  apellido: string;
  tipo_documento: string;
  numero_documento: string;
  sexo: string;
}

export interface Patient {
  id: number;
  name: string;
  lastname: string;
  document_type: string;
  document: string;
  gender: string;
}
