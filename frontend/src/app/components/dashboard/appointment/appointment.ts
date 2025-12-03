// components/appointment-form.component.ts
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentCreate, Appointment, AppointmentFormData } from '@models';

// Interfaces locales para selectores
interface Specialty {
  id: string;
  name: string;
}

interface Doctor {
  id: string;
  name: string;
  specialtyId: string;
}

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointment.html',
  styleUrls: ['./appointment.css'],
})
export class AppointmentComponent implements OnInit {
  // Datos de entrada: pueden ser para creación o edición
  @Input() appointmentData?: AppointmentFormData;

  // Eventos de salida
  @Output() save = new EventEmitter<AppointmentFormData>();
  @Output() cancel = new EventEmitter<void>();
  @Output() delete = new EventEmitter<string>();

  // Variables del componente
  actualRoute: 'create' | 'edit' = 'create';
  formData: AppointmentFormData;

  // Datos para selectores
  specialities: Specialty[] = [
    { id: '1', name: 'Medicina General' },
    { id: '2', name: 'Pediatría' },
    { id: '3', name: 'Cardiología' },
    { id: '4', name: 'Dermatología' },
  ];

  doctors: Doctor[] = [
    { id: '1', name: 'Dr. Juan Pérez', specialtyId: '1' },
    { id: '2', name: 'Dra. María García', specialtyId: '2' },
    { id: '3', name: 'Dr. Carlos López', specialtyId: '3' },
    { id: '4', name: 'Dra. Ana Martínez', specialtyId: '4' },
  ];

  // Doctores filtrados por especialidad
  filteredDoctors: Doctor[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {
    // Inicializar formData con valores por defecto para creación
    this.formData = this.getDefaultFormData();
  }

  ngOnInit() {
    // Determinar si estamos en modo edición o creación
    this.determineMode();

    // Si hay datos de entrada, inicializar el formulario
    if (this.appointmentData) {
      this.initializeForm();
    }

    // Filtrar doctores inicialmente
    this.filterDoctorsBySpecialty();
  }

  private determineMode() {
    // Opción 1: Por URL
    const url = this.router.url;
    if (url.includes('/edit')) {
      this.actualRoute = 'edit';
    } else if (url.includes('/create')) {
      this.actualRoute = 'create';
    }

    // Opción 2: Por parámetro de ruta
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.actualRoute = 'edit';
      }
    });

    // Opción 3: Por datos de entrada
    if (this.appointmentData && this.isEditMode()) {
      this.actualRoute = 'edit';
    }
  }

  private getDefaultFormData(): AppointmentCreate {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    return {
      patientId: '',
      patientName: '',
      specialtyId: '',
      doctorId: '',
      date: tomorrow.toISOString().split('T')[0], // Fecha de mañana
      time: '09:00',
      reason: '',
      notes: '',
    };
  }

  private initializeForm() {
    if (this.isEditMode()) {
      // Para edición, usamos los datos existentes
      this.formData = { ...(this.appointmentData as Appointment) };
    } else {
      // Para creación, mezclamos datos por defecto con los proporcionados
      this.formData = {
        ...this.getDefaultFormData(),
        ...(this.appointmentData as AppointmentCreate),
      };
    }
  }

  // Type guard para verificar si estamos en modo edición
  isEditMode(): boolean {
    return this.appointmentData ? 'id' in this.appointmentData : false;
  }

  // Obtener el objeto Appointment si estamos editando
  getAppointment(): Appointment | null {
    return this.isEditMode() ? (this.formData as Appointment) : null;
  }

  // Filtrar doctores por especialidad seleccionada
  filterDoctorsBySpecialty() {
    if (this.formData.specialtyId) {
      this.filteredDoctors = this.doctors.filter(
        (doctor) => doctor.specialtyId === this.formData.specialtyId,
      );

      // Si el doctor actual no está en la lista filtrada, resetear doctorId
      if (
        this.formData.doctorId &&
        !this.filteredDoctors.some((d) => d.id === this.formData.doctorId)
      ) {
        this.formData.doctorId = '';
      }
    } else {
      this.filteredDoctors = [];
      this.formData.doctorId = '';
    }
  }

  onSpecialtyChange() {
    this.filterDoctorsBySpecialty();
  }

  onSubmit() {
    // Validaciones básicas
    if (
      !this.formData.patientId ||
      !this.formData.specialtyId ||
      !this.formData.doctorId ||
      !this.formData.date ||
      !this.formData.time
    ) {
      alert('Por favor, complete todos los campos requeridos');
      return;
    }

    // Emitir los datos del formulario
    this.save.emit(this.formData);
  }

  onCancelAppointment() {
    if (this.isEditMode()) {
      const appointment = this.getAppointment();
      if (appointment && confirm('¿Está seguro de que desea cancelar esta cita?')) {
        this.delete.emit(appointment.id);
      }
    }
  }

  redirectToHome() {
    this.cancel.emit();
    // O redirigir mediante router
    // this.router.navigate(['/home']);
  }

  // Métodos auxiliares para la vista
  getFormTitle(): string {
    return this.actualRoute === 'edit' ? 'Editar / Reprogramar Cita' : 'Crear Nueva Cita';
  }

  getAppointmentId(): string {
    return this.isEditMode() ? (this.formData as Appointment).appointmentNumber : '';
  }

  getAppointmentStatus(): string {
    if (this.isEditMode()) {
      const status = (this.formData as Appointment).status;
      return status.charAt(0).toUpperCase() + status.slice(1);
    }
    return '';
  }

  getAppointmentDescription(): string {
    return this.formData.reason || '';
  }

  getPatientName(): string {
    return this.formData.patientName || '';
  }

  // Agregar este método a la clase del componente
  getTomorrowDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }
}
