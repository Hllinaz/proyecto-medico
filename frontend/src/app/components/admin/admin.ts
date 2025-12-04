import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { DataService } from '@services';
import { Doctor, Stadistic, Patient } from '@models';
import { Router } from '@angular/router';
import { AuthService } from '@services';

@Component({
  selector: 'app-admin',
  imports: [],
  templateUrl: './admin.html',
  styleUrls: ['../dashboard/dashboard.css', './admin.css'],
})
export class Admin implements OnInit {
  auth = inject(AuthService);
  data = inject(DataService);
  router = inject(Router);

  // Signals
  stadistics = signal<Stadistic | null>(null);
  doctors = signal<Doctor[]>([]);
  patients = signal<Patient[]>([]);
  isLoading = signal(true);

  // Computed signal para kpiData
  kpiData = computed(() => {
    const stats = this.stadistics();

    if (!stats) {
      return [
        { label: 'Total Médicos', value: 0, icon: 'bx-user-voice', color: 'icon-blue' },
        { label: 'Total Pacientes', value: 0, icon: 'bx-user', color: 'icon-green' },
        { label: 'Citas Hoy', value: 0, icon: 'bx-calendar-check', color: 'icon-orange' },
        { label: 'Solicitudes', value: 0, icon: 'bx-envelope', color: 'icon-red' },
      ];
    }

    return [
      {
        label: 'Total Médicos',
        value: stats.total_medicos,
        icon: 'bx-user-voice',
        color: 'icon-blue',
      },
      {
        label: 'Total Pacientes',
        value: stats.total_pacientes,
        icon: 'bx-user',
        color: 'icon-green',
      },
      {
        label: 'Citas Hoy',
        value: stats.total_citas_dia,
        icon: 'bx-calendar-check',
        color: 'icon-orange',
      },
      {
        label: 'Solicitudes',
        value: stats.total_citas_estado,
        icon: 'bx-envelope',
        color: 'icon-red',
      },
    ];
  });

  ngOnInit(): void {
    console.log('carga datos');
    this.loadData();
  }

  loadData() {
    const date = new Date().toISOString().split('T')[0];

    this.isLoading.set(true);

    this.data.getStadistics(date, 'AGENDADA').subscribe((stadistics) => {
      this.stadistics.set(stadistics);
      console.log(stadistics);
    });

    this.data.getDoctors().subscribe((records) => {
      this.doctors.set(records);
    });

    this.data.getPatients().subscribe((records) => {
      this.patients.set(records);
      console.log(records);
      this.isLoading.set(false);
    });
  }

  getStatus(status: string) {
    const statusText = status === 'ACTIVO' ? 'Activo' : 'Inactivo';
    const statusClass = status === 'ACTIVO' ? 'active' : 'inactive';
    return { text: statusText, class: statusClass };
  }

  refreshData() {
    this.loadData();
  }

  redirectToHome() {
    this.router.navigate(['home']);
  }

  registerDoctor() {
    this.router.navigate(['/admin/register']);
  }

  redirectToProfile() {}
}
