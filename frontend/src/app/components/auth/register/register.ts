import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, NotificationService } from '@services';
import { CustomValidators } from '@validators/custom.validators';
import { UserCreate } from '@app/models';

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
        doc_type: ['', Validators.required],
        document: ['', [Validators.required, Validators.minLength(6)]],
        number: ['', Validators.required],
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

      const { name, lastname, email, password, doc_type, document, number } = this.loginForm.value;

      const user: UserCreate = {
        name: name,
        lastname: lastname,
        email: email,
        password: password,
        doc_type: doc_type,
        document: document,
        number: number,
      };

      this.authService.register(user).subscribe({
        next: (response) => {
          console.log('Respuesta del register:', response);
          this.loading = false;
          console.log('Redirigiendo usuario');
          this.router.navigate(['/']);
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
      console.log('Errores number:', this.loginForm.get('number')?.errors);
      console.log('Errores doc_type:', this.loginForm.get('doc_type')?.errors);
      console.log('Errores document:', this.loginForm.get('document')?.errors);
    }
  }
}
