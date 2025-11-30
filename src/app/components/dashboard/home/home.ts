import { Component } from '@angular/core';
import { Details } from './details/details';
import { Historial } from './historial/historial';
import { Next } from './next/next';

@Component({
  selector: 'dashboard-home',
  imports: [Details, Historial, Next],
  templateUrl: './home.html',
  styleUrls: ['./home.css', '../dashboard.css'],
})
export class Home {
  user = 'pacient';
}
