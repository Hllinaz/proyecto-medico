import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '@app/services';

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  auth = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  redirectToProfile() {
    this.router.navigate(['profile'], { relativeTo: this.route });
  }

  redirectToHome() {
    this.router.navigate(['home']);
  }
}
