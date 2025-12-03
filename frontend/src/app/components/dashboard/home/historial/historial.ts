import { Component, inject, signal, effect } from '@angular/core';
import { OnInit } from '@angular/core';
import { AppointmentService, AuthService, User, Appointment } from '@app/services';
import { APPOINTMENT_STATUS, USER_TYPES } from '@app/constants';

@Component({
  selector: 'app-historial',
  imports: [],
  templateUrl: './historial.html',
  styleUrl: './historial.css',
})
export class Historial implements OnInit {
  private appointmentService = inject(AppointmentService);
  private authService = inject(AuthService);
  APPOINTMENT_STATUS = APPOINTMENT_STATUS;
  appointments = signal<Appointment[]>([]);
  isLoading = signal(true);

  ngOnInit(): void {
    const actualUser = this.authService.getCurrentUser();
    this.isLoading.set(true);

    switch (actualUser?.type) {
      case USER_TYPES.PATIENT:
        this.appointmentService.getAppointmentsByPatient(actualUser?.id || '').subscribe({
          next: (response) => {
            this.isLoading.set(false);
            this.appointments.set(response);
          },
          error: () => {
            this.isLoading.set(false);
            this.appointments.set([]);
          },
        });

        break;
      case USER_TYPES.DOCTOR:
        this.appointmentService.getAppointmentsByDoctor(actualUser?.id || '').subscribe({
          next: (response) => {
            this.isLoading.set(false);
            this.appointments.set(response);
          },
          error: () => {
            this.isLoading.set(false);
            this.appointments.set([]);
          },
        });
        break;
      case USER_TYPES.ADMIN:
        this.appointmentService.getAppointments().subscribe({
          next: (response) => {
            this.isLoading.set(false);
            this.appointments.set(response);
            console.log(this.appointments());
          },
          error: () => {
            this.isLoading.set(false);
            this.appointments.set([]);
          },
        });
        break;
      default:
        this.isLoading.set(false);
        break;
    }
  }
}
