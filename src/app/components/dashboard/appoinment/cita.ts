import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-cita',
  imports: [],
  templateUrl: './cita.html',
  styleUrls: ['./cita.css'],
})
export class Cita {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}
  redirectToHome() {
    this.router.navigate(['home'], { relativeTo: this.route.parent });
  }
}
