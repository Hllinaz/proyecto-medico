import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './not_found.html',
  styleUrls: ['./not_found.css'],
})
export class NotFound {
  constructor(private router: Router) {}

  goHome() {
    // Puedes ajustar esta ruta según tu aplicación
    this.router.navigate(['/home']);
  }

  goBack() {
    window.history.back();
  }
}
