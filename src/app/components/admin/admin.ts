import { Component, OnInit } from '@angular/core';
import { MockDataService } from '@services';
import { Doctor, Patient } from '@models';

@Component({
  selector: 'app-admin',
  imports: [],
  templateUrl: './admin.html',
  styleUrls: ['../dashboard/dashboard.css', './admin.css'],
})
export class Admin implements OnInit {
  doctors: Doctor[] = [];
  patients: Patient[] = [];
  isLoading = true;

  constructor(private MockData: MockDataService) {}

  kpiData = [
    { label: 'Total Médicos', value: 12, icon: 'bx-user-voice', color: 'icon-blue' },
    { label: 'Total Pacientes', value: 845, icon: 'bx-user', color: 'icon-green' },
    { label: 'Citas Hoy', value: 28, icon: 'bx-calendar-check', color: 'icon-orange' },
    { label: 'Solicitudes', value: 5, icon: 'bx-envelope', color: 'icon-red' },
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;

    this.MockData.getDoctors().subscribe((records) => {
      this.doctors = records;
    });

    this.MockData.getPatients().subscribe((records) => {
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
}
