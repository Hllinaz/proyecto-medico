import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-details',
  imports: [],
  templateUrl: './details.html',
  styleUrl: './details.css',
})
export class Details {
  stateConfirmed = 'pending'
  @Input userType!: String
  date = ''
  hour = ''
  name = ''
  speciality = ''
  decription = ''
  age = ''
  number = ''
}
