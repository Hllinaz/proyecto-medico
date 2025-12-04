import { Component, OnInit, Input, Output, EventEmitter, inject, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AppointmentCreate,
  Appointment,
  AppointmentFormData,
  User,
  Speciality,
  Doctor,
} from '@models';
import { AuthService, DoctorService } from '@app/services';
import { USER_TYPES } from '@app/constants';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppointmentService } from '@app/services';
import { ComunicacionService } from '@app/services/comunicacion.service';

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointment.html',
  styleUrls: ['./appointment.css'],
})
export class AppointmentComponent implements OnInit {
  @Input() appointmentData?: AppointmentFormData;
  @Output() save = new EventEmitter<AppointmentFormData>();
  @Output() cancel = new EventEmitter<void>();
  @Output() delete = new EventEmitter<string>();

  private authService = inject(AuthService);
  private doctorService = inject(DoctorService);
  private destroyRef = inject(DestroyRef);
  private appointmentService = inject(AppointmentService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Variables del componente
  actualRoute: 'create' | 'edit' = 'create';
  formData: AppointmentFormData;
  USER_TYPES = USER_TYPES;

  actualUser = this.authService.getCurrentUser();

  // Datos para selectores
  specialities: Speciality[] = [];
  doctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];
  filteredSpeciality: Speciality[] = [];

  constructor() {
    // Inicializar formData con valores por defecto
    this.formData = this.getDefaultFormData();
  }

  ngOnInit() {
    // 1. Determinar modo PRIMERO (antes de cualquier otra cosa)
    this.determineMode();

    console.log('Modo detectado:', this.actualRoute);
    console.log('URL actual:', this.router.url);
    console.log('Fragmento de URL:', this.route.snapshot.url);

    // 2. Cargar datos de doctores y especialidades
    this.loadDoctorsAndSpecialities();

    // 3. Si estamos en modo edición, cargar datos
    if (this.actualRoute === 'edit') {
      this.loadEditData();
    }

    // 4. Si hay datos de entrada (@Input), inicializar formulario
    if (this.appointmentData) {
      this.initializeForm();
    }
  }

  private determineMode() {
    // Opción más confiable: verificar la ruta actual
    const currentUrl = this.router.url;

    console.log('Determinando modo para URL:', currentUrl);

    if (currentUrl.includes('/edit/')) {
      this.actualRoute = 'edit';
      console.log('Modo: EDIT');
    } else if (currentUrl.includes('/create')) {
      this.actualRoute = 'create';
      console.log('Modo: CREATE');
    } else {
      // También verificar por parámetros de ruta
      const path = this.route.snapshot.routeConfig?.path;
      if (path?.includes('edit')) {
        this.actualRoute = 'edit';
      } else if (path?.includes('create')) {
        this.actualRoute = 'create';
      }
    }

    // Debug adicional
    console.log('Route params:', this.route.snapshot.params);
    console.log('Route data:', this.route.snapshot.data);
  }

  private loadDoctorsAndSpecialities() {
    // Cargar doctores
    this.doctorService
      .getDoctors()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (records) => {
          this.doctors = records;
          console.log('Doctores cargados:', records.length);
        },
        error: (err) => {
          console.error('Error cargando doctores:', err);
        },
      });

    // Cargar especialidades
    this.doctorService
      .getSpecialities()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (records) => {
          this.specialities = records;
          console.log('Especialidades cargadas:', records.length);
        },
        error: (err) => {
          console.error('Error cargando especialidades:', err);
        },
      });
  }

  private loadEditData() {
    console.log('Cargando datos para edición...');

    // Opción 1: Obtener ID de la ruta
    const appointmentId = this.route.snapshot.params['id'];
    console.log('ID de cita para editar:', appointmentId);

    if (appointmentId) {
      // Cargar la cita desde el servicio
      this.appointmentService
        .getAppointmentById(appointmentId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (appointment) => {
            if (appointment) {
              console.log('Cita cargada para edición:', appointment);
              this.populateFormForEdit(appointment);
            } else {
              console.warn('Cita no encontrada para ID:', appointmentId);
              // Redirigir a create si no se encuentra
              this.router.navigate(['/appointment/create']);
            }
          },
          error: (err) => {
            console.error('Error cargando cita para edición:', err);
            this.router.navigate(['/appointment/create']);
          },
        });
    } else {
      console.warn('No hay ID en la ruta para editar');
      this.router.navigate(['/appointment/create']);
    }
  }

  private populateFormForEdit(appointment: any): void {
    // Mapear los datos de la cita al formulario
    // Ajusta según la estructura de tu Appointment
    this.formData = {
      patientId: appointment.id_paciente?.toString() || '',
      patientName: this.getPatientName(),
      specialtyId: appointment.specialty_id || 0,
      doctorId: appointment.id_medico || 0,
      date: appointment.fecha_cita
        ? new Date(appointment.fecha_cita).toISOString().split('T')[0]
        : this.getTomorrowDate(),
      startTime: appointment.hora_inicio || '09:00',
      endTime: appointment.hora_fin || '10:00',
      reason: appointment.motivo || '',
      notes: '',
      selectedSlot: 0,
      // Si necesitas el ID para actualizar
      ...(appointment.id && { id: appointment.id }),
    };

    // Filtrar especialidades por doctor seleccionado
    this.filterSpecialityByDoctor();

    console.log('Formulario poblado para edición:', this.formData);
  }

  private getDefaultFormData(): AppointmentCreate {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    return {
      patientId: this.actualUser?.id || '',
      patientName: this.getPatientName(),
      specialtyId: 0,
      doctorId: 0,
      date: tomorrow.toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      reason: '',
      notes: '',
      selectedSlot: 0,
    };
  }

  private initializeForm() {
    if (this.isEditMode()) {
      // Para edición
      this.formData = { ...(this.appointmentData as Appointment) };
    } else {
      // Para creación
      this.formData = {
        ...this.getDefaultFormData(),
        ...(this.appointmentData as AppointmentCreate),
      };
    }
  }

  isEditMode(): boolean {
    // Verificar tanto el route como si hay appointmentData con ID
    return (
      this.actualRoute === 'edit' || (this.appointmentData ? 'id' in this.appointmentData : false)
    );
  }

  getAppointment(): Appointment | null {
    return this.isEditMode() ? (this.formData as Appointment) : null;
  }

  filterSpecialityByDoctor() {
    if (this.formData.doctorId) {
      this.filteredSpeciality = this.specialities.filter(
        (speciality) => String(speciality.id) === String(this.formData.doctorId),
      );
      console.log(
        'Especialidades filtradas para doctor',
        this.formData.doctorId,
        ':',
        this.filteredSpeciality,
      );
    } else {
      this.filteredSpeciality = [];
    }
  }

  onDoctorChange() {
    console.log('Doctor cambiado a:', this.formData.doctorId);
    this.filterSpecialityByDoctor();
  }

  onSubmit() {
    console.log('Enviando formulario en modo:', this.actualRoute);
    console.log('Datos del formulario:', this.formData);

    // Validaciones
    if (
      !this.formData.patientId ||
      !this.formData.doctorId ||
      !this.formData.date ||
      !this.formData.startTime ||
      !this.formData.endTime ||
      !this.formData.reason
    ) {
      alert('Por favor, complete todos los campos requeridos');
      return;
    }

    if (this.actualRoute === 'edit') {
      // Lógica para actualizar cita existente
      this.updateAppointment();
    } else {
      // Lógica para crear nueva cita
      this.createAppointment();
    }
  }

  private createAppointment() {
    this.appointmentService.createAppointment(this.formData).subscribe({
      next: (response) => {
        console.log('Cita creada exitosamente:', response);
        alert('Cita agendada exitosamente');
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Error creando cita:', err);
        alert(err.message || 'No se pudo agendar la cita');
      },
    });
  }

  updateAppointment() {
    const appointmentId = this.route.snapshot.params['id'];

    this.appointmentService
      .updatedAppointments(appointmentId, this.actualUser?.id, this.formData)
      .subscribe({
        next: (response) => {
          console.log('Cita actualizada exitosamente:', response);
          alert('Cita actualizada exitosamente');
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error('Error creando cita:', err);
          alert(err.message || 'No se pudo agendar la cita');
        },
      });
  }

  onCancel() {
    if (this.isEditMode()) {
      const appointment = this.getAppointment();
      if (appointment && confirm('¿Está seguro de que desea cancelar esta cita?')) {
        this.delete.emit(appointment.id);
      }
    } else {
      this.cancel.emit();
      this.router.navigate(['/home']);
    }
  }

  redirectToHome() {
    this.router.navigate(['/home']);
  }

  getFormTitle(): string {
    return this.actualRoute === 'edit' ? 'Editar / Reprogramar Cita' : 'Crear Nueva Cita';
  }

  getAppointmentId(): string {
    return this.isEditMode() ? (this.formData as Appointment).appointmentNumber || '' : '';
  }

  getAppointmentStatus(): string {
    if (this.isEditMode()) {
      const status = (this.formData as Appointment).status;
      return status ? status.charAt(0).toUpperCase() + status.slice(1) : '';
    }
    return '';
  }

  getAppointmentDescription(): string {
    return this.formData.reason || '';
  }

  getPatientName(): string {
    const userData: User | null = this.authService.getUserData();
    return userData ? `${userData.name} ${userData.lastname}` : 'Paciente';
  }

  getTomorrowDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  timeSlots = [
    { id: 1, start: '08:00', end: '09:00' },
    { id: 2, start: '09:00', end: '10:00' },
    { id: 3, start: '10:00', end: '11:00' },
    { id: 4, start: '11:00', end: '12:00' },
    { id: 5, start: '13:00', end: '14:00' },
    { id: 6, start: '14:00', end: '15:00' },
    { id: 7, start: '15:00', end: '16:00' },
    { id: 8, start: '16:00', end: '17:00' },
    { id: 9, start: '17:00', end: '18:00' },
  ];

  selectTimeSlot(slot: any): void {
    this.formData.selectedSlot = slot.id;
    this.formData.startTime = slot.start;
    this.formData.endTime = slot.end;
    console.log('Slot seleccionado:', slot);
  }

  isSlotSelected(slot: any): boolean {
    return this.formData.selectedSlot === slot.id;
  }
}
