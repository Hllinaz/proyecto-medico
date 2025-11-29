import { Component } from '@angular/core';
import { Details} from "./details/details";
import { Historial } from "./historial/historial"
import { Next} from "./next/next"

@Component({
  selector: 'app-dashboard',
  imports: [Details, Historial, Next],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  user = 'pacient'
}
