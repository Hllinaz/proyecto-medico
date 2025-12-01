import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Details } from './details/details';
import { Historial } from './historial/historial';
import { Next } from './next/next';

import { StateService } from '@app/services';
import { USER_TYPES } from '@constants';
import { UserType } from '@models';

@Component({
  selector: 'dashboard-home',
  imports: [Details, Historial, Next],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  readonly USER_TYPES = USER_TYPES;

  userType?: UserType;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Manejar el caso donde parent puede ser undefined
    const typeFromRoute = this.route.parent?.snapshot.paramMap.get('type') ?? null;

    if (typeFromRoute === USER_TYPES.PATIENT || typeFromRoute === USER_TYPES.DOCTOR) {
      this.userType = typeFromRoute;
    }
  }

  redirectToAppoint() {
    this.router.navigate(['appointment'], { relativeTo: this.route.parent });
  }

  redirectToSchedule() {
    this.router.navigate(['schedule'], { relativeTo: this.route.parent });
  }
}
