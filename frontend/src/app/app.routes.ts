import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { SignupComponent } from './signup/signup.component';
import { Dashboard } from './dashboard/dashboard';
import { Charges } from './charges/charges';
import { Clients } from './clients/clients';
import { Layout } from './layout/layout';
import { CollectionRules } from './collection-rules/collection-rules';
import { authGuard } from './guards/auth-guard';
import { Reports } from './reports/reports';
import { AuthSocialComponent } from './auth-social/auth-social';
import { Whatsapp } from './whatsapp/whatsapp';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'signup', component: SignupComponent },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'charges', component: Charges },
      { path: 'clients', component: Clients },
      { path: 'collection-rules', component: CollectionRules },
      { path: 'reports', component: Reports },
      { path: 'whatsapp', component: Whatsapp },
      { path: 'auth/social', component: AuthSocialComponent },
    ]
  },
  { path: '**', redirectTo: 'login' }
];