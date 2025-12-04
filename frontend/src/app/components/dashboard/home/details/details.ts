import { Component, Input, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  AppointmentResult,
  AppointmentService,
  AuthService,
  StateService,
  UserService,
} from '@services';
import { APPOINTMENT_STATUS, USER_TYPES } from '@constants';
import { AppointmentResponse, UserType } from '@app/models';
import { Subscription } from 'rxjs';
import { ComunicacionService } from '@app/services/comunicacion.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
@Component({
  selector: 'app-details',
  imports: [],
  templateUrl: './details.html',
  styleUrl: './details.css',
})
export class Details implements OnInit {
  APPOINTMENT_STATUS = APPOINTMENT_STATUS;
  private state = inject(StateService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private appointment = inject(AppointmentService);
  private comunicacion = inject(ComunicacionService);
  private appointmentService = inject(AppointmentService);
  private destroyRef = inject(DestroyRef);
  private userService = inject(UserService);
  private authService = inject(AuthService);

  id = signal<string>('');
  cita = signal<AppointmentResult | null>(null);
  user = signal<any>(null);
  doctor = signal<any>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  readonly USER_TYPES = USER_TYPES;
  @Input() userType?: UserType;

  speciality = '';

  age = '';
  number = '';

  ngOnInit(): void {
    // Suscribirse al ID y cargar la cita automáticamente
    this.comunicacion.mensajeActual$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((mensaje) => {
        this.id.set(mensaje);
        console.log('ID recibido:', mensaje);

        if (mensaje && typeof mensaje === 'string') {
          this.loadAppointment(mensaje);
        }
      });
  }

  loadAppointment(appointmentId: string): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.cita.set(null);

    this.appointmentService
      .getAppointmentById(appointmentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (appointment) => {
          if (appointment) {
            this.cita.set(this.appointmentService.transformAppointment(appointment));
            console.log(this.cita());
            this.loadDoctor(this.cita()?.doctor_id);
            this.loadUser(this.cita()?.patient_id);
          } else {
            this.error.set('Cita no encontrada');
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set('Error al cargar la cita: ' + err.message);
          console.error('Error:', err);
          this.isLoading.set(false);
        },
      });
  }

  loadUser(id: number | undefined): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.user.set(null);

    this.userService
      .getUserById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          if (id) {
            this.user.set(user);
            console.log(this.user());
          } else {
            this.error.set('Doctor no encontrado');
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set('Error al cargar doctor: ' + err.message);
          this.isLoading.set(false);
        },
      });
  }

  loadDoctor(id: number | undefined): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.user.set(null);

    this.userService
      .getUserById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          if (id) {
            this.doctor.set(user);
            console.log(this.doctor());
          } else {
            this.error.set('Doctor no encontrado');
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set('Error al cargar doctor: ' + err.message);
          this.isLoading.set(false);
        },
      });
  }

  statusState = APPOINTMENT_STATUS.CONFIRMED;

  // Usar getters para obtener valores dinámicos
  get statusLabel(): string {
    return this.state.getStatusLabel(this.cita()?.status || APPOINTMENT_STATUS.CANCELLED);
  }

  get statusClass(): string {
    return this.state.getStatusClass(this.cita()?.status || APPOINTMENT_STATUS.CANCELLED);
  }

  cancelAppointment() {
    if (confirm('Estas Seguro?')) {
      this.appointment.cancelledAppointment(this.cita()?.id).subscribe();
    }
  }

  redirectToAppoint() {
    console.log('Hola - cita antes:', this.cita());

    // 1. GUARDAR el valor en una variable local ANTES de cualquier operación
    const citaActual = { ...this.cita() }; // Copia profunda si es objeto complejo
    // o para objetos simples:
    // const citaActual = this.cita();

    if (!citaActual) {
      console.error('No hay cita disponible para redirigir');
      return;
    }

    console.log('Cita guardada en variable local:', citaActual);

    // 2. Usar la variable local en lugar de this.cita()
    this.comunicacion.enviarMensaje({
      patientId: citaActual?.patient_id,
      patientName: `${this.user()?.name} ${this.user()?.lastname}`,
      specialtyId: 0,
      doctorId: citaActual.doctor_id, // ← Usar variable local
      date: citaActual.appointment_date,
      startTime: citaActual.start_hour,
      endTime: citaActual.end_hour,
      reason: citaActual.note,
      notes: '',
      selectedSlot: 0,
    });

    console.log('Mas tarde - cita después de enviar mensaje:', this.cita());
    console.log('Variable local todavía tiene datos:', citaActual);

    // 3. Usar la variable local para la navegación
    if (!citaActual.id) {
      console.error('La cita no tiene ID:', citaActual);
      return;
    }

    this.router.navigate([`appointment/edit/${citaActual.id}`], {
      relativeTo: this.route.parent,
    });
  }
}
