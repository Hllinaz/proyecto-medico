import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, NotificationService } from '@services';
import { CustomValidators } from '@validators/custom.validators';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit {
  loginForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
  ) {
    console.log('Componente Registro cosntruido');
    this.loginForm = this.fb.group(
      {
        name: ['', Validators.required],
        lastname: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: CustomValidators.match('password', 'confirmPassword'),
      },
    );
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
      console.log('Formulario es válido, procediendo...');
      this.loading = true;
      this.error = '';

      const { name, lastname, email, password } = this.loginForm.value;

      console.log({ name, lastname, email, password });

      this.authService.register(name, lastname, email, password).subscribe({
        next: (response) => {
          console.log('Respuesta del register:', response);
          this.loading = false;

          if (response && response.user) {
            console.log('Redirigiendo usuario');
            this.router.navigate(['/']);
          } else {
            alert(`Respuesta invalida ${response}`);
            console.log('Respuesta invalida:', response);
          }
        },
        error: (error) => {
          alert(`Error al registrarse: ${error.message}`);
          console.log('Error en register:', error);
          this.loading = false;
          this.error = error.message || 'Error al registrarse';
        },
      });
    } else {
      console.log('Formulario no válido');
      console.log('Errores email:', this.loginForm.get('email')?.errors);
      console.log('Errores password:', this.loginForm.get('password')?.errors);
    }
  }
}
