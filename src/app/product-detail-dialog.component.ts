import { Component, inject, computed } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { Product, LifecycleEntry } from './product.model';
import { ProductUtilService } from './product-util.service';
import { StatusPillComponent } from './status-pill.component';
import { HealthIndicatorComponent } from './health-indicator.component';
import { SectionPlaceholderComponent } from './section-placeholder.component';
import { ShortDatePipe } from './short-date.pipe';

@Component({
  selector: 'app-product-detail-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    StatusPillComponent,
    HealthIndicatorComponent,
    SectionPlaceholderComponent,
    ShortDatePipe,
  ],
  template: `
    <div class="dialog">
      <!-- Hero Banner -->
      <div class="dialog__banner">
        <img
          class="dialog__banner-image"
          [src]="'https://picsum.photos/seed/' + product.id + '/800/200'"
          [alt]="product.name"
        />
        <div class="dialog__banner-overlay"></div>

        <!-- Close button on banner -->
        <button mat-icon-button class="dialog__close" (click)="dialogRef.close()">
          <mat-icon>close</mat-icon>
        </button>

        <!-- Cert badge on banner -->
        @if (product.is_certified_on_bi_platform) {
          <span class="dialog__banner-cert">
            <mat-icon class="dialog__banner-cert-icon">verified</mat-icon>
            Certified
          </span>
        }

        <!-- Title overlaid on banner bottom -->
        <div class="dialog__banner-content">
          <h2 class="dialog__title">{{ product.name }}</h2>
          <div class="dialog__owner-row">
            <span class="dialog__avatar">{{ initials() }}</span>
            <span class="dialog__owner-name">{{ product.owner }}</span>
            <span class="dialog__owner-sep">·</span>
            <span class="dialog__owner-role">Owner</span>
          </div>
        </div>
      </div>

      <!-- Badges bar -->
      <div class="dialog__badges">
        @if (!product.is_certified_on_bi_platform) {
          <span class="dialog__uncert-badge">Uncertified</span>
        }
        <app-status-pill
          [active]="product.is_published"
          [label]="product.is_published ? 'Published' : 'Draft'"
          [icon]="product.is_published ? '◉' : '◌'"
        />
        <app-health-indicator [product]="product" />
      </div>

      <mat-divider />

      <!-- Tabs -->
      <mat-tab-group class="dialog__tabs" animationDuration="200ms">
        <!-- Overview -->
        <mat-tab label="Overview">
          <div class="tab-content">
            <section class="section">
              <label class="section__label">Description</label>
              <p class="section__text">{{ product.description }}</p>
            </section>

            <section class="section">
              <label class="section__label">Lifecycle</label>
              <div class="lifecycle-grid">
                @for (entry of lifecycleEntries(); track entry.label) {
                  <div class="lifecycle-card">
                    <span class="lifecycle-card__key">{{ entry.label }}</span>
                    <span class="lifecycle-card__value">{{ entry.date | shortDate }}</span>
                    <span class="lifecycle-card__sub">{{ entry.subtitle }}</span>
                  </div>
                }
              </div>
            </section>

            <app-section-placeholder
              icon="🔐"
              title="Roles & Access"
              subtitle="Role-based access control and data stewardship assignments"
              [items]="['Owner', 'Steward', 'Consumer', 'Reviewer']"
            />
          </div>
        </mat-tab>

        <!-- Lineage -->
        <mat-tab label="Lineage">
          <div class="tab-content">
            <app-section-placeholder
              icon="🔀"
              title="Data Lineage"
              subtitle="Upstream sources and transformation pipeline"
              [items]="['Snowflake View', 'dbt Model', 'Raw Schema']"
            />
            <app-section-placeholder
              icon="🏷️"
              title="Metadata & Schema"
              subtitle="Column definitions, data types, freshness SLAs"
              [items]="['Schema', 'Quality Rules', 'SLA', 'Tags']"
            />
          </div>
        </mat-tab>

        <!-- Consumers -->
        <mat-tab label="Consumers">
          <div class="tab-content">
            <app-section-placeholder
              icon="📊"
              title="Connected BI Reports"
              subtitle="Tableau workbooks and dashboards consuming this product"
              [items]="['Workbooks', 'Dashboards', 'Sheets']"
            />
            <app-section-placeholder
              icon="👥"
              title="Consumer Teams"
              subtitle="Teams actively consuming this data product"
              [items]="['Finance', 'Marketing', 'Operations']"
            />
          </div>
        </mat-tab>

        <!-- Governance -->
        <mat-tab label="Governance">
          <div class="tab-content">
            <app-section-placeholder
              icon="✅"
              title="Certification Status"
              subtitle="Certification history, renewal schedule, compliance"
              [items]="['Renewal Date', 'Audit Log', 'Compliance']"
            />
            <app-section-placeholder
              icon="📋"
              title="Data Quality Scorecard"
              subtitle="Completeness, accuracy, and timeliness metrics"
              [items]="['Completeness', 'Accuracy', 'Timeliness']"
            />
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: `
    .dialog {
      overflow: hidden;
      display: flex;
      flex-direction: column;
      max-height: 88vh;
    }

    /* ── Banner ── */
    .dialog__banner {
      position: relative;
      height: 160px;
      flex-shrink: 0;
      overflow: hidden;
    }

    .dialog__banner-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .dialog__banner-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        180deg,
        rgba(0, 0, 0, 0.05) 0%,
        rgba(0, 0, 0, 0.55) 100%
      );
      pointer-events: none;
    }

    .dialog__close {
      position: absolute;
      top: 10px;
      right: 10px;
      --mdc-icon-button-state-layer-size: 34px;
      --mdc-icon-button-icon-size: 20px;
      color: rgba(255, 255, 255, 0.85);
      background: rgba(0, 0, 0, 0.25);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      border-radius: 8px;

      &:hover {
        background: rgba(0, 0, 0, 0.4);
      }
    }

    .dialog__banner-cert {
      position: absolute;
      top: 12px;
      left: 14px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 5px 11px 5px 7px;
      border-radius: 7px;
      font-size: 12px;
      font-weight: 650;
      color: #fff;
      background: rgba(21, 128, 61, 0.88);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .dialog__banner-cert-icon {
      font-size: 15px;
      width: 15px;
      height: 15px;
    }

    .dialog__banner-content {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 16px 24px;
    }

    .dialog__title {
      margin: 0 0 6px;
      font-size: 22px;
      font-weight: 700;
      color: #fff;
      font-family: 'Instrument Serif', Georgia, serif;
      line-height: 1.2;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }

    .dialog__owner-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
    }

    .dialog__avatar {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 9px;
      font-weight: 700;
    }

    .dialog__owner-name {
      font-weight: 560;
      color: rgba(255, 255, 255, 0.95);
    }

    .dialog__owner-sep {
      color: rgba(255, 255, 255, 0.4);
    }

    .dialog__owner-role {
      color: rgba(255, 255, 255, 0.6);
      font-weight: 400;
    }

    /* ── Badges ── */
    .dialog__badges {
      display: flex;
      gap: 8px;
      padding: 14px 24px;
      flex-wrap: wrap;
    }

    .dialog__uncert-badge {
      font-size: 11.5px;
      font-weight: 550;
      color: #a0a0b0;
      padding: 4px 10px;
      border-radius: 6px;
      background: rgba(140, 140, 155, 0.06);
      border: 1px solid rgba(140, 140, 155, 0.08);
    }

    /* ── Tabs ── */
    .dialog__tabs {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;

      --mdc-tab-indicator-active-indicator-color: #1a1a2e;
      --mat-tab-header-active-label-text-color: #1a1a2e;
      --mat-tab-header-active-focus-label-text-color: #1a1a2e;
      --mat-tab-header-inactive-label-text-color: #8c8c9b;
      --mat-tab-header-label-text-size: 13px;
      --mat-tab-header-label-text-weight: 500;

      ::ng-deep .mat-mdc-tab-body-wrapper {
        flex: 1;
        overflow: auto;
      }
    }

    .tab-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 24px 28px 32px;
    }

    .section {
      &__label {
        display: block;
        font-size: 11px;
        font-weight: 600;
        color: #8c8c9b;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        margin-bottom: 8px;
      }
      &__text {
        margin: 0;
        font-size: 14px;
        color: #3a3a52;
        line-height: 1.7;
      }
    }

    .lifecycle-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }

    .lifecycle-card {
      display: flex;
      flex-direction: column;
      padding: 12px 14px;
      border-radius: 8px;
      background: #f7f7f5;
      border: 1px solid rgba(0, 0, 0, 0.04);

      &__key {
        font-size: 10.5px;
        color: #8c8c9b;
        font-weight: 500;
        margin-bottom: 4px;
      }
      &__value {
        font-size: 14px;
        font-weight: 600;
        color: #1a1a2e;
      }
      &__sub {
        font-size: 10.5px;
        color: #a0a0b0;
        margin-top: 2px;
      }
    }

    @media (max-width: 600px) {
      .lifecycle-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `,
})
export class ProductDetailDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ProductDetailDialogComponent>);
  readonly product: Product = inject(MAT_DIALOG_DATA);
  private utilService = inject(ProductUtilService);

  initials = computed(() => this.utilService.getOwnerInitials(this.product.owner));

  lifecycleEntries = computed<LifecycleEntry[]>(() => {
    const p = this.product;
    return [
      {
        label: 'Product Created',
        date: p.product_createdAt,
        subtitle: `Age: ${this.utilService.getLifecycleAge(p.product_createdAt)}`,
      },
      {
        label: 'Last Refreshed',
        date: p.product_updatedAt,
        subtitle: `${this.utilService.daysSince(p.product_updatedAt)}d ago`,
      },
      // {
      //   label: 'Registered',
      //   date: p.createdAt,
      //   subtitle: 'Catalog entry',
      // },
      // {
      //   label: 'Catalog Updated',
      //   date: p.updatedAt,
      //   subtitle: 'Metadata sync',
      // },
    ];
  });
}