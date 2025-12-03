import { Component, Input, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
  private state = inject(StateService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

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

  // Usar getters para obtener valores dinámicos
  get statusLabel(): string {
    return this.state.getStatusLabel(this.statusState);
  }

  get statusClass(): string {
    return this.state.getStatusClass(this.statusState);
  }

  redirectToAppoint() {
    this.router.navigate(['appointment/edit'], { relativeTo: this.route.parent });
  }
}
