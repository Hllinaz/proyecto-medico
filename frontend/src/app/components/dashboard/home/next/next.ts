import { Component, Input, OnInit, inject } from '@angular/core';
import { USER_TYPES, APPOINTMENT_STATUS } from '@constants';
import { UserType } from '@models';
import { StateService, AppointmentService, AppointmentResult } from '@services';

@Component({
  selector: 'app-next-patient',
  imports: [],
  templateUrl: './next.html',
  styleUrl: './next.css',
})
export class Next implements OnInit {
  appointmentService = inject(AppointmentService);
  stateService = inject(StateService);
  appointment!: AppointmentResult | null;

  ngOnInit(): void {
    this.appointment = this.appointmentService.getNextAppointment();
  }

  readonly USER_TYPES = USER_TYPES;
  @Input() userType?: UserType;
  day = '';
  month = '';
  year = '';
  hour = '';
  name = '';
  speciality = '';
  age = '';
  number = '';

  statusState = APPOINTMENT_STATUS.CONFIRMED;

  // Usar getters para obtener valores dinámicos
  get statusLabel(): string {
    return this.stateService.getStatusLabel(
      this.appointment?.status || APPOINTMENT_STATUS.SCHEDULED,
    );
  }

  get statusClass(): string {
    return this.stateService.getStatusClass(
      this.appointment?.status || APPOINTMENT_STATUS.SCHEDULED,
    );
  }
}
