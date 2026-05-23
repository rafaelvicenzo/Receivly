import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { FormsModule } from '@angular/forms';


function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirm = control.get('confirmPassword');
  if (password && confirm && password.value !== confirm.value) {
    confirm.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  }
  if (confirm?.hasError('passwordMismatch')) {
    confirm.setErrors(null);
  }
  return null;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  signupForm: FormGroup;
  nameFocused = false;
  emailFocused = false;
  phoneFocused = false;
  passwordFocused = false;
  confirmFocused = false;
  showPassword = false;
  showConfirm = false;
  acceptTerms = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      name:            ['', [Validators.required, Validators.minLength(3)]],
      email:           ['', [Validators.required, Validators.email]],
      phone:           [''],
      password:        ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: passwordMatchValidator });
  }

  get nameInvalid(): boolean {
    const c = this.signupForm.get('name');
    return !!c && c.invalid && c.touched;
  }

  get emailInvalid(): boolean {
    const c = this.signupForm.get('email');
    return !!c && c.invalid && c.touched;
  }

  get passwordInvalid(): boolean {
    const c = this.signupForm.get('password');
    return !!c && c.invalid && c.touched;
  }

  get confirmInvalid(): boolean {
    const c = this.signupForm.get('confirmPassword');
    return !!c && c.invalid && c.touched;
  }

  get passwordMismatch(): boolean {
    const c = this.signupForm.get('confirmPassword');
    return !!c && c.touched && c.hasError('passwordMismatch');
  }

  get formValid(): boolean {
    return this.signupForm.valid && this.acceptTerms;
  }

  togglePassword(): void { this.showPassword = !this.showPassword; }
  toggleConfirm(): void  { this.showConfirm  = !this.showConfirm;  }
  toggleTerms(): void    { this.acceptTerms  = !this.acceptTerms;  }

  onSubmit(): void {
    if (!this.signupForm.valid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    if (!this.acceptTerms) {
      console.log(!this.acceptTerms);
      this.errorMessage = 'Você precisa aceitar os Termos de Uso para continuar.';
      return;
    }

    if (this.passwordMismatch) {
      this.errorMessage = 'As senhas não coincidem.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { name, email, password } = this.signupForm.value;
    this.http.post(`${environment.apiUrl}/register`, { name, email, password }).subscribe({
      next: () => {
        this.successMessage = 'Conta criada com sucesso! Redirecionando...';
        this.isLoading = false;
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Erro ao criar conta. Tente novamente.';
      }
    });
  }

  loginWithGoogle(): void    { console.log('Signup with Google');    }
  loginWithMicrosoft(): void { console.log('Signup with Microsoft'); }
}