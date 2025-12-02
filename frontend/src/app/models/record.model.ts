export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  date: Date;
  doctor: string;
  specialty: string;
  diagnosis: string;
  treatment: string[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}
