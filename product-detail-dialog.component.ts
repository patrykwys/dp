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
    <div class="dialog" [class.dialog--certified]="product.is_certified_on_bi_platform">
      <!-- Pattern overlay -->
      <div class="dialog__pattern"></div>

      <!-- Header -->
      <div class="dialog__header">
        <div class="dialog__header-top">
          <div class="dialog__title-area">
            <!-- Type badge -->
            <div class="dialog__type-row">
              <mat-icon class="dialog__type-icon">
                {{ product.is_certified_on_bi_platform ? 'verified' : 'dataset' }}
              </mat-icon>
              <span class="dialog__type-label">Data Product</span>
            </div>
            <h2 class="dialog__title">{{ product.name }}</h2>
            <div class="dialog__owner">
              <span class="dialog__avatar">{{ initials() }}</span>
              <span class="dialog__owner-name">{{ product.owner }}</span>
              <span class="dialog__owner-role">· Owner</span>
            </div>
          </div>
          <button mat-icon-button class="dialog__close" (click)="dialogRef.close()">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <!-- Badges -->
        <div class="dialog__badges">
          @if (product.is_certified_on_bi_platform) {
            <span class="dialog__cert-badge">
              <mat-icon class="dialog__cert-badge-icon">workspace_premium</mat-icon>
              Certified
            </span>
          } @else {
            <span class="dialog__uncert-badge">Uncertified</span>
          }
          <app-status-pill
            [active]="product.is_published"
            [label]="product.is_published ? 'Published' : 'Draft'"
            [icon]="product.is_published ? '◉' : '◌'"
          />
          <app-health-indicator [product]="product" />
        </div>
      </div>

      <mat-divider />

      <!-- Body with Tabs -->
      <mat-tab-group
        class="dialog__tabs"
        animationDuration="200ms"
      >
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
              subtitle="Upstream sources and transformation pipeline for this data product"
              [items]="['Snowflake View', 'dbt Model', 'Raw Schema']"
            />
            <app-section-placeholder
              icon="🏷️"
              title="Metadata & Schema"
              subtitle="Column definitions, data types, freshness SLAs, and quality rules"
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
              subtitle="Tableau workbooks and dashboards consuming this data product"
              [items]="['Workbooks', 'Dashboards', 'Sheets', 'Data Sources']"
            />
            <app-section-placeholder
              icon="👥"
              title="Consumer Teams"
              subtitle="Teams and individuals actively consuming this data product"
              [items]="['Finance', 'Marketing', 'Operations', 'Executive']"
            />
          </div>
        </mat-tab>

        <!-- Governance -->
        <mat-tab label="Governance">
          <div class="tab-content">
            <app-section-placeholder
              icon="✅"
              title="Certification Status"
              subtitle="Certification history, renewal schedule, and compliance status"
              [items]="['Renewal Date', 'Audit Log', 'Compliance']"
            />
            <app-section-placeholder
              icon="📋"
              title="Data Quality Scorecard"
              subtitle="Automated quality checks, completeness, accuracy, and timeliness metrics"
              [items]="['Completeness', 'Accuracy', 'Timeliness', 'Consistency']"
            />
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: `
    /* ── Dialog Container ── */
    .dialog {
      position: relative;
      overflow: hidden;

      &--certified {
        .dialog__header {
          background: linear-gradient(168deg, rgba(42, 157, 110, 0.04) 0%, transparent 60%);
        }

        .dialog__type-icon {
          color: #2a9d6e;
        }

        .dialog__type-label {
          color: #2a9d6e;
        }

        .dialog__title {
          color: #14532d;
        }

        .dialog__avatar {
          background: linear-gradient(135deg, #15803d, #22c55e);
        }

        .dialog__pattern {
          background-image:
            linear-gradient(rgba(42, 157, 110, 0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(42, 157, 110, 0.12) 1px, transparent 1px);
        }
      }

      &__pattern {
        position: absolute;
        inset: 0;
        pointer-events: none;
        opacity: 0.02;
        background-image:
          linear-gradient(rgba(26, 26, 46, 0.2) 1px, transparent 1px),
          linear-gradient(90deg, rgba(26, 26, 46, 0.2) 1px, transparent 1px);
        background-size: 24px 24px;
        mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, transparent 40%);
        -webkit-mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, transparent 40%);
        z-index: 0;
      }
    }

    /* ── Header ── */
    .dialog__header {
      position: relative;
      z-index: 1;
      padding: 28px 32px 20px;
    }

    .dialog__header-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .dialog__title-area {
      flex: 1;
      margin-right: 16px;
    }

    .dialog__type-row {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 8px;
    }

    .dialog__type-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #8c8c9b;
    }

    .dialog__type-label {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #8c8c9b;
    }

    .dialog__title {
      margin: 0 0 10px;
      font-size: 22px;
      font-weight: 700;
      color: #1a1a2e;
      font-family: 'Instrument Serif', Georgia, serif;
      line-height: 1.25;
    }

    .dialog__owner {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #6e6e82;
    }

    .dialog__avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3a3a5c, #5a5a7e);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 9px;
      font-weight: 700;
    }

    .dialog__owner-name {
      font-weight: 560;
      color: #3a3a52;
    }

    .dialog__owner-role {
      color: #a0a0b0;
      font-weight: 400;
    }

    .dialog__close {
      --mdc-icon-button-state-layer-size: 36px;
      --mdc-icon-button-icon-size: 20px;
      color: #8c8c9b;
    }

    /* ── Badges ── */
    .dialog__badges {
      display: flex;
      gap: 8px;
      margin-top: 16px;
      flex-wrap: wrap;
    }

    .dialog__cert-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 12px 4px 8px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 620;
      color: #15803d;
      background: rgba(42, 157, 110, 0.1);
      border: 1px solid rgba(42, 157, 110, 0.15);
    }

    .dialog__cert-badge-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #2a9d6e;
    }

    .dialog__uncert-badge {
      font-size: 12px;
      font-weight: 550;
      color: #a0a0b0;
      padding: 4px 12px;
      border-radius: 6px;
      background: rgba(140, 140, 155, 0.06);
      border: 1px solid rgba(140, 140, 155, 0.08);
    }

    /* ── Tabs ── */
    .dialog__tabs {
      position: relative;
      z-index: 1;

      --mdc-tab-indicator-active-indicator-color: #1a1a2e;
      --mat-tab-header-active-label-text-color: #1a1a2e;
      --mat-tab-header-active-focus-label-text-color: #1a1a2e;
      --mat-tab-header-inactive-label-text-color: #8c8c9b;
      --mat-tab-header-label-text-size: 13px;
      --mat-tab-header-label-text-weight: 500;
    }

    .tab-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 24px 32px 32px;
    }

    /* ── Sections ── */
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

    /* ── Lifecycle Grid ── */
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
      {
        label: 'Registered',
        date: p.createdAt,
        subtitle: 'Catalog entry',
      },
      {
        label: 'Catalog Updated',
        date: p.updatedAt,
        subtitle: 'Metadata sync',
      },
    ];
  });
}