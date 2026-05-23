import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-charges-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="charges-page">

      <!-- PAGE HEADER -->
      <div class="page-header">
        <div class="header-text">
          <div class="skel title"></div>
          <div class="skel sub"></div>
        </div>
        <div class="skel btn"></div>
      </div>

      <!-- SUMMARY CARDS -->
      <div class="summary-grid">
        <div class="summary-card" *ngFor="let _ of [1,2,3]">
          <div class="skel s-label"></div>
          <div class="skel s-value"></div>
        </div>
      </div>

      <!-- FILTERS -->
      <div class="filters">
        <div class="skel filter" *ngFor="let _ of [1,2,3,4,5]"></div>
      </div>

      <!-- TABLE -->
      <div class="table-card">
        <div class="table-head">
          <div class="skel th" *ngFor="let _ of [1,2,3,4,5,6,7]"></div>
        </div>
        <div class="table-rows">
          <div class="table-row" *ngFor="let _ of [1,2,3,4,5,6,7]">
            <div class="client-cell">
              <div class="skel avatar"></div>
              <div class="client-text">
                <div class="skel c-name"></div>
                <div class="skel c-email"></div>
              </div>
            </div>
            <div class="skel t-desc"></div>
            <div class="skel t-val"></div>
            <div class="skel t-date"></div>
            <div class="skel t-method"></div>
            <div class="skel t-badge"></div>
            <div class="actions-cell">
              <div class="skel t-action" *ngFor="let _ of [1,2,3]"></div>
            </div>
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

    /* layout idêntico ao charges real */
    .charges-page {
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
    .skel.title  { height: 22px; width: 120px; border-radius: 8px; }
    .skel.sub    { height: 12px; width: 220px; }
    .skel.btn    { height: 38px; width: 140px; border-radius: 8px; }

    /* SUMMARY */
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    .summary-card {
      background: #fff;
      border-radius: 12px;
      border: 1px solid #e8eaf0;
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .skel.s-label { height: 11px; width: 70px; }
    .skel.s-value { height: 22px; width: 130px; border-radius: 6px; }

    /* FILTERS */
    .filters { display: flex; gap: 8px; }
    .skel.filter { height: 32px; width: 90px; border-radius: 20px; }

    /* TABLE */
    .table-card {
      background: #fff;
      border-radius: 12px;
      border: 1px solid #e8eaf0;
      overflow: hidden;
    }
    .table-head {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: #fafafa;
      border-bottom: 1px solid #f1f5f9;
    }
    .skel.th { height: 10px; flex: 1; }
    .skel.th:first-child { flex: 2; }

    .table-rows { display: flex; flex-direction: column; }
    .table-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 13px 16px;
      border-bottom: 1px solid #f8fafc;
    }
    .table-row:last-child { border-bottom: none; }

    .client-cell { display: flex; align-items: center; gap: 10px; flex: 2; }
    .skel.avatar { width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0; }
    .client-text { display: flex; flex-direction: column; gap: 5px; }
    .skel.c-name  { height: 11px; width: 110px; }
    .skel.c-email { height: 10px; width: 140px; }

    .skel.t-desc   { height: 11px; flex: 1.5; max-width: 140px; }
    .skel.t-val    { height: 11px; width: 80px; }
    .skel.t-date   { height: 11px; width: 76px; }
    .skel.t-method { height: 20px; width: 48px; border-radius: 4px; }
    .skel.t-badge  { height: 22px; width: 72px; border-radius: 20px; }

    .actions-cell  { display: flex; gap: 6px; }
    .skel.t-action { width: 30px; height: 30px; border-radius: 6px; flex-shrink: 0; }
  `]
})
export class ChargesSkeletonComponent {}