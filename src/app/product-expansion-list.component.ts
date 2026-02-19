import { Component, input, output, inject, computed } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { Product } from './product.model';
import { ProductUtilService } from './product-util.service';
import { StatusPillComponent } from './status-pill.component';
import { HealthIndicatorComponent } from './health-indicator.component';
import { ShortDatePipe } from './short-date.pipe';

@Component({
  selector: 'app-product-expansion-list',
  standalone: true,
  imports: [
    MatExpansionModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    StatusPillComponent,
    HealthIndicatorComponent,
    ShortDatePipe,
  ],
  template: `
    <mat-accordion class="product-accordion" multi>
      @for (product of products(); track product.id) {
        <mat-expansion-panel
          class="product-panel"
          [class.product-panel--certified]="product.is_certified_on_bi_platform"
        >
          <!-- Panel Header -->
          <mat-expansion-panel-header class="product-panel__header">
            <mat-panel-title class="product-panel__title-row">
              <!-- Cert indicator dot -->
              @if (product.is_certified_on_bi_platform) {
                <span class="cert-dot"></span>
              }
              <span class="product-panel__name">{{ product.name }}</span>
            </mat-panel-title>

            <mat-panel-description class="product-panel__meta">
              <div class="product-panel__pills">
                <app-status-pill
                  [active]="product.is_certified_on_bi_platform"
                  [label]="product.is_certified_on_bi_platform ? 'Certified' : 'Uncertified'"
                  [icon]="product.is_certified_on_bi_platform ? '✓' : '○'"
                />
                <app-status-pill
                  [active]="product.is_published"
                  [label]="product.is_published ? 'Published' : 'Draft'"
                  [icon]="product.is_published ? '◉' : '◌'"
                />
                <app-health-indicator [product]="product" />
              </div>
              <div class="product-panel__owner-chip">
                <span class="avatar avatar--xs">{{ getInitials(product.owner) }}</span>
                <span class="product-panel__owner-name">{{ product.owner }}</span>
              </div>
            </mat-panel-description>
          </mat-expansion-panel-header>

          <!-- Expanded Content -->
          <div class="product-panel__body">
            <!-- Description -->
            <p class="product-panel__description">{{ product.description }}</p>

            <mat-divider />

            <!-- Detail Grid -->
            <div class="detail-grid">
              <div class="detail-grid__section">
                <label class="detail-grid__label">Lifecycle</label>
                <div class="detail-grid__cards">
                  <div class="detail-card">
                    <span class="detail-card__key">Product Created</span>
                    <span class="detail-card__value">{{ product.product_createdAt | shortDate }}</span>
                    <span class="detail-card__sub">Age: {{ getAge(product.product_createdAt) }}</span>
                  </div>
                  <div class="detail-card">
                    <span class="detail-card__key">Last Refreshed</span>
                    <span class="detail-card__value">{{ product.product_updatedAt | shortDate }}</span>
                    <span class="detail-card__sub">{{ getDaysSince(product.product_updatedAt) }}d ago</span>
                  </div>
                  <div class="detail-card">
                    <span class="detail-card__key">Registered</span>
                    <span class="detail-card__value">{{ product.createdAt | shortDate }}</span>
                    <span class="detail-card__sub">Catalog entry</span>
                  </div>
                  <div class="detail-card">
                    <span class="detail-card__key">Catalog Updated</span>
                    <span class="detail-card__value">{{ product.updatedAt | shortDate }}</span>
                    <span class="detail-card__sub">Metadata sync</span>
                  </div>
                </div>
              </div>

              <!-- Future sections row -->
              <div class="detail-grid__section">
                <label class="detail-grid__label">Coming Soon</label>
                <div class="future-slots">
                  <div class="future-slot">
                    <mat-icon class="future-slot__icon">account_tree</mat-icon>
                    <span class="future-slot__label">Lineage</span>
                  </div>
                  <div class="future-slot">
                    <mat-icon class="future-slot__icon">bar_chart</mat-icon>
                    <span class="future-slot__label">BI Reports</span>
                  </div>
                  <div class="future-slot">
                    <mat-icon class="future-slot__icon">group</mat-icon>
                    <span class="future-slot__label">Roles</span>
                  </div>
                  <div class="future-slot">
                    <mat-icon class="future-slot__icon">verified</mat-icon>
                    <span class="future-slot__label">Certification</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions Footer -->
            <div class="product-panel__actions">
              <button
                mat-stroked-button
                class="product-panel__detail-btn"
                (click)="openDetail.emit(product); $event.stopPropagation()"
              >
                <mat-icon>open_in_new</mat-icon>
                Full Details
              </button>
            </div>
          </div>
        </mat-expansion-panel>
      }
    </mat-accordion>
  `,
  styles: `
    /* ---------- Accordion ---------- */
    .product-accordion {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    /* ---------- Panel ---------- */
    .product-panel {
      --mat-expansion-container-shape: 10px;
      --mat-expansion-header-collapsed-state-height: 64px;
      --mat-expansion-header-expanded-state-height: 64px;
      --mat-expansion-container-background-color: #fff;

      border: 1px solid rgba(0, 0, 0, 0.06) !important;
      box-shadow: none !important;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: 0;
        background: linear-gradient(180deg, #c9a94e, #a07c2e);
        transition: width 0.2s ease;
        z-index: 1;
        border-radius: 10px 0 0 10px;
      }

      &--certified::before {
        width: 4px;
      }

      &--certified {
        border-color: rgba(201, 169, 78, 0.15);
      }

      &:hover {
        border-color: rgba(0, 0, 0, 0.1);
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
      }

      /* ---------- Header ---------- */
      &__header {
        padding: 0 24px 0 28px;
        font-family: 'DM Sans', sans-serif;
      }

      &__title-row {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 0 0 auto;
        min-width: 240px;
      }

      &__name {
        font-size: 14.5px;
        font-weight: 620;
        color: #1a1a2e;
        letter-spacing: 0.005em;
      }

      &__meta {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 16px;
        flex: 1;
      }

      &__pills {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      &__owner-chip {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px 4px 4px;
        border-radius: 20px;
        background: rgba(0, 0, 0, 0.025);
        border: 1px solid rgba(0, 0, 0, 0.04);
      }

      &__owner-name {
        font-size: 12px;
        color: #6e6e82;
        font-weight: 480;
      }

      /* ---------- Body ---------- */
      &__body {
        padding: 4px 28px 20px;
      }

      &__description {
        margin: 0 0 16px;
        font-size: 13.5px;
        color: #4a4a62;
        line-height: 1.65;
        max-width: 720px;
      }

      mat-divider {
        margin-bottom: 16px;
      }

      /* ---------- Actions ---------- */
      &__actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 16px;
      }

      &__detail-btn {
        --mdc-outlined-button-label-text-size: 12.5px;
        --mdc-outlined-button-label-text-weight: 550;
        --mdc-outlined-button-label-text-color: #5a5a6e;
        --mdc-outlined-button-outline-color: rgba(0, 0, 0, 0.1);
        --mdc-outlined-button-container-shape: 8px;
        --mdc-outlined-button-container-height: 34px;

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
          margin-right: 4px;
        }
      }
    }

    /* ---------- Avatar ---------- */
    .avatar {
      border-radius: 50%;
      background: linear-gradient(135deg, #3a3a5c, #5a5a7e);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: 700;

      &--xs {
        width: 22px;
        height: 22px;
        font-size: 9px;
      }
    }

    .cert-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #c9a94e;
      flex-shrink: 0;
      box-shadow: 0 0 0 2px rgba(201, 169, 78, 0.2);
    }

    /* ---------- Detail Grid ---------- */
    .detail-grid {
      display: flex;
      flex-direction: column;
      gap: 18px;

      &__section {}

      &__label {
        display: block;
        font-size: 11px;
        font-weight: 600;
        color: #8c8c9b;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        margin-bottom: 8px;
      }

      &__cards {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
      }
    }

    .detail-card {
      display: flex;
      flex-direction: column;
      padding: 10px 12px;
      border-radius: 8px;
      background: #f7f7f5;
      border: 1px solid rgba(0, 0, 0, 0.04);

      &__key {
        font-size: 10.5px;
        color: #8c8c9b;
        font-weight: 500;
        margin-bottom: 3px;
      }

      &__value {
        font-size: 13px;
        font-weight: 600;
        color: #1a1a2e;
      }

      &__sub {
        font-size: 10.5px;
        color: #a0a0b0;
        margin-top: 1px;
      }
    }

    /* ---------- Future Slots ---------- */
    .future-slots {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
    }

    .future-slot {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      border-radius: 8px;
      border: 1.5px dashed rgba(140, 140, 155, 0.18);
      background: rgba(140, 140, 155, 0.02);

      &__icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: #b0b0c0;
      }

      &__label {
        font-size: 12px;
        color: #9090a0;
        font-weight: 500;
      }
    }

    /* ---------- Responsive ---------- */
    @media (max-width: 900px) {
      .detail-grid__cards,
      .future-slots {
        grid-template-columns: repeat(2, 1fr);
      }

      .product-panel__pills {
        display: none;
      }
    }
  `,
})
export class ProductExpansionListComponent {
  private utilService = inject(ProductUtilService);

  products = input.required<Product[]>();
  openDetail = output<Product>();

  getInitials(owner: string): string {
    return this.utilService.getOwnerInitials(owner);
  }

  getAge(date: Date): string {
    return this.utilService.getLifecycleAge(date);
  }

  getDaysSince(date: Date): number {
    return this.utilService.daysSince(date);
  }
}