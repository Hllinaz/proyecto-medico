import { Component, Input, input } from '@angular/core';
import { USER_TYPES, APPOINTMENT_STATUS } from '@constants';
import { UserType } from '@models';
import { StateService } from '@services';

@Component({
  selector: 'app-next-patient',
  imports: [],
  templateUrl: './next.html',
  styleUrl: './next.css',
})
export class Next {
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

  constructor(private state: StateService) {}

  // Usar getters para obtener valores dinámicos
  get statusLabel(): string {
    return this.state.getStatusLabel(this.statusState);
  }

  get statusClass(): string {
    return this.state.getStatusClass(this.statusState);
  }
}
