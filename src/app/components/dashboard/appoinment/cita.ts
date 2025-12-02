import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CitaService, Cita } from '@services/cita.service'; // si no tienes alias @services, usa la ruta relativa

@Component({
  selector: 'app-cita',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cita.html',
  styleUrls: ['./cita.css'],
})
export class Cita implements OnInit {

  citas: Cita[] = [];
  cargando = false;
  error: string | null = null;

  constructor(private citaService: CitaService) {}

  ngOnInit(): void {
    this.cargarCitas();
  }

  cargarCitas(): void {
    this.cargando = true;
    this.error = null;

    this.citaService.getCitas().subscribe({
      next: (data) => {
        this.citas = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al cargar las citas';
        this.cargando = false;
      }
    });
  }
}
