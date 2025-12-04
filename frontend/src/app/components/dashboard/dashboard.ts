import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '@app/services';
import { AppointmentService } from '@app/services';

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  auth = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  appointmentService = inject(AppointmentService);

  ngOnInit(): void {}

  redirectToProfile() {
    this.router.navigate(['profile'], { relativeTo: this.route });
  }

  redirectToHome() {
    this.router.navigate(['home']);
  }
}
