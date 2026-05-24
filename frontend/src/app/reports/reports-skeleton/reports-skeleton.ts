import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reports-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="reports-page">

      <!-- PAGE HEADER -->
      <div class="page-header">
        <div class="header-text">
          <div class="skel title"></div>
          <div class="skel sub"></div>
        </div>
        <div class="skel btn"></div>
      </div>

      <!-- KPI GRID -->
      <div class="kpi-grid">
        <div class="kpi-card" *ngFor="let _ of [1,2,3,4,5,6]">
          <div class="kpi-top">
            <div class="skel kpi-label"></div>
            <div class="skel kpi-icon"></div>
          </div>
          <div class="skel kpi-value"></div>
          <div class="skel kpi-hint"></div>
        </div>
      </div>

      <!-- HERO CHART -->
      <div class="chart-card chart-card--hero">
        <div class="chart-card-header">
          <div class="chart-title-group">
            <div class="skel ct-title"></div>
            <div class="skel ct-sub"></div>
          </div>
          <div class="skel ct-legend"></div>
        </div>
        <div class="skel chart-area-tall"></div>
      </div>

      <!-- CHARTS ROW -->
      <div class="charts-row">
        <div class="chart-card" *ngFor="let _ of [1,2]">
          <div class="chart-card-header">
            <div class="chart-title-group">
              <div class="skel ct-title"></div>
              <div class="skel ct-sub"></div>
            </div>
          </div>
          <div class="skel chart-area-donut"></div>
          <div class="pills-row">
            <div class="skel pill" *ngFor="let _ of [1,2,3,4]"></div>
          </div>
        </div>
      </div>

      <!-- RANKINGS -->
      <div class="rankings-grid">
        <div class="ranking-card" *ngFor="let _ of [1,2]">
          <div class="ranking-card-header">
            <div class="skel rk-icon"></div>
            <div class="ranking-title-text">
              <div class="skel rk-title"></div>
              <div class="skel rk-sub"></div>
            </div>
          </div>
          <div class="ranking-list">
            <div class="ranking-item" *ngFor="let _ of [1,2,3,4,5]">
              <div class="skel rk-pos"></div>
              <div class="skel rk-avatar"></div>
              <div class="ranking-info">
                <div class="skel rk-name"></div>
                <div class="skel rk-hint"></div>
                <div class="skel rk-bar"></div>
              </div>
              <div class="skel rk-value"></div>
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

    .reports-page {
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
    .skel.sub    { height: 12px; width: 320px; }
    .skel.btn    { height: 36px; width: 110px; border-radius: 8px; }

    /* KPI GRID */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    .kpi-card {
      background: #fff;
      border-radius: 12px;
      border: 1px solid #e8eaf0;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .kpi-top { display: flex; align-items: center; justify-content: space-between; }
    .skel.kpi-label { height: 11px; width: 100px; }
    .skel.kpi-icon  { width: 36px; height: 36px; border-radius: 8px; flex-shrink: 0; }
    .skel.kpi-value { height: 26px; width: 140px; border-radius: 6px; }
    .skel.kpi-hint  { height: 10px; width: 130px; }

    /* HERO CHART */
    .chart-card {
      background: #fff;
      border-radius: 14px;
      border: 1px solid #eef0f6;
      padding: 20px;
    }
    .chart-card--hero { display: flex; flex-direction: column; gap: 16px; }
    .chart-card-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }
    .chart-title-group { display: flex; flex-direction: column; gap: 7px; }
    .skel.ct-title  { height: 14px; width: 180px; }
    .skel.ct-sub    { height: 11px; width: 210px; }
    .skel.ct-legend { height: 24px; width: 140px; border-radius: 6px; }
    .skel.chart-area-tall  { height: 220px; border-radius: 8px; }

    /* CHARTS ROW */
    .charts-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .skel.chart-area-donut { height: 200px; border-radius: 8px; margin: 8px 0; }
    .pills-row { display: flex; flex-wrap: wrap; gap: 8px; }
    .skel.pill { height: 24px; width: 80px; border-radius: 20px; }

    /* RANKINGS */
    .rankings-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .ranking-card {
      background: #fff;
      border-radius: 14px;
      border: 1px solid #eef0f6;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .ranking-card-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .skel.rk-icon  { width: 36px; height: 36px; border-radius: 8px; flex-shrink: 0; }
    .ranking-title-text { display: flex; flex-direction: column; gap: 6px; }
    .skel.rk-title { height: 13px; width: 110px; }
    .skel.rk-sub   { height: 10px; width: 160px; }

    .ranking-list { display: flex; flex-direction: column; gap: 2px; }
    .ranking-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 0;
      border-bottom: 1px solid #f8fafc;
    }
    .ranking-item:last-child { border-bottom: none; }
    .skel.rk-pos    { width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0; }
    .skel.rk-avatar { width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0; }
    .ranking-info { flex: 1; display: flex; flex-direction: column; gap: 5px; }
    .skel.rk-name  { height: 12px; width: 120px; }
    .skel.rk-hint  { height: 10px; width: 90px; }
    .skel.rk-bar   { height: 4px; border-radius: 4px; width: 100%; }
    .skel.rk-value { height: 14px; width: 80px; }
  `]
})
export class ReportsSkeletonComponent {}