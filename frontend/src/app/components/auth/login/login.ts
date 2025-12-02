import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, StateService } from '@services';
import { UserType } from '@app/models';
import { USER_TYPES } from '@app/constants';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private stateService: StateService,
  ) {
    console.log('Componente Login construido');
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit() {
    console.log('Login ngOnInit ejecutado');
    console.log('Formulario inicial:', this.loginForm.value);
  }

  onSubmit() {
    console.log('onSubmit llamado');
    console.log('Formulario válido?', this.loginForm.valid);
    console.log('Formulario errores:', this.loginForm.errors);
    console.log('Formulario valores:', this.loginForm.value);

    if (this.loginForm.valid) {
      console.log('Formulario ES válido, procediendo...');
      this.loading = true;
      this.error = '';

      const { email, password } = this.loginForm.value;

      console.log('Datos a enviar:', { email, password });

      this.authService.login(email, password).subscribe({
        next: (response) => {
          console.log('Respuesta del login:', response);
          this.loading = false;

          if (response && response.user_id && response.rol) {
            const type = this.stateService.setUser(response.rol);
            console.log('Redirigiendo usuario tipo:', type);
            this.redirectUser(type);
          } else {
            console.error('Respuesta inválida:', response);
            this.error = 'Error en la respuesta del servidor';
          }
        },
        error: (error) => {
          console.error('Error en login:', error);
          this.loading = false;
          this.error = error.message || 'Error al iniciar sesión';
        },
        complete: () => {
          console.log('Login completado');
        },
      });
    } else {
      console.log('Formulario NO válido');
      console.log('Errores email:', this.loginForm.get('email')?.errors);
      console.log('Errores password:', this.loginForm.get('password')?.errors);
    }
  }

  private redirectUser(userType: UserType) {
    console.log('redirectUser llamado con:', userType);

    switch (userType) {
      case USER_TYPES.PATIENT:
        console.log('Navegando a /patient');
        this.router.navigate(['/patient']);
        break;
      case USER_TYPES.DOCTOR:
      case USER_TYPES.ADMIN:
        console.log('Navegando a /doctor');
        this.router.navigate(['/doctor']);
        break;
      default:
        console.log('Navegando a /');
        this.router.navigate(['/']);
    }
  }
}
