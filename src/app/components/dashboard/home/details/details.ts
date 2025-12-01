import { Component, Input } from '@angular/core';
import { StateService } from '@services';
import { APPOINTMENT_STATUS, USER_TYPES } from '@constants';
import { UserType } from '@app/models';
@Component({
  selector: 'app-details',
  imports: [],
  templateUrl: './details.html',
  styleUrl: './details.css',
})
export class Details {
  readonly USER_TYPES = USER_TYPES;
  @Input() userType?: UserType;
  date = '';
  hour = '';
  name = '';
  speciality = '';
  description = '';
  age = '';
  number = '';

  statusState = APPOINTMENT_STATUS.CONFIRMED;

  constructor(private state: StateService) {}

  // Usar getters para obtener valores dinámicos
  get statusLabel(): string {
    return this.state.getStatusLabel(this.statusState);
  }

  get statusClass(): string {
    return this.state.getStatusClass(this.statusState);
  }
}
