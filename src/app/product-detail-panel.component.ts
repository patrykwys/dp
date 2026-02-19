import { Component, input, output, inject, computed, signal } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Product, LifecycleEntry } from './product.model';
import { ProductUtilService } from './product-util.service';
import { StatusPillComponent } from './status-pill.component';
import { HealthIndicatorComponent } from './health-indicator.component';
import { SectionPlaceholderComponent } from './section-placeholder.component';
import { ShortDatePipe } from './short-date.pipe';

@Component({
  selector: 'app-product-detail-panel',
  standalone: true,
  imports: [
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    StatusPillComponent,
    HealthIndicatorComponent,
    SectionPlaceholderComponent,
    ShortDatePipe,
  ],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('250ms cubic-bezier(0.16, 1, 0.3, 1)', style({ transform: 'translateX(0)', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 })),
      ]),
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('150ms ease', style({ opacity: 0 })),
      ]),
    ]),
  ],
  template: `
    <!-- Backdrop -->
    <div class="backdrop" (click)="closed.emit()" @fadeIn></div>

    <!-- Panel -->
    <aside class="panel" @slideIn>
      <!-- Header -->
      <header class="panel__header">
        <div class="panel__title-row">
          <div class="panel__title-block">
            <h2 class="panel__title">{{ product().name }}</h2>
            <div class="panel__owner">
              <span class="avatar avatar--md">{{ initials() }}</span>
              <span class="panel__owner-name">{{ product().owner }}</span>
            </div>
          </div>
          <button mat-icon-button class="panel__close" (click)="closed.emit()">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <!-- Status badges -->
        <div class="panel__badges">
          <app-status-pill
            [active]="product().is_certified_on_bi_platform"
            [label]="product().is_certified_on_bi_platform ? 'Certified' : 'Uncertified'"
            [icon]="product().is_certified_on_bi_platform ? '✓' : '○'"
          />
          <app-status-pill
            [active]="product().is_published"
            [label]="product().is_published ? 'Published' : 'Draft'"
            [icon]="product().is_published ? '◉' : '◌'"
          />
          <app-health-indicator [product]="product()" />
        </div>

        <!-- Tabs -->
        <mat-tab-group
          class="panel__tabs"
          [(selectedIndex)]="activeTabIndex"
          animationDuration="200ms"
        >
          <!-- Overview Tab -->
          <mat-tab label="Overview">
            <div class="tab-content">
              <!-- Description -->
              <section class="section">
                <label class="section__label">Description</label>
                <p class="section__text">{{ product().description }}</p>
              </section>

              <!-- Lifecycle Grid -->
              <section class="section">
                <label class="section__label">Lifecycle</label>
                <div class="lifecycle-grid">
                  @for (entry of lifecycleEntries(); track entry.label) {
                    <div class="lifecycle-card">
                      <span class="lifecycle-card__label">{{ entry.label }}</span>
                      <span class="lifecycle-card__date">{{ entry.date | shortDate }}</span>
                      <span class="lifecycle-card__sub">{{ entry.subtitle }}</span>
                    </div>
                  }
                </div>
              </section>

              <!-- Future: Roles & Access -->
              <app-section-placeholder
                icon="🔐"
                title="Roles & Access"
                subtitle="Role-based access control and data stewardship assignments"
                [items]="['Owner', 'Steward', 'Consumer', 'Reviewer']"
              />
            </div>
          </mat-tab>

          <!-- Lineage Tab -->
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

          <!-- Consumers Tab -->
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

          <!-- Governance Tab -->
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
      </header>
    </aside>
  `,
  styles: `
    /* ---------- Backdrop ---------- */
    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.15);
      z-index: 999;
    }

    /* ---------- Panel ---------- */
    .panel {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 520px;
      max-width: 90vw;
      background: #fafafa;
      box-shadow: -8px 0 40px rgba(0, 0, 0, 0.08);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      border-left: 1px solid rgba(0, 0, 0, 0.06);
      overflow: hidden;

      &__header {
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow: hidden;
      }

      &__title-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 24px 28px 0;
      }

      &__title-block {
        flex: 1;
        margin-right: 16px;
      }

      &__title {
        margin: 0;
        font-size: 20px;
        font-weight: 700;
        color: #1a1a2e;
        font-family: 'Instrument Serif', Georgia, serif;
        line-height: 1.3;
      }

      &__owner {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-top: 6px;
        font-size: 13px;
        color: #6e6e82;
      }

      &__owner-name {
        font-weight: 450;
      }

      &__close {
        --mdc-icon-button-state-layer-size: 32px;
        --mdc-icon-button-icon-size: 20px;
        color: #666;
      }

      &__badges {
        display: flex;
        gap: 6px;
        padding: 16px 28px 0;
        flex-wrap: wrap;
      }

      &__tabs {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        margin-top: 16px;

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

      &--md {
        width: 22px;
        height: 22px;
        font-size: 10px;
      }
    }

    /* ---------- Tab Content ---------- */
    .tab-content {
      display: flex;
      flex-direction: column;
      gap: 18px;
      padding: 20px 28px 28px;
    }

    /* ---------- Section ---------- */
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
        font-size: 13.5px;
        color: #3a3a52;
        line-height: 1.65;
      }
    }

    /* ---------- Lifecycle Grid ---------- */
    .lifecycle-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .lifecycle-card {
      display: flex;
      flex-direction: column;
      padding: 12px 14px;
      border-radius: 8px;
      background: #fff;
      border: 1px solid rgba(0, 0, 0, 0.05);

      &__label {
        font-size: 11px;
        color: #8c8c9b;
        font-weight: 500;
        margin-bottom: 4px;
      }

      &__date {
        font-size: 14px;
        font-weight: 600;
        color: #1a1a2e;
      }

      &__sub {
        font-size: 11px;
        color: #a0a0b0;
        margin-top: 2px;
      }
    }
  `,
})
export class ProductDetailPanelComponent {
  private utilService = inject(ProductUtilService);

  product = input.required<Product>();
  closed = output<void>();

  activeTabIndex = 0;

  initials = computed(() => this.utilService.getOwnerInitials(this.product().owner));

  lifecycleEntries = computed<LifecycleEntry[]>(() => {
    const p = this.product();
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
