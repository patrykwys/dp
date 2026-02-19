import { Component, input, output, inject, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Product } from './product.model';
import { ProductUtilService } from './product-util.service';
import { HealthIndicatorComponent } from './health-indicator.component';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatTooltipModule, HealthIndicatorComponent],
  template: `
    <div
      class="card"
      [class.card--certified]="product().is_certified_on_bi_platform"
      [class.card--draft]="!product().is_published"
      (click)="selected.emit(product())"
    >
      <!-- Grid pattern overlay -->
      <div class="card__pattern"></div>

      <!-- Top Band -->
      <div class="card__band">
        <div class="card__band-left">
          <mat-icon class="card__product-icon">
            {{ product().is_certified_on_bi_platform ? 'verified' : 'dataset' }}
          </mat-icon>
          <span class="card__type-label">Data Product</span>
        </div>
        @if (product().is_certified_on_bi_platform) {
          <span class="card__cert-badge">
            <mat-icon class="card__cert-icon">workspace_premium</mat-icon>
            Certified
          </span>
        } @else {
          <span class="card__uncert-badge">Uncertified</span>
        }
      </div>

      <!-- Body -->
      <div class="card__body">
        <h3 class="card__title">{{ product().name }}</h3>
        <p class="card__description">{{ product().description }}</p>
      </div>

      <!-- Metadata Strip -->
      <div class="card__meta-strip">
        <div class="card__meta-item">
          <span class="card__meta-key">Refreshed</span>
          <span class="card__meta-value">{{ daysSinceUpdate() }}d ago</span>
        </div>
        <div class="card__meta-divider"></div>
        <div class="card__meta-item">
          <span class="card__meta-key">Age</span>
          <span class="card__meta-value">{{ lifecycleAge() }}</span>
        </div>
        <div class="card__meta-divider"></div>
        <div class="card__meta-item">
          <span class="card__meta-key">Health</span>
          <app-health-indicator [product]="product()" />
        </div>
      </div>

      <!-- Footer -->
      <div class="card__footer">
        <div class="card__owner">
          <span class="card__avatar">{{ initials() }}</span>
          <div class="card__owner-info">
            <span class="card__owner-name">{{ product().owner }}</span>
            <span class="card__owner-role">Owner</span>
          </div>
        </div>

        <div class="card__actions">
          @if (!product().is_published) {
            <span class="card__draft-flag">
              <mat-icon class="card__draft-icon">edit_note</mat-icon>
              Draft
            </span>
          }
          <!-- Open in Dialog button -->
          <button
            mat-icon-button
            class="card__dialog-btn"
            matTooltip="Open in modal"
            (click)="onOpenDialog($event)"
          >
            <mat-icon>open_in_full</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: `
    /* ========================================
       BASE CARD
       ======================================== */
    .card {
      position: relative;
      border-radius: 12px;
      cursor: pointer;
      overflow: hidden;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;

      background: #fff;
      border: 1px solid rgba(0, 0, 0, 0.07);

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 36px rgba(0, 0, 0, 0.08);

        .card__pattern {
          opacity: 0.035;
        }

        .card__dialog-btn {
          opacity: 1;
        }
      }

      /* ── Certified ── */
      &--certified {
        background: linear-gradient(168deg, #f0f9f4 0%, #f7faf8 40%, #ffffff 100%);
        border-color: rgba(42, 157, 110, 0.14);

        &:hover {
          border-color: rgba(42, 157, 110, 0.25);
          box-shadow:
            0 12px 36px rgba(42, 157, 110, 0.08),
            0 0 0 1px rgba(42, 157, 110, 0.06);
        }

        .card__band {
          background: linear-gradient(135deg, rgba(42, 157, 110, 0.06) 0%, rgba(42, 157, 110, 0.02) 100%);
          border-bottom-color: rgba(42, 157, 110, 0.08);
        }

        .card__product-icon {
          color: #2a9d6e;
        }

        .card__type-label {
          color: #2a9d6e;
        }

        .card__title {
          color: #14532d;
        }

        .card__meta-strip {
          background: rgba(42, 157, 110, 0.03);
          border-color: rgba(42, 157, 110, 0.06);
        }

        .card__meta-divider {
          background: rgba(42, 157, 110, 0.1);
        }

        .card__avatar {
          background: linear-gradient(135deg, #15803d, #22c55e);
        }

        .card__pattern {
          background-image:
            linear-gradient(rgba(42, 157, 110, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(42, 157, 110, 0.15) 1px, transparent 1px);
        }

        .card__dialog-btn {
          color: #2a9d6e;

          &:hover {
            background: rgba(42, 157, 110, 0.08);
          }
        }
      }

      &--draft {
        opacity: 0.88;
      }
    }

    /* ========================================
       GRID PATTERN
       ======================================== */
    .card__pattern {
      position: absolute;
      inset: 0;
      pointer-events: none;
      opacity: 0.02;
      background-image:
        linear-gradient(rgba(26, 26, 46, 0.2) 1px, transparent 1px),
        linear-gradient(90deg, rgba(26, 26, 46, 0.2) 1px, transparent 1px);
      background-size: 24px 24px;
      transition: opacity 0.3s ease;
      mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.4) 0%, transparent 60%);
      -webkit-mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.4) 0%, transparent 60%);
    }

    /* ========================================
       TOP BAND
       ======================================== */
    .card__band {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 18px;
      background: rgba(0, 0, 0, 0.015);
      border-bottom: 1px solid rgba(0, 0, 0, 0.04);
    }

    .card__band-left {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .card__product-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #8c8c9b;
    }

    .card__type-label {
      font-size: 11px;
      font-weight: 600;
      color: #8c8c9b;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .card__cert-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 10px 3px 6px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 620;
      color: #15803d;
      background: rgba(42, 157, 110, 0.1);
      border: 1px solid rgba(42, 157, 110, 0.15);
    }

    .card__cert-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
      color: #2a9d6e;
    }

    .card__uncert-badge {
      font-size: 11px;
      font-weight: 550;
      color: #a0a0b0;
      padding: 3px 10px;
      border-radius: 6px;
      background: rgba(140, 140, 155, 0.06);
      border: 1px solid rgba(140, 140, 155, 0.08);
    }

    /* ========================================
       BODY
       ======================================== */
    .card__body {
      padding: 18px 18px 14px;
      flex: 1;
    }

    .card__title {
      margin: 0 0 8px;
      font-size: 16px;
      font-weight: 680;
      color: #1a1a2e;
      line-height: 1.3;
      letter-spacing: -0.01em;
    }

    .card__description {
      margin: 0;
      font-size: 12.5px;
      color: #6e6e82;
      line-height: 1.6;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* ========================================
       METADATA STRIP
       ======================================== */
    .card__meta-strip {
      display: flex;
      align-items: center;
      margin: 0 18px;
      padding: 10px 0;
      border-top: 1px solid rgba(0, 0, 0, 0.04);
      border-bottom: 1px solid rgba(0, 0, 0, 0.04);
      background: rgba(0, 0, 0, 0.01);
    }

    .card__meta-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      padding: 4px 8px;
    }

    .card__meta-key {
      font-size: 10px;
      font-weight: 600;
      color: #a0a0b0;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .card__meta-value {
      font-size: 12.5px;
      font-weight: 620;
      color: #3a3a52;
    }

    .card__meta-divider {
      width: 1px;
      height: 28px;
      background: rgba(0, 0, 0, 0.06);
      flex-shrink: 0;
    }

    /* ========================================
       FOOTER
       ======================================== */
    .card__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 18px;
    }

    .card__owner {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .card__avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3a3a5c, #5a5a7e);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 10px;
      font-weight: 700;
    }

    .card__owner-info {
      display: flex;
      flex-direction: column;
    }

    .card__owner-name {
      font-size: 12.5px;
      font-weight: 580;
      color: #3a3a52;
      line-height: 1.2;
    }

    .card__owner-role {
      font-size: 10.5px;
      color: #a0a0b0;
      font-weight: 450;
    }

    .card__actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .card__draft-flag {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      font-size: 11px;
      font-weight: 560;
      color: #b58a2b;
      padding: 3px 9px;
      border-radius: 5px;
      background: rgba(181, 138, 43, 0.08);
      border: 1px solid rgba(181, 138, 43, 0.12);
    }

    .card__draft-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .card__dialog-btn {
      --mdc-icon-button-state-layer-size: 32px;
      --mdc-icon-button-icon-size: 18px;
      color: #8c8c9b;
      opacity: 0;
      transition: opacity 0.2s ease, background 0.15s ease;

      &:hover {
        background: rgba(0, 0, 0, 0.04);
      }
    }
  `,
})
export class ProductCardComponent {
  private utilService = inject(ProductUtilService);

  product = input.required<Product>();
  selected = output<Product>();
  openInDialog = output<Product>();

  initials = computed(() => this.utilService.getOwnerInitials(this.product().owner));
  daysSinceUpdate = computed(() => this.utilService.daysSince(this.product().product_updatedAt));
  lifecycleAge = computed(() => this.utilService.getLifecycleAge(this.product().product_createdAt));

  onOpenDialog(event: MouseEvent): void {
    event.stopPropagation();
    this.openInDialog.emit(this.product());
  }
}