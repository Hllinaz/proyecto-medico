// validators/custom.validators.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  // Validador para comparar dos campos (ej: password y confirmPassword)
  static match(controlName: string, matchingControlName: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const control = formGroup.get(controlName);
      const matchingControl = formGroup.get(matchingControlName);

      if (!control || !matchingControl) {
        return null;
      }

      // Si hay error en el campo principal, no validar
      if (control.errors && !control.errors['mismatch']) {
        return null;
      }

      // Comparar valores
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mismatch: true });
        return { mismatch: true };
      } else {
        matchingControl.setErrors(null);
        return null;
      }
    };
  }

  // Validador para que sea igual a un valor específico
  static equals(expectedValue: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value !== expectedValue) {
        return { equals: { expected: expectedValue, actual: control.value } };
      }
      return null;
    };
  }

  // Validador para que NO sea igual a un valor
  static notEquals(forbiddenValue: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value === forbiddenValue) {
        return { notEquals: { forbidden: forbiddenValue, actual: control.value } };
      }
      return null;
    };
  }

  // Validador para comparar con otro campo dinámicamente
  static equalTo(otherControlName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) {
        return null;
      }

      const otherControl = control.parent.get(otherControlName);

      if (!otherControl) {
        return null;
      }

      if (control.value !== otherControl.value) {
        return { equalTo: { otherControl: otherControlName, otherValue: otherControl.value } };
      }

      return null;
    };
  }

  static passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }
}
