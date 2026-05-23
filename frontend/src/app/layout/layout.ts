import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class Layout {
  sidebarOpen = true;
  currentPage = 'dashboard';

  user = JSON.parse(localStorage.getItem('user') || '{"name":"Rafael"}');

  constructor(private authService: AuthService, private router: Router) {
    this.router.events.subscribe(() => {
      const url = this.router.url;
      if (url.includes('dashboard')) this.currentPage = 'dashboard';
      else if (url.includes('charges')) this.currentPage = 'cobrancas';
      else if (url.includes('clients')) this.currentPage = 'clientes';
      else if (url.includes('reports')) this.currentPage = 'relatorios';
      else if (url.includes('ruler')) this.currentPage = 'ruler';
      else if (url.includes('settings')) this.currentPage = 'configuracoes';
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  navigate(page: string): void {
    this.currentPage = page;
    const routes: Record<string, string> = {
      dashboard: '/dashboard',
      cobrancas: '/charges',
      clientes: '/clients',
      relatorios: '/reports',
      pix: '/pix',
      ruler: '/ruler',
      configuracoes: '/settings'
    };
    if (routes[page]) {
      this.router.navigate([routes[page]]);
    }
  }
}
