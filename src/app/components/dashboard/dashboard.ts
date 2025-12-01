import { Component, OnInit } from '@angular/core';
import { RouterOutlet, ActivatedRoute } from '@angular/router';
import { USER_TYPES } from '@constants';
import type { UserType } from '@models';

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  currentUserType?: UserType;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const typeFromRoute = params.get('type');

      if (typeFromRoute === USER_TYPES.PATIENT || typeFromRoute === USER_TYPES.DOCTOR) {
        this.currentUserType = typeFromRoute;
      }
    });
  }
}
