import { Component, input, output, inject, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Product } from './product.model';
import { ProductUtilService } from './product-util.service';
import { ShortDatePipe } from './short-date.pipe';
import { ProductBadgeComponent } from './product-badge.component';


@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatTooltipModule, ProductBadgeComponent, ShortDatePipe],
  template: `
    <div
      class="card"
      [class.card--certified]="product().is_certified_on_bi_platform"
      [class.card--draft]="!product().is_published"
      (click)="selected.emit(product())"
    >
      <!-- Image Area -->
      <div class="card__image-wrapper">
        <img
          class="card__image"
          [src]="'https://picsum.photos/seed/' + product().id + '/400/180'"
          [alt]="product().name"
          loading="lazy"
        />
        <div class="card__image-overlay"></div>

        <!-- Certification Badge on image -->
        <app-product-badge
          class="card__badge-cert"
          [variant]="product().is_certified_on_bi_platform ? 'certified' : 'uncertified'"
          mode="overlay"
        />

        @if (!product().is_published) {
          <app-product-badge
            class="card__badge-draft"
            variant="draft"
            mode="overlay"
          />
        }
      </div>

      <!-- Content -->
      <div class="card__content">
        <h3 class="card__title" [matTooltip]="product().name" matTooltipShowDelay="400">{{ product().name }}</h3>
        <p
          class="card__description"
          [matTooltip]="product().description.length > 120 ? product().description.substring(0, 200) + '...' : ''"
          matTooltipShowDelay="500"
          matTooltipClass="card-tooltip"
        >{{ product().description }}</p>

        <!-- Dates -->
        <div class="card__dates">
          <div class="card__date">
            <mat-icon class="card__date-icon">calendar_today</mat-icon>
            <span class="card__date-text">
              Created {{ product().product_createdAt | shortDate }}
            </span>
          </div>
          <div class="card__date">
            <mat-icon class="card__date-icon">update</mat-icon>
            <span class="card__date-text">
              Updated {{ product().product_updatedAt | shortDate }}
            </span>
          </div>
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
      width: 320px;
      height: 420px;

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 36px rgba(0, 0, 0, 0.08);

        .card__image {
          transform: scale(1.03);
        }

        .card__dialog-btn {
          opacity: 1;
        }
      }

      /* ── Certified ── */
      &--certified {
        border-color: rgba(42, 157, 110, 0.18);
        background: linear-gradient(180deg, #fff 0%, #f7fdf9 100%);

        &:hover {
          border-color: rgba(42, 157, 110, 0.3);
          box-shadow:
            0 12px 36px rgba(42, 157, 110, 0.08),
            0 0 0 1px rgba(42, 157, 110, 0.06);
        }

        .card__footer {
          border-top-color: rgba(42, 157, 110, 0.08);
        }

        .card__avatar {
          background: linear-gradient(135deg, #15803d, #22c55e);
        }

        .card__dialog-btn {
          color: #2a9d6e;
          &:hover { background: rgba(42, 157, 110, 0.08); }
        }
      }

      &--draft {
        opacity: 0.88;
      }
    }

    /* ========================================
       IMAGE
       ======================================== */
    .card__image-wrapper {
      position: relative;
      width: 100%;
      height: 160px;
      overflow: hidden;
      flex-shrink: 0;
    }

    .card__image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .card__image-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        180deg,
        transparent 40%,
        rgba(0, 0, 0, 0.03) 100%
      );
      pointer-events: none;
    }

    /* ── Badge positioning on image ── */
    .card__badge-cert {
      position: absolute;
      top: 10px;
      right: 10px;
    }

    .card__badge-draft {
      position: absolute;
      top: 10px;
      left: 10px;
    }

    /* ========================================
       CONTENT
       ======================================== */
    .card__content {
      padding: 16px 18px 12px;
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
      overflow: hidden;
    }

    .card__title {
      margin: 0 0 6px;
      font-size: 15.5px;
      font-weight: 680;
      color: #1a1a2e;
      line-height: 1.3;
      letter-spacing: -0.01em;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      overflow-wrap: break-word;
      word-break: break-word;
    }

    .card--certified .card__title {
      color: #14532d;
    }

    .card__description {
      margin: 0 0 12px;
      font-size: 12.5px;
      color: #6e6e82;
      line-height: 1.6;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      overflow-wrap: break-word;
      word-break: break-word;
      flex: 1;
      min-height: 0;
    }

    /* ── Dates ── */
    .card__dates {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex-shrink: 0;
      margin-top: auto;
    }

    .card__date {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .card__date-icon {
      font-size: 13px;
      width: 13px;
      height: 13px;
      color: #b0b0c0;
    }

    .card__date-text {
      font-size: 11px;
      color: #8c8c9b;
      font-weight: 480;
    }

    /* ========================================
       FOOTER
       ======================================== */
    .card__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 18px;
      border-top: 1px solid rgba(0, 0, 0, 0.05);
      flex-shrink: 0;
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
      flex-shrink: 0;
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

  onOpenDialog(event: MouseEvent): void {
    event.stopPropagation();
    this.openInDialog.emit(this.product());
  }
}