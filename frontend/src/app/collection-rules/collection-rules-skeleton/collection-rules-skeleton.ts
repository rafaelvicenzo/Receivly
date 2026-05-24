import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-collection-rules-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rules-page">

      <!-- PAGE HEADER -->
      <div class="page-header">
        <div class="header-text">
          <div class="skel title"></div>
          <div class="skel sub"></div>
        </div>
      </div>

      <!-- RULE CARDS -->
      <div class="rules-list">
        <div class="rule-card" *ngFor="let _ of [1,2]">

          <!-- RULE HEADER -->
          <div class="rule-header">
            <div class="rule-info">
              <div class="rule-title-row">
                <div class="skel r-title"></div>
                <div class="skel r-badge"></div>
              </div>
              <div class="skel r-sub"></div>
            </div>
            <div class="rule-actions">
              <div class="skel r-toggle"></div>
              <div class="skel r-btn"></div>
            </div>
          </div>

          <!-- STEPS PREVIEW -->
          <div class="steps-preview">
            <div class="step-item" *ngFor="let _ of [1,2,3]">
              <div class="skel s-icon"></div>
              <div class="step-info">
                <div class="skel s-timing"></div>
                <div class="skel s-message"></div>
              </div>
              <div class="skel s-badge"></div>
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

    .rules-page {
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
    .skel.title  { height: 22px; width: 180px; border-radius: 8px; }
    .skel.sub    { height: 12px; width: 300px; }

    /* RULES LIST */
    .rules-list { display: flex; flex-direction: column; gap: 16px; }

    .rule-card {
      background: #fff;
      border-radius: 14px;
      border: 1px solid #e8eaf0;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    /* RULE HEADER */
    .rule-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }
    .rule-info { display: flex; flex-direction: column; gap: 8px; }
    .rule-title-row { display: flex; align-items: center; gap: 10px; }
    .skel.r-title  { height: 16px; width: 160px; border-radius: 6px; }
    .skel.r-badge  { height: 20px; width: 60px; border-radius: 20px; }
    .skel.r-sub    { height: 11px; width: 130px; }

    .rule-actions { display: flex; align-items: center; gap: 12px; }
    .skel.r-toggle { height: 26px; width: 80px; border-radius: 20px; }
    .skel.r-btn    { height: 34px; width: 72px; border-radius: 8px; }

    /* STEPS */
    .steps-preview {
      display: flex;
      flex-direction: column;
      gap: 2px;
      border-top: 1px solid #f1f5f9;
      padding-top: 14px;
    }
    .step-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid #f8fafc;
    }
    .step-item:last-child { border-bottom: none; }
    .skel.s-icon    { width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0; }
    .step-info      { flex: 1; display: flex; flex-direction: column; gap: 6px; }
    .skel.s-timing  { height: 11px; width: 130px; }
    .skel.s-message { height: 10px; width: 260px; }
    .skel.s-badge   { height: 22px; width: 64px; border-radius: 20px; flex-shrink: 0; }
  `]
})
export class CollectionRulesSkeletonComponent {}