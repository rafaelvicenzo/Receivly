 import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-clients-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="clients-page">

      <!-- PAGE HEADER -->
      <div class="page-header">
        <div class="header-text">
          <div class="skel title"></div>
          <div class="skel sub"></div>
        </div>
        <div class="header-actions">
          <div class="skel btn-sm"></div>
          <div class="skel btn-sm"></div>
          <div class="skel btn"></div>
        </div>
      </div>

      <!-- SUMMARY CARDS -->
      <div class="summary-grid">
        <div class="summary-card" *ngFor="let _ of [1,2,3,4]">
          <div class="skel s-icon"></div>
          <div class="summary-info">
            <div class="skel s-label"></div>
            <div class="skel s-value"></div>
          </div>
        </div>
      </div>

      <!-- TOOLBAR -->
      <div class="toolbar">
        <div class="skel search"></div>
        <div class="filters">
          <div class="skel filter" *ngFor="let _ of [1,2,3]"></div>
        </div>
      </div>

      <!-- LIST -->
      <div class="client-list">
        <div class="list-header">
          <div class="skel th col-client"></div>
          <div class="skel th col-status"></div>
          <div class="skel th col-document"></div>
          <div class="skel th col-phone"></div>
          <div class="skel th col-risk"></div>
          <div class="skel th col-actions"></div>
        </div>
        <div class="client-row" *ngFor="let _ of [1,2,3,4,5,6,7]">
          <div class="col-client">
            <div class="skel avatar"></div>
            <div class="client-info">
              <div class="skel c-name"></div>
              <div class="skel c-email"></div>
            </div>
          </div>
          <div class="col-status"><div class="skel badge"></div></div>
          <div class="col-document"><div class="skel text"></div></div>
          <div class="col-phone"><div class="skel text"></div></div>
          <div class="col-risk"><div class="skel risk"></div></div>
          <div class="col-actions">
            <div class="skel action-btn" *ngFor="let _ of [1,2,3]"></div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; }

    @keyframes shimmer {
      0%   { background-position: -700px 0; }
      100% { background-position:  700px 0; }
    }

    .skel {
      background: linear-gradient(90deg, #e8edf4 25%, #f4f7fb 50%, #e8edf4 75%);
      background-size: 700px 100%;
      animation: shimmer 1.4s ease-in-out infinite;
      border-radius: 6px;
    }

    .clients-page {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* HEADER */
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .header-text { display: flex; flex-direction: column; gap: 8px; }
    .skel.title  { height: 22px; width: 100px; border-radius: 8px; }
    .skel.sub    { height: 12px; width: 260px; }
    .header-actions { display: flex; gap: 8px; }
    .skel.btn-sm { height: 36px; width: 130px; border-radius: 8px; }
    .skel.btn    { height: 36px; width: 130px; border-radius: 8px; }

    /* SUMMARY */
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }
    .summary-card {
      background: #fff;
      border-radius: 12px;
      border: 1px solid #e8eaf0;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .skel.s-icon  { width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0; }
    .summary-info { display: flex; flex-direction: column; gap: 8px; }
    .skel.s-label { height: 11px; width: 90px; }
    .skel.s-value { height: 20px; width: 40px; border-radius: 6px; }

    /* TOOLBAR */
    .toolbar { display: flex; align-items: center; gap: 12px; }
    .skel.search { height: 38px; width: 340px; border-radius: 8px; flex-shrink: 0; }
    .filters { display: flex; gap: 8px; }
    .skel.filter { height: 32px; width: 80px; border-radius: 20px; }

    /* LIST */
    .client-list {
      background: #fff;
      border-radius: 12px;
      border: 1px solid #e8eaf0;
      overflow: hidden;
    }
    .list-header {
      display: flex;
      align-items: center;
      padding: 10px 20px;
      background: #fafafa;
      border-bottom: 1px solid #f1f5f9;
      gap: 12px;
    }
    .skel.th       { height: 10px; }
    .col-client    { flex: 2.5; }
    .col-status    { flex: 1; }
    .col-document  { flex: 1.5; }
    .col-phone     { flex: 1.2; }
    .col-risk      { flex: 1.5; }
    .col-actions   { width: 100px; flex-shrink: 0; }

    .client-row {
      display: flex;
      align-items: center;
      padding: 14px 20px;
      border-bottom: 1px solid #f8fafc;
      gap: 12px;
    }
    .client-row:last-child { border-bottom: none; }

    .col-client { flex: 2.5; display: flex; align-items: center; gap: 10px; }
    .skel.avatar { width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0; }
    .client-info { display: flex; flex-direction: column; gap: 6px; }
    .skel.c-name  { height: 12px; width: 120px; }
    .skel.c-email { height: 10px; width: 160px; }

    .col-status   { flex: 1; }
    .skel.badge   { height: 22px; width: 60px; border-radius: 20px; }

    .col-document { flex: 1.5; }
    .col-phone    { flex: 1.2; }
    .skel.text    { height: 11px; width: 110px; }

    .col-risk     { flex: 1.5; }
    .skel.risk    { height: 22px; width: 120px; border-radius: 20px; }

    .col-actions  { width: 100px; flex-shrink: 0; display: flex; gap: 6px; }
    .skel.action-btn { width: 30px; height: 30px; border-radius: 6px; flex-shrink: 0; }
  `]
})
export class ClientsSkeletonComponent {}