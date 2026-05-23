import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-social',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:Sora,sans-serif;">
      <p style="color:#64748b">Autenticando...</p>
    </div>
  `
})
export class AuthSocialComponent implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        localStorage.setItem('token', params['token']);
        localStorage.setItem('user', JSON.stringify({ name: params['name'] }));
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/login'], { queryParams: { error: 'social_auth_failed' } });
      }
    });
  }
}