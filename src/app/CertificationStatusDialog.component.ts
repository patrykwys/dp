import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Product } from './product.model';
import { ProductBadgeComponent } from './product-badge.component';

@Component({
  selector: 'app-certification-status-dialog',
  standalone: true,
  imports: [MatDialogModule, MatIconModule, MatButtonModule, ProductBadgeComponent],
  template: `
    <h2 mat-dialog-title class="csd-title">
      {{ product.is_certified_on_bi_platform ? 'Certification Details' : 'Certification Status' }}
      <button mat-icon-button mat-dialog-close class="csd-title__close">
        <mat-icon>close</mat-icon>
      </button>
    </h2>

    <mat-dialog-content>
      <div class="csd-card" [class.csd-card--certified]="product.is_certified_on_bi_platform" [class.csd-card--uncertified]="!product.is_certified_on_bi_platform">

        <!-- Badge top-right -->
        <app-product-badge
          class="csd-card__badge"
          [variant]="product.is_certified_on_bi_platform ? 'certified' : 'uncertified'"
          mode="overlay"
        />

        <!-- Hero icon -->
        <div class="csd-hero">
          @if (product.is_certified_on_bi_platform) {
            <div class="csd-hero__circle csd-hero__circle--pass">
              <mat-icon class="csd-hero__icon">check</mat-icon>
            </div>
          } @else {
            <div class="csd-hero__circle csd-hero__circle--fail">
              <mat-icon class="csd-hero__icon">close</mat-icon>
            </div>
          }
          <h3 class="csd-hero__heading">
            {{ product.is_certified_on_bi_platform ? 'Data Source Certified' : 'Datasource Not Certified' }}
          </h3>
          <p class="csd-hero__sub">
            {{ product.is_certified_on_bi_platform
              ? 'This datasource meets all quality and compliance standards'
              : 'This datasource requires metadata updates to achieve certification'
            }}
          </p>
        </div>

        <!-- Info rows -->
        <div class="csd-info">
          @if (product.is_certified_on_bi_platform) {
            <div class="csd-info__row">
              <span class="csd-info__label">Certified By:</span>
              <span class="csd-info__value">Data Governance Team</span>
            </div>
            <div class="csd-info__divider"></div>
            <div class="csd-info__row">
              <span class="csd-info__label">Certification Date:</span>
              <span class="csd-info__value">{{ certDateFormatted }}</span>
            </div>
          } @else {
            <div class="csd-info__row">
              <span class="csd-info__label">Status:</span>
              <span class="csd-info__value csd-info__value--red">Not Certified</span>
            </div>
            <div class="csd-info__divider"></div>
            <div class="csd-info__row">
              <span class="csd-info__label">Required Action:</span>
              <span class="csd-info__value">Update metadata fields</span>
            </div>
          }
        </div>

        <!-- Requirements -->
        <div class="csd-reqs">
          <h4 class="csd-reqs__title" [class.csd-reqs__title--pass]="product.is_certified_on_bi_platform" [class.csd-reqs__title--fail]="!product.is_certified_on_bi_platform">
            {{ product.is_certified_on_bi_platform ? 'Certification Requirements Met' : 'Certification Requirements Not Met' }}
          </h4>
          @for (req of requirements; track req.label) {
            <div class="csd-reqs__row">
              <mat-icon class="csd-reqs__icon" [class.csd-reqs__icon--pass]="req.met" [class.csd-reqs__icon--fail]="!req.met">
                {{ req.met ? 'check_circle' : 'cancel' }}
              </mat-icon>
              <span class="csd-reqs__label">{{ req.label }}</span>
            </div>
          }
        </div>

        <!-- Next Steps (uncertified only) -->
        @if (!product.is_certified_on_bi_platform) {
          <div class="csd-next">
            <mat-icon class="csd-next__icon">lightbulb</mat-icon>
            <span class="csd-next__text">
              <strong>Next Steps:</strong> Use the "Update Metadata" menu to update the required data points to become eligible for certification.
            </span>
          </div>
        }
      </div>
    </mat-dialog-content>
  `,
  styles: `
    /* ── Title bar ── */
    .csd-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 0;
      padding: 14px 20px;
      font-size: 16px;
      font-weight: 700;
      color: #fff;
      background: #15803d;
      font-family: 'Instrument Serif', Georgia, serif;
    }

    .csd-title__close {
      color: rgba(255, 255, 255, 0.8);
      --mdc-icon-button-state-layer-size: 32px;
      --mdc-icon-button-icon-size: 18px;
    }

    /* ── Card container ── */
    .csd-card {
      position: relative;
      margin: 20px;
      border-radius: 10px;
      padding: 28px 24px 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .csd-card--certified {
      border: 2px solid #2a9d6e;
      background: #fff;
    }

    .csd-card--uncertified {
      border: 2px solid #c0c0cc;
      background: #fff;
    }

    /* ── Badge ── */
    .csd-card__badge {
      position: absolute;
      top: 12px;
      right: 12px;
    }

    /* ── Hero ── */
    .csd-hero {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 8px;
    }

    .csd-hero__circle {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .csd-hero__circle--pass {
      background: #22c55e;
    }

    .csd-hero__circle--fail {
      background: transparent;
      border: 3px solid #c0c0cc;
    }

    .csd-hero__icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .csd-hero__circle--pass .csd-hero__icon {
      color: #fff;
    }

    .csd-hero__circle--fail .csd-hero__icon {
      color: #8c8c9b;
    }

    .csd-hero__heading {
      margin: 4px 0 0;
      font-size: 18px;
      font-weight: 700;
      color: #1a1a2e;
    }

    .csd-hero__sub {
      margin: 0;
      font-size: 13px;
      color: #6e6e82;
      max-width: 320px;
      line-height: 1.5;
    }

    /* ── Info rows ── */
    .csd-info {
      padding: 16px;
      border-radius: 8px;
      background: #f6f6f8;
    }

    .csd-info__row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }

    .csd-info__divider {
      height: 1px;
      background: rgba(0, 0, 0, 0.06);
    }

    .csd-info__label {
      font-size: 13px;
      font-weight: 600;
      color: #3a3a52;
    }

    .csd-info__value {
      font-size: 13px;
      color: #6e6e82;
    }

    .csd-info__value--red {
      color: #e05d44;
      font-weight: 600;
    }

    /* ── Requirements ── */
    .csd-reqs {
      padding: 16px;
      border-radius: 8px;
      background: #f6f6f8;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .csd-reqs__title {
      margin: 0;
      font-size: 14px;
      font-weight: 700;
    }

    .csd-reqs__title--pass {
      color: #15803d;
    }

    .csd-reqs__title--fail {
      color: #c4553a;
    }

    .csd-reqs__row {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .csd-reqs__icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
    }

    .csd-reqs__icon--pass {
      color: #22c55e;
    }

    .csd-reqs__icon--fail {
      color: #e05d44;
    }

    .csd-reqs__label {
      font-size: 14px;
      font-weight: 500;
      color: #1a1a2e;
    }

    /* ── Next Steps ── */
    .csd-next {
      display: flex;
      gap: 10px;
      padding: 14px 16px;
      border-radius: 8px;
      background: rgba(217, 119, 6, 0.08);
      border: 1px solid rgba(217, 119, 6, 0.16);
      align-items: flex-start;
    }

    .csd-next__icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #d97706;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .csd-next__text {
      font-size: 13px;
      color: #3a3a52;
      line-height: 1.6;
    }
  `,
})
export class CertificationStatusDialogComponent {
  readonly dialogRef = inject(MatDialogRef<CertificationStatusDialogComponent>);
  readonly product: Product = inject(MAT_DIALOG_DATA);

  readonly certDateFormatted = this.formatDate(this.product.product_updatedAt);

  readonly requirements = [
    { label: 'Detailed Description', met: (this.product.description?.length ?? 0) >= 150 },
    { label: 'Data Sensitivity Label Applied', met: !!this.product.sp21Classification },
  ];

  private formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }
}