import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
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

  constructor(private fb: FormBuilder) {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
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

  togglePassword(): void { this.showPassword = !this.showPassword; }
  toggleConfirm(): void { this.showConfirm = !this.showConfirm; }
  toggleTerms(): void { this.acceptTerms = !this.acceptTerms; }

  onSubmit(): void {
    if (this.signupForm.valid && this.acceptTerms) {
      console.log('Signup:', this.signupForm.value);
    } else {
      this.signupForm.markAllAsTouched();
    }
  }

  loginWithGoogle(): void { console.log('Signup with Google'); }
  loginWithMicrosoft(): void { console.log('Signup with Microsoft'); }
}
