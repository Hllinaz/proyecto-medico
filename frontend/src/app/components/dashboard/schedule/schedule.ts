// schedule.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { NgClass, DatePipe } from '@angular/common';
import { DoctorService, AppointmentService, AuthService } from '@app/services';
import { USER_TYPES } from '@app/constants';

interface CitaCalendario {
  id: number;
  paciente: string;
  tipo: string;
  estado: 'AGENDADA' | 'COMPLETADA' | 'CANCELADA' | 'PENDIENTE';
  fecha: Date;
  hora_inicio: string;
  hora_fin: string;
  motivo: string;
  id_medico: number;
  id_paciente: number;
  duracionSlots?: number; // duración en slots de 30 minutos
  columnaDia?: number; // 1 = Lun, 2 = Mar, etc.
  filaHora?: number; // posición en la grid
}

interface DiaSemana {
  nombre: string;
  fecha: Date;
  diaNum: number; // 1 = Lunes, 2 = Martes, etc.
  fechaStr: string; // Formato YYYY-MM-DD
}

@Component({
  selector: 'app-schedule',
  imports: [NgClass, DatePipe],
  templateUrl: './schedule.html',
  styleUrls: ['./schedule.css'],
})
export class Schedule implements OnInit {
  private doctorService = inject(DoctorService);
  private appointmentService = inject(AppointmentService);
  private authService = inject(AuthService);

  currentUser = this.authService.getCurrentUser();

  // Señales reactivas
  citas = signal<CitaCalendario[]>([]);
  semanaActual = signal<DiaSemana[]>([]);
  isLoading = signal<boolean>(true);

  // Variables para el calendario
  horas = [
    '08:00',
    '08:30',
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:00',
    '17:30',
    '18:00',
  ];

  citaSeleccionada: CitaCalendario | null = null;
  mostrarModal = false;

  // Fecha actual para navegación
  fechaReferencia = new Date();

  ngOnInit() {
    this.inicializarSemana();
    this.cargarCitas();
  }

  // Inicializar la semana actual
  private inicializarSemana(): void {
    const hoy = new Date();
    const diasSemana: DiaSemana[] = [];

    // Obtener el lunes de la semana actual
    const lunes = new Date(hoy);
    const diaSemana = lunes.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    const diff = lunes.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1); // Ajustar para que lunes sea el primer día
    lunes.setDate(diff);

    // Generar los 6 días (Lunes a Sábado)
    for (let i = 0; i < 6; i++) {
      const fecha = new Date(lunes);
      fecha.setDate(lunes.getDate() + i);

      diasSemana.push({
        nombre: this.obtenerNombreDia(fecha.getDay()),
        fecha: fecha,
        diaNum: fecha.getDay() === 0 ? 7 : fecha.getDay(), // Domingo = 7
        fechaStr: fecha.toISOString().split('T')[0],
      });
    }

    this.semanaActual.set(diasSemana);
    console.log('Semana inicializada:', this.semanaActual());
  }

  private obtenerNombreDia(numeroDia: number): string {
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return dias[numeroDia];
  }

  // Cargar citas desde el servicio
  private cargarCitas(): void {
    this.isLoading.set(true);

    if (!this.currentUser?.id) {
      console.error('Usuario no autenticado');
      this.isLoading.set(false);
      return;
    }

    // Dependiendo del tipo de usuario, cargar citas diferentes
    if (this.currentUser.type === USER_TYPES.DOCTOR) {
      this.doctorService.getAppointments(this.currentUser.id).subscribe({
        next: (appointments) => {
          console.log(appointments);
          this.procesarCitas(appointments);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error cargando citas:', err);
          this.isLoading.set(false);
        },
      });
    } else if (this.currentUser.type === USER_TYPES.PATIENT) {
      this.appointmentService.getAppointmentsByPatient(this.currentUser.id).subscribe({
        next: (appointments) => {
          this.procesarCitas(appointments);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error cargando citas:', err);
          this.isLoading.set(false);
        },
      });
    }
  }

  // Procesar citas para el calendario
  private procesarCitas(appointments: any[]): void {
    const citasProcesadas: CitaCalendario[] = appointments.map((cita) => {
      // Calcular duración en slots de 30 minutos
      const inicio = this.convertirHoraASlot(cita.hora_inicio);
      const fin = this.convertirHoraASlot(cita.hora_fin);
      const duracionSlots = fin - inicio;

      // Obtener día de la semana (1 = Lunes, ..., 6 = Sábado)
      const fechaCita = new Date(cita.fecha_cita);
      const diaSemana = fechaCita.getDay(); // 0 = Domingo, 1 = Lunes, etc.
      const columnaDia = diaSemana === 0 ? 7 : diaSemana; // Ajustar para calendario

      // Calcular posición en la grid
      const filaHora = inicio + 1; // +1 porque la fila 1 es para los headers

      return {
        id: cita.id_cita,
        paciente: `Paciente ${cita.id_paciente}`, // En realidad deberías obtener el nombre
        tipo: cita.motivo.substring(0, 20) + (cita.motivo.length > 20 ? '...' : ''),
        estado: cita.estado_cita,
        fecha: fechaCita,
        hora_inicio: cita.hora_inicio.substring(0, 5), // Formato HH:mm
        hora_fin: cita.hora_fin.substring(0, 5),
        motivo: cita.motivo,
        id_medico: cita.id_medico,
        id_paciente: cita.id_paciente,
        duracionSlots,
        columnaDia,
        filaHora,
      };
    });

    this.citas.set(citasProcesadas);
    console.log('Citas procesadas:', citasProcesadas);
  }

  // Convertir hora (HH:mm) a slot de 30 minutos
  private convertirHoraASlot(hora: string): number {
    const [horas, minutos] = hora.split(':').map(Number);
    const horaDecimal = horas + minutos / 60;

    // 8:00 = slot 1, 8:30 = slot 2, etc.
    return Math.round((horaDecimal - 8) * 2) + 1;
  }

  // Navegación entre semanas
  semanaAnterior(): void {
    this.fechaReferencia.setDate(this.fechaReferencia.getDate() - 7);
    this.inicializarSemana();
    this.cargarCitas();
  }

  semanaSiguiente(): void {
    this.fechaReferencia.setDate(this.fechaReferencia.getDate() + 7);
    this.inicializarSemana();
    this.cargarCitas();
  }

  irAHoy(): void {
    this.fechaReferencia = new Date();
    this.inicializarSemana();
    this.cargarCitas();
  }

  // Obtener citas para un día específico
  getCitasPorDia(dia: DiaSemana): CitaCalendario[] {
    const fechaStr = dia.fechaStr;
    return this.citas().filter((cita) => cita.fecha.toISOString().split('T')[0] === fechaStr);
  }

  // Obtener citas para una posición específica en la grid
  getCitasPorPosicion(dia: number, slot: number): CitaCalendario[] {
    return this.citas().filter((cita) => cita.columnaDia === dia && cita.filaHora === slot);
  }

  // Calcular estilo de grid para la cita
  getEstiloCita(cita: CitaCalendario): any {
    return {
      'grid-column': `${cita.columnaDia}`, // Columna del día
      'grid-row': `${cita.filaHora} / span ${cita.duracionSlots || 1}`,
      'z-index': '10',
    };
  }

  // Clases CSS según estado
  getClaseEstado(estado: string): string {
    const clases: Record<string, string> = {
      AGENDADA: 'cita-agendada',
      COMPLETADA: 'cita-completada',
      CANCELADA: 'cita-cancelada',
      PENDIENTE: 'cita-pendiente',
    };

    return `cita-card ${clases[estado] || 'cita-agendada'}`;
  }

  // Obtener texto para estado
  getTextoEstado(estado: string): string {
    const textos: Record<string, string> = {
      AGENDADA: 'Agendada',
      COMPLETADA: 'Completada',
      CANCELADA: 'Cancelada',
      PENDIENTE: 'Pendiente',
    };

    return textos[estado] || estado;
  }

  // Abrir modal con detalles de la cita
  abrirModal(cita: CitaCalendario): void {
    this.citaSeleccionada = cita;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.citaSeleccionada = null;
  }

  // Formatear rango de la semana
  getRangoSemana(): string {
    const dias = this.semanaActual();
    if (dias.length === 0) return '';

    const inicio = dias[0].fecha;
    const fin = dias[dias.length - 1].fecha;

    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };

    return `${inicio.toLocaleDateString('es-ES', options)} - ${fin.toLocaleDateString('es-ES', options)}`;
  }

  // Obtener nombre del mes actual
  getMesActual(): string {
    return this.fechaReferencia.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }

  // Confirmar cita
  confirmarCita(): void {
    if (this.citaSeleccionada) {
      // Lógica para confirmar cita
      console.log('Confirmando cita:', this.citaSeleccionada.id);
      // this.appointmentService.confirmarCita(this.citaSeleccionada.id).subscribe(...);
      this.cerrarModal();
    }
  }

  // Cancelar cita
  cancelarCita(): void {
    if (this.citaSeleccionada) {
      if (confirm('¿Está seguro de cancelar esta cita?')) {
        // Lógica para cancelar cita
        console.log('Cancelando cita:', this.citaSeleccionada.id);
        // this.appointmentService.cancelarCita(this.citaSeleccionada.id).subscribe(...);
        this.cerrarModal();
      }
    }
  }

  // Obtener iniciales del paciente
  getInicialesPaciente(paciente: string): string {
    return paciente
      .split(' ')
      .map((n) => n.charAt(0))
      .join('')
      .toUpperCase();
  }

  // Verificar si un slot está ocupado
  isSlotOcupado(dia: number, slot: number): boolean {
    return this.getCitasPorPosicion(dia, slot).length > 0;
  }

  // Obtener cita en un slot específico
  getCitaEnSlot(dia: number, slot: number): CitaCalendario | null {
    const citas = this.getCitasPorPosicion(dia, slot);
    return citas.length > 0 ? citas[0] : null;
  }
}
