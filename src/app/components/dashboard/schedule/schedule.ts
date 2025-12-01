// cita.component.ts
import { Component, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';

interface Cita {
  id: number;
  paciente: string;
  tipo: string;
  estado: 'confirmado' | 'pendiente' | 'cancelado';
  dia: number; // 1 = Lun, 2 = Mar, ..., 6 = Sáb
  hora: number; // 1 = 08:00, 2 = 09:00, ..., 10 = 17:00
  duracion?: number; // duración en slots de hora (opcional)
}

@Component({
  selector: 'app-cita',
  imports: [NgClass],
  templateUrl: './schedule.html',
  styleUrls: ['./schedule.css'],
})
export class Schedule implements OnInit {
  // Datos de ejemplo
  citasData: Cita[] = [
    {
      id: 1,
      paciente: 'Juan Pérez',
      tipo: 'Consulta general',
      estado: 'confirmado',
      dia: 1, // Lunes
      hora: 2, // 09:00 AM
      duracion: 2,
    },
    {
      id: 2,
      paciente: 'María García',
      tipo: 'Control rutina',
      estado: 'pendiente',
      dia: 3, // Miércoles
      hora: 4, // 11:00 AM
      duracion: 1,
    },
    {
      id: 3,
      paciente: 'Carlos López',
      tipo: 'Revisión',
      estado: 'confirmado',
      dia: 5, // Viernes
      hora: 7, // 02:00 PM
      duracion: 3,
    },
  ];

  // Semana actual
  semanaActual = {
    inicio: new Date('2026-03-02'),
    fin: new Date('2026-03-07'),
    dias: [
      { nombre: 'Lun', fecha: '02', diaNum: 1 },
      { nombre: 'Mar', fecha: '03', diaNum: 2 },
      { nombre: 'Mié', fecha: '04', diaNum: 3 },
      { nombre: 'Jue', fecha: '05', diaNum: 4 },
      { nombre: 'Vie', fecha: '06', diaNum: 5 },
      { nombre: 'Sáb', fecha: '07', diaNum: 6 },
    ],
  };

  horas = [
    '08:00 AM',
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '01:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM',
  ];

  citaSeleccionada: Cita | null = null;
  mostrarModal = false;

  ngOnInit() {
    // Aquí puedes cargar datos reales de un servicio
  }

  // Navegación entre semanas
  semanaAnterior() {
    // Lógica para ir a la semana anterior
    console.log('Semana anterior');
  }

  semanaSiguiente() {
    // Lógica para ir a la semana siguiente
    console.log('Semana siguiente');
  }

  // Obtener citas para un día y hora específicos
  getCitasPorPosicion(dia: number, hora: number): Cita[] {
    return this.citasData.filter((cita) => cita.dia === dia && cita.hora === hora);
  }

  // Calcular estilo de grid para la cita
  getEstiloCita(cita: Cita): any {
    return {
      'grid-column': cita.dia + 1, // +1 porque la columna 1 es para las horas
      'grid-row': cita.hora,
      'grid-row-end': cita.duracion ? `span ${cita.duracion}` : 'span 1',
    };
  }

  // Clases CSS según estado
  getClaseEstado(estado: string): string {
    return `cita-card cita-${estado}`;
  }

  // Abrir modal con detalles de la cita
  abrirModal(cita: Cita) {
    this.citaSeleccionada = cita;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.citaSeleccionada = null;
  }

  // Formatear fecha de la semana
  getRangoSemana(): string {
    return `Marzo 02 - Marzo 07, 2026`;
  }

  confirmarCita() {
    if (this.citaSeleccionada) {
      this.citaSeleccionada.estado = 'confirmado';
      // Aquí puedes agregar lógica para guardar en el servicio
      console.log('Cita confirmada:', this.citaSeleccionada);
    }
  }

  cancelarCita() {
    if (this.citaSeleccionada) {
      this.citaSeleccionada.estado = 'cancelado';
      // Aquí puedes agregar lógica para guardar en el servicio
      console.log('Cita cancelada:', this.citaSeleccionada);
      this.cerrarModal();
    }
  }

  // Método para obtener el avatar del paciente
  getAvatarText(paciente: string): string {
    return paciente.charAt(0).toUpperCase();
  }
}
