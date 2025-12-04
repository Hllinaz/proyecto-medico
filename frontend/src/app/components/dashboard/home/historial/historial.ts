import { Component, inject, OnInit, signal, computed, DestroyRef, Output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppointmentService, AppointmentResult } from '@app/services/appointment.service';
import { AuthService } from '@app/services/auth.service';
import { APPOINTMENT_STATUS, USER_TYPES } from '@app/constants';
import { EventEmitter } from '@angular/core';
import { ComunicacionService } from '@app/services/comunicacion.service';
import { UserService } from '@app/services';

@Component({
  selector: 'app-historial',
  imports: [],
  templateUrl: './historial.html',
  styleUrl: './historial.css',
})
export class Historial implements OnInit {
  private appointmentService = inject(AppointmentService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private comunicacion = inject(ComunicacionService);
  private userService = inject(UserService);

  @Output() detalle = new EventEmitter<number | string>();

  appointments: AppointmentResult[] = [];

  appointmentRaw = this.appointmentService.appointments;
  isLoading = this.appointmentService.isLoading;
  error = this.appointmentService.error;

  APPOINTMENT_STATUS = APPOINTMENT_STATUS;

  ngOnInit(): void {
    this.loadAppoiments(true);
  }

  loadAppoiments(forceRefresh = false): void {
    const actualUser = this.authService.getCurrentUser();
    if (!actualUser?.id) return;

    let request$;

    switch (actualUser?.type) {
      case USER_TYPES.PATIENT:
        request$ = this.appointmentService.getAppointmentsByPatient(actualUser.id, forceRefresh);
        break;
      case USER_TYPES.DOCTOR:
        request$ = this.appointmentService.getAppointmentsByDoctor(actualUser.id, forceRefresh);
        break;
      case USER_TYPES.ADMIN:
        request$ = this.appointmentService.getAppointments(actualUser.id, forceRefresh);
        break;
    }

    // Versión que SÍ maneja los datos
    request$?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.appointments = this.appointmentService.transformAppointments(response);
        this.loadData();
      },
      error: (err) => console.error('Error', err),
      complete: () => console.log('Completado'),
    });
  }

  loadData() {
    for (let app of this.appointments) {
      const patient_id = app.patient_id;
      const doctor_id = app.doctor_id;

      this.userService.getUserById(patient_id).subscribe({
        next: (response) => {},
      });
    }
  }

  viewDetalles(id: number) {
    this.comunicacion.enviarMensaje(String(id));
    console.log('Mensaje enviado', id);
  }
}
