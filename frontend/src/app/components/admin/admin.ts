import { Component, inject, OnInit } from '@angular/core';
import { DataService } from '@services';
import { Doctor, Patient } from '@models';
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

  doctors: Doctor[] = [];
  patients: Patient[] = [];
  isLoading = true;

  constructor(private router: Router) {}

  kpiData = [
    {
      label: 'Total Médicos',
      value: this.data.getCountDoctor(),
      icon: 'bx-user-voice',
      color: 'icon-blue',
    },
    {
      label: 'Total Pacientes',
      value: this.data.getCountPatient(),
      icon: 'bx-user',
      color: 'icon-green',
    },
    {
      label: 'Citas Hoy',
      value: this.data.getCountAppointment(),
      icon: 'bx-calendar-check',
      color: 'icon-orange',
    },
    {
      label: 'Solicitudes',
      value: this.data.getCountSolitude(),
      icon: 'bx-envelope',
      color: 'icon-red',
    },
  ];

  ngOnInit(): void {
    console.log('carga datos');
    this.loadData();
  }

  loadData() {
    this.isLoading = true;

    this.data.getDoctors().subscribe((records) => {
      this.doctors = records;
    });

    this.data.getPatients().subscribe((records) => {
      this.patients = records;
    });

    this.isLoading = false;
  }

  getStatus(status: String) {
    const statusText = status === 'active' ? 'Activo' : 'Inactivo';
    const statusClass = status === 'active' ? 'active' : 'inactive';
    return { text: statusText, class: statusClass };
  }

  refreshData() {
    this.loadData();
  }

  redirectToHome() {
    this.router.navigate(['home']);
  }

  redirectToProfile() {}
}
