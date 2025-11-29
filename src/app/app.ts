import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Dashboard } from "./dashboard/dashboard";
import { Login } from "./login/login"
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Dashboard, Login],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  isLoggedIn = false
}
