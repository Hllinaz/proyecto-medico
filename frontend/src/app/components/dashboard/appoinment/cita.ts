import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-cita',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cita.html',
  styleUrls: ['./cita.css'],
})
export class Cita {
  redirectToHome() {}
}
