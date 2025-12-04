import { Component, OnInit, Signal, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, DoctorService, NotificationService, UserService } from '@services';
import { CustomValidators } from '@validators/custom.validators';
import { UserCreate, Speciality } from '@app/models';

@Component({
  selector: 'app-registrar-medico',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './medico.html',
  styleUrls: ['./medico.css', '../../dashboard/dashboard.css'],
})
export class Medico {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private doctorService = inject(DoctorService);
  private authService = inject(AuthService);
  private userService = inject(UserService);

  medicoForm!: FormGroup;

  constructor() {
    this.medicoForm = this.createForm();
  }

  ngOnInit(): void {
    this.cargarEspecialidades();
  }

  isLoading = signal<boolean>(false);
  especialidades = signal<Speciality[]>([]);

  createForm(): FormGroup {
    return this.fb.group(
      {
        // Información Personal
        nombre: ['', [Validators.required, Validators.minLength(2)]],
        apellido: ['', [Validators.required, Validators.minLength(2)]],
        tipoDocumento: ['', Validators.required],
        numeroDocumento: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]+$/)]],
        email: ['', [Validators.required, Validators.email]],
        telefono: [''],

        // Información Profesional
        numeroLicencia: ['', Validators.required],
        aniosExperiencia: [0],
        especialidad: ['', Validators.required],

        // Seguridad
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: CustomValidators.passwordMatchValidator,
      },
    );
  }

  cargarEspecialidades(): void {
    this.doctorService.getSpecialities().subscribe({
      next: (data) => {
        this.especialidades.set(data);
      },
      error: (error) => {
        console.error('Error al cargar especialidades:', error);
      },
    });
  }

  onSubmit(): void {
    if (this.medicoForm.invalid) {
      this.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const formData = {
      // Datos personales
      nombre: this.medicoForm.get('nombre')?.value,
      apellido: this.medicoForm.get('apellido')?.value,
      tipo_documento: this.medicoForm.get('tipoDocumento')?.value,
      numero_documento: this.medicoForm.get('numeroDocumento')?.value,
      email: this.medicoForm.get('email')?.value,
      telefono: this.medicoForm.get('telefono')?.value || null,

      // Datos profesionales
      numero_licencia: this.medicoForm.get('numeroLicencia')?.value,
      anios_experiencia: this.medicoForm.get('aniosExperiencia')?.value || 0,
      id_especialidad: this.medicoForm.get('especialidad')?.value,

      // Seguridad
      password: this.medicoForm.get('password')?.value,
      rol_id: 2, // ID fijo para médico
      estado: 'activo',
      fecha_registro: new Date().toISOString(),
    };

    console.log('Datos a enviar:', formData);

    this.authService.register(formData, formData.rol_id).subscribe({
      next: (response) => {
        console.log('Médico registrado exitosamente:', response);
        this.isLoading.set(false);

        // Mostrar mensaje de éxito
        alert('Médico registrado exitosamente');

        // Redirigir a lista de médicos o dashboard
        this.router.navigate(['/medicos']);
      },
      error: (error) => {
        console.error('Error al registrar médico:', error);
        this.isLoading.set(false);

        // Mostrar error específico
        let errorMessage = 'Error al registrar médico. ';
        if (error.status === 409) {
          errorMessage += 'El email o número de documento ya está registrado.';
        } else if (error.status === 400) {
          errorMessage += 'Datos inválidos. Verifique la información.';
        } else {
          errorMessage += 'Intente nuevamente más tarde.';
        }

        alert(errorMessage);
      },
    });
  }

  markAllAsTouched(): void {
    Object.keys(this.medicoForm.controls).forEach((key) => {
      const control = this.medicoForm.get(key);
      control?.markAsTouched();
    });
  }

  cancelar(): void {
    if (confirm('¿Está seguro de que desea cancelar? Los datos no guardados se perderán.')) {
      this.router.navigate(['/admin']);
    }
  }

  // Getters para acceder fácilmente a los controles del formulario
  get nombre() {
    return this.medicoForm.get('nombre');
  }
  get apellido() {
    return this.medicoForm.get('apellido');
  }
  get tipoDocumento() {
    return this.medicoForm.get('tipoDocumento');
  }
  get numeroDocumento() {
    return this.medicoForm.get('numeroDocumento');
  }
  get email() {
    return this.medicoForm.get('email');
  }
  get numeroLicencia() {
    return this.medicoForm.get('numeroLicencia');
  }
  get especialidad() {
    return this.medicoForm.get('especialidad');
  }
  get password() {
    return this.medicoForm.get('password');
  }
  get confirmPassword() {
    return this.medicoForm.get('confirmPassword');
  }
}
