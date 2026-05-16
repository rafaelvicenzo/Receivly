import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { Dashboard } from './dashboard/dashboard';
import { Charges } from './charges/charges';
import { Clients } from './clients/clients';
import { Layout } from './layout/layout';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'charges', component: Charges },
      { path: 'clients', component: Clients }
    ]
  }
];