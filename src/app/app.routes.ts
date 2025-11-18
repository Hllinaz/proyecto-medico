import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: 'citas', 
    loadChildren: () => import('./modules/cita/cita.module').then(m => m.CitaModule)
  },
  { 
    path: 'medicos', 
    loadChildren: () => import('./modules/medico/medico.module').then(m => m.MedicoModule)
  },
  { 
    path: 'pacientes', 
    loadChildren: () => import('./modules/paciente/paciente.module').then(m => m.PacienteModule)
  },
  { path: '', redirectTo: '/citas', pathMatch: 'full' }
];