import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { Dashboard } from './dashboard/dashboard';
import { Charges } from './charges/charges';
import { Clients } from './clients/clients';
import { Layout } from './layout/layout';
import { CollectionRules } from './collection-rules/collection-rules';
import { authGuard } from './guards/auth-guard';
import { Reports } from './reports/reports';

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
      { path: 'clients', component: Clients },
      { path: 'collection-rules', component: CollectionRules },
      { path: 'reports', component: Reports }
    ]
  }
];