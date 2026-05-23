import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dash-content">

      <!-- GREETING -->
      <div class="skel-greeting">
        <div class="skel title"></div>
        <div class="skel sub"></div>
      </div>

      <!-- METRICS -->
      <div class="metrics-grid">
        <div class="metric-card" *ngFor="let _ of [1,2,3,4]">
          <div class="metric-top">
            <div class="skel label"></div>
            <div class="skel icon"></div>
          </div>
          <div class="skel value"></div>
          <div class="skel sub-small"></div>
        </div>
      </div>

      <!-- MIDDLE ROW -->
      <div class="middle-row">
        <div class="card chart-card">
          <div class="chart-header">
            <div class="skel chart-title"></div>
            <div class="skel chart-filter"></div>
          </div>
          <div class="skel chart-area"></div>
        </div>

        <div class="card actions-card">
          <div class="skel actions-title"></div>
          <div class="actions-list">
            <div class="action-item-skel" *ngFor="let _ of [1,2,3,4,5]">
              <div class="skel a-icon"></div>
              <div class="a-text">
                <div class="skel a-title"></div>
                <div class="skel a-desc"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- BOTTOM ROW -->
      <div class="bottom-row">
        <div class="card table-card">
          <div class="table-header-skel">
            <div class="skel t-title"></div>
            <div class="skel t-btn"></div>
          </div>
          <div class="table-rows">
            <div class="table-row-skel" *ngFor="let _ of [1,2,3,4,5]">
              <div class="skel t-avatar"></div>
              <div class="skel t-name"></div>
              <div class="skel t-val"></div>
              <div class="skel t-date"></div>
              <div class="skel t-badge"></div>
            </div>
          </div>
        </div>

        <div class="ai-card">
          <div class="skel-dark ai-title"></div>
          <div class="skel-dark ai-desc"></div>
          <div class="ai-sug-list">
            <div class="skel-dark ai-sug" *ngFor="let _ of [1,2]"></div>
          </div>
          <div class="ai-input-skel">
            <div class="skel-dark ai-input"></div>
            <div class="ai-send-placeholder"></div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; }

    @keyframes shimmer {
      0%   { background-position: -700px 0; }
      100% { background-position: 700px 0; }
    }

    .skel {
      background: linear-gradient(90deg, #e8edf4 25%, #f4f7fb 50%, #e8edf4 75%);
      background-size: 700px 100%;
      animation: shimmer 1.4s ease-in-out infinite;
      border-radius: 6px;
    }

    .skel-dark {
      background: linear-gradient(90deg,
        rgba(255,255,255,0.08) 25%,
        rgba(255,255,255,0.17) 50%,
        rgba(255,255,255,0.08) 75%
      );
      background-size: 700px 100%;
      animation: shimmer 1.4s ease-in-out infinite;
      border-radius: 6px;
    }

    /* layout herdado do dashboard real */
    .dash-content {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* GREETING */
    .skel-greeting { display: flex; flex-direction: column; gap: 9px; }
    .skel.title    { height: 26px; width: 240px; border-radius: 8px; }
    .skel.sub      { height: 13px; width: 200px; }

    /* METRICS */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }
    .metric-card {
      background: #fff;
      border-radius: 12px;
      padding: 20px;
      border: 1px solid #e8eaf0;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .metric-top { display: flex; align-items: center; justify-content: space-between; }
    .skel.label     { height: 12px; width: 88px; }
    .skel.icon      { width: 36px; height: 36px; border-radius: 8px; flex-shrink: 0; }
    .skel.value     { height: 24px; width: 130px; border-radius: 6px; }
    .skel.sub-small { height: 10px; width: 80px; }

    /* MIDDLE ROW */
    .middle-row {
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: 16px;
    }
    .card {
      background: #fff;
      border-radius: 14px;
      border: 1px solid #eef0f6;
    }
    .chart-card {
      padding: 14px 20px 12px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .chart-header { display: flex; align-items: center; justify-content: space-between; }
    .skel.chart-title  { height: 14px; width: 220px; }
    .skel.chart-filter { height: 28px; width: 120px; border-radius: 8px; }
    .skel.chart-area   { height: 130px; border-radius: 8px; }

    .actions-card {
      border-radius: 12px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .skel.actions-title { height: 13px; width: 110px; }
    .actions-list { display: flex; flex-direction: column; gap: 2px; }
    .action-item-skel {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 8px;
    }
    .skel.a-icon  { width: 36px; height: 36px; border-radius: 8px; flex-shrink: 0; }
    .a-text { flex: 1; display: flex; flex-direction: column; gap: 5px; }
    .skel.a-title { height: 11px; width: 100px; }
    .skel.a-desc  { height: 10px; width: 75px; }

    /* BOTTOM ROW */
    .bottom-row {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: 16px;
    }
    .table-card {
      border-radius: 12px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .table-header-skel { display: flex; align-items: center; justify-content: space-between; }
    .skel.t-title { height: 13px; width: 160px; }
    .skel.t-btn   { height: 28px; width: 72px; border-radius: 6px; }

    .table-rows { display: flex; flex-direction: column; }
    .table-row-skel {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 0;
      border-bottom: 1px solid #f1f5f9;
    }
    .table-row-skel:last-child { border-bottom: none; }
    .skel.t-avatar { width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0; }
    .skel.t-name   { height: 11px; flex: 1; max-width: 130px; }
    .skel.t-val    { height: 11px; width: 76px; }
    .skel.t-date   { height: 11px; width: 64px; }
    .skel.t-badge  { height: 20px; width: 68px; border-radius: 20px; }

    /* AI CARD */
    .ai-card {
      background: linear-gradient(145deg, #1e4fd8, #6d28d9);
      border-radius: 16px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-height: 380px;
    }
    .skel-dark.ai-title { height: 14px; width: 110px; border-radius: 6px; }
    .skel-dark.ai-desc  { height: 11px; width: 200px; border-radius: 5px; }
    .ai-sug-list { margin-top: auto; display: flex; flex-direction: column; gap: 8px; }
    .skel-dark.ai-sug { height: 44px; border-radius: 10px; }
    .ai-input-skel { display: flex; gap: 8px; }
    .skel-dark.ai-input { flex: 1; height: 38px; border-radius: 10px; }
    .ai-send-placeholder {
      width: 38px; height: 38px; border-radius: 10px;
      background: rgba(255,255,255,0.22);
      flex-shrink: 0;
    }
  `]
})
export class DashboardSkeletonComponent {}