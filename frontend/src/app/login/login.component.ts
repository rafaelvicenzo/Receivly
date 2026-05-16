import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;
  rememberMe = false;
  emailFocused = false;
  passwordFocused = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleRememberMe(): void {
    this.rememberMe = !this.rememberMe;
  }

  get emailInvalid(): boolean {
    const control = this.loginForm.get('email');
    return !!control && control.invalid && control.touched;
  }

  get passwordInvalid(): boolean {
    const control = this.loginForm.get('password');
    return !!control && control.invalid && control.touched;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.error || 'Erro ao fazer login. Tente novamente.';
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  loginWithGoogle(): void {
    console.log('Login with Google');
  }

  loginWithMicrosoft(): void {
    console.log('Login with Microsoft');
  }
}