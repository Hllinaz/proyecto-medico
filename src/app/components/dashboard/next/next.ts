import { Component, Input, input } from '@angular/core';

@Component({
  selector: 'app-next-patient',
  imports: [],
  templateUrl: './next.html',
  styleUrl: './next.css'
})
export class Next {
  stateConfirmed = 'pending'
  @Input() userType!: String
  day = ''
  month = ''
  year = ''
  hour = ''
  name = ''
  speciality = ''
  age = ''
  number = ''
}
