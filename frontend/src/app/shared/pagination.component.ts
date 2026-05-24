import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pagination-wrapper" *ngIf="totalItems > 0">
      <span class="pagination-info">
        Mostrando {{ rangeStart }}–{{ rangeEnd }} de {{ totalItems }} {{ itemLabel }}
      </span>

      <div class="pagination-controls">

        <!-- Anterior -->
        <button class="page-btn nav-btn" (click)="changePage(currentPage - 1)" [disabled]="currentPage === 1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        <!-- Primeira página sempre visível -->
        <button class="page-btn" [class.active]="currentPage === 1" (click)="changePage(1)">1</button>

        <!-- Reticências esquerda -->
        <span class="page-ellipsis" *ngIf="showLeftEllipsis">...</span>

        <!-- Páginas do meio -->
        <button
          class="page-btn"
          [class.active]="currentPage === p"
          *ngFor="let p of middlePages"
          (click)="changePage(p)">
          {{ p }}
        </button>

        <!-- Reticências direita -->
        <span class="page-ellipsis" *ngIf="showRightEllipsis">...</span>

        <!-- Última página sempre visível -->
        <button class="page-btn" [class.active]="currentPage === totalPages" (click)="changePage(totalPages)" *ngIf="totalPages > 1">
          {{ totalPages }}
        </button>

        <!-- Próximo -->
        <button class="page-btn nav-btn" (click)="changePage(currentPage + 1)" [disabled]="currentPage === totalPages">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>

      </div>

      <!-- Itens por página -->
      <div class="per-page-wrapper">
        <span class="per-page-label">Por página:</span>
        <select class="per-page-select" [value]="pageSize" (change)="changePageSize($event)">
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
        </select>
      </div>
    </div>
  `,
  styles: [`
    .pagination-wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 0 2px;
      flex-wrap: wrap;
      gap: 12px;
    }

    .pagination-info {
      font-size: 12.5px;
      color: #64748b;
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .page-btn {
      min-width: 32px;
      height: 32px;
      padding: 0 6px;
      border-radius: 8px;
      border: 1px solid #e8eaf0;
      background: #fff;
      color: #334155;
      font-size: 13px;
      font-family: 'Sora', sans-serif;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;

      &:hover:not(:disabled):not(.active) {
        background: #f1f5f9;
        border-color: #cbd5e1;
      }

      &.active {
        background: #1a6cf6;
        border-color: #1a6cf6;
        color: #fff;
      }

      &:disabled {
        opacity: 0.35;
        cursor: not-allowed;
      }
    }

    .nav-btn {
      svg { display: block; }
    }

    .page-ellipsis {
      font-size: 13px;
      color: #94a3b8;
      padding: 0 4px;
      user-select: none;
    }

    .per-page-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .per-page-label {
      font-size: 12.5px;
      color: #64748b;
    }

    .per-page-select {
      height: 32px;
      padding: 0 8px;
      border-radius: 8px;
      border: 1px solid #e8eaf0;
      background: #fff;
      color: #334155;
      font-size: 13px;
      font-family: 'Sora', sans-serif;
      cursor: pointer;
      outline: none;

      &:focus { border-color: #1a6cf6; }
    }
  `]
})
export class PaginationComponent implements OnChanges {
  @Input() totalItems = 0;
  @Input() currentPage = 1;
  @Input() pageSize = 10;
  @Input() itemLabel = 'registros';

  @Output() pageChange     = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  totalPages = 1;
  middlePages: number[] = [];
  showLeftEllipsis  = false;
  showRightEllipsis = false;

  get rangeStart(): number { return (this.currentPage - 1) * this.pageSize + 1; }
  get rangeEnd():   number { return Math.min(this.currentPage * this.pageSize, this.totalItems); }

  ngOnChanges(): void {
    this.totalPages = Math.ceil(this.totalItems / this.pageSize) || 1;
    this.buildPages();
  }

  buildPages(): void {
    const total   = this.totalPages;
    const current = this.currentPage;

    // Sem reticências se poucas páginas
    if (total <= 7) {
      this.middlePages      = Array.from({ length: Math.max(0, total - 2) }, (_, i) => i + 2);
      this.showLeftEllipsis  = false;
      this.showRightEllipsis = false;
      return;
    }

    this.showLeftEllipsis  = current > 4;
    this.showRightEllipsis = current < total - 3;

    let start = Math.max(2, current - 1);
    let end   = Math.min(total - 1, current + 1);

    if (current <= 4)        { start = 2; end = 5; }
    if (current >= total - 3) { start = total - 4; end = total - 1; }

    this.middlePages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.pageChange.emit(page);
  }

  changePageSize(event: Event): void {
    const size = Number((event.target as HTMLSelectElement).value);
    this.pageSizeChange.emit(size);
  }
}