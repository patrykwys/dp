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
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { ProductBadgeComponent } from './product-badge.component';
@Component({
  selector: 'app-product-detail-panel',
  standalone: true,
  imports: [
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    ProductBadgeComponent,
    HealthIndicatorComponent,
    SectionPlaceholderComponent,
    ShortDatePipe,
  ],
  template: `
    <!-- Backdrop -->
    <div class="backdrop" (click)="closed.emit()"></div>

    <!-- Panel -->
    <aside class="panel">
      <!-- Hero -->
      <header class="panel__hero">
        <div class="panel__image-wrapper">
          <img
            class="panel__image"
            [src]="'https://picsum.photos/seed/' + product().id + '/400/180'"
            [alt]="product().name"
          />
          @if (product().is_certified_on_bi_platform) {
            <app-product-badge
              class="panel__image-banner badge-image-banner"
              variant="certified"
              mode="overlay"
            />
          } @else {
            <app-product-badge
              class="panel__image-banner badge-image-banner"
              variant="uncertified"
              mode="overlay"
            />
          }
        </div>
        <div class="panel__title-area">
          <h2 class="panel__title" [matTooltip]="product().name" matTooltipShowDelay="400">{{ product().name }}</h2>
          <div class="panel__owner-row">
            <span class="panel__avatar">{{ initials() }}</span>
            <span class="panel__owner-name">{{ product().owner }}</span>
            <span class="panel__owner-sep">·</span>
            <span class="panel__owner-role">Owner</span>
          </div>
        </div>
        <button mat-icon-button class="panel__close" (click)="closed.emit()">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <!-- Status Row -->
      <div class="panel__status-row">
        <app-product-badge
          [variant]="product().is_published ? 'published' : 'draft'"
          mode="inline"
        />
        <!-- <app-health-indicator [product]="product()" /> -->
        @if (product().has_extracts) {
          <app-product-badge variant="extract" mode="inline" />
        }
      </div>

      <!-- Tabs -->
      <mat-tab-group class="panel__tabs" animationDuration="200ms">

        <!-- ═══════ OVERVIEW TAB ═══════ -->
        <mat-tab label="Overview">
          <div class="tab-content">

            <!-- Description -->
            <section class="section">
              <label class="section__label">Description</label>
              <p class="section__text">{{ product().description }}</p>
            </section>

            <!-- Key Metrics Row -->
            <div class="metrics-row">
              <div class="metric-card metric-card--accent">
                <mat-icon class="metric-card__icon">link</mat-icon>
                <span class="metric-card__value">{{ product().connected_count }}</span>
                <span class="metric-card__label">Connected</span>
              </div>
              <div class="metric-card">
                <mat-icon class="metric-card__icon">storage</mat-icon>
                <span class="metric-card__value">{{ product().size }}</span>
                <span class="metric-card__label">Size</span>
              </div>
              <div class="metric-card">
                <mat-icon class="metric-card__icon">schedule</mat-icon>
                <span class="metric-card__value">{{ daysSinceUpdate() }}d</span>
                <span class="metric-card__label">Since Update</span>
              </div>
            </div>

            <!-- Source -->
            <section class="section">
              <label class="section__label">Source</label>
              <div class="source-card">
                <div class="source-card__header">
                  <mat-icon class="source-card__db-icon">database</mat-icon>
                  <span class="source-card__name">{{ product().sourceDisplayName }}</span>
                </div>
                <a
                  class="source-card__link"
                  [href]="product().content_url"
                  target="_blank"
                  rel="noopener"
                  (click)="$event.stopPropagation()"
                >
                  <mat-icon class="source-card__link-icon">open_in_new</mat-icon>
                  <span class="source-card__link-text">{{ product().content_url }}</span>
                </a>
              </div>
            </section>

            <!-- Certification Status — dual track -->
            <section class="section">
              <label class="section__label">Certification</label>
              <div class="cert-grid">
                <div
                  class="cert-track"
                  [class.cert-track--passed]="product().is_certified_on_source"
                >
                  <div class="cert-track__icon-wrapper">
                    <mat-icon class="cert-track__icon">
                      {{ product().is_certified_on_source ? 'check_circle' : 'cancel' }}
                    </mat-icon>
                  </div>
                  <span class="cert-track__title">Source</span>
                  <span class="cert-track__status">
                    {{ product().is_certified_on_source ? 'Certified' : 'Not Certified' }}
                  </span>
                </div>
                <div
                  class="cert-track"
                  [class.cert-track--passed]="product().is_certified_on_bi_platform"
                >
                  <div class="cert-track__icon-wrapper">
                    <mat-icon class="cert-track__icon">
                      {{ product().is_certified_on_bi_platform ? 'check_circle' : 'cancel' }}
                    </mat-icon>
                  </div>
                  <span class="cert-track__title">BI Platform</span>
                  <span class="cert-track__status">
                    {{ product().is_certified_on_bi_platform ? 'Certified' : 'Not Certified' }}
                  </span>
                </div>
              </div>
            </section>

            <!-- Lifecycle (improved) -->
            <section class="section">
              <label class="section__label">Lifecycle</label>
              <div class="lifecycle">
                <!-- Created -->
                <div class="lifecycle__node">
                  <div class="lifecycle__marker lifecycle__marker--start">
                    <mat-icon class="lifecycle__marker-icon">rocket_launch</mat-icon>
                  </div>
                  <div class="lifecycle__rail"></div>
                </div>
                <div class="lifecycle__detail">
                  <span class="lifecycle__event">Created</span>
                  <span class="lifecycle__date">{{ product().product_createdAt | shortDate }}</span>
                  <span class="lifecycle__age">{{ lifecycleAge() }} ago</span>
                </div>

                <!-- Updated -->
                <div class="lifecycle__node">
                  <div class="lifecycle__marker lifecycle__marker--end">
                    <mat-icon class="lifecycle__marker-icon">sync</mat-icon>
                  </div>
                </div>
                <div class="lifecycle__detail">
                  <span class="lifecycle__event">Last Updated</span>
                  <span class="lifecycle__date">{{ product().product_updatedAt | shortDate }}</span>
                  <span class="lifecycle__age">{{ daysSinceUpdate() }}d ago</span>
                </div>
              </div>
            </section>

            <!-- Future -->
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
              icon="🔀" title="Data Lineage"
              subtitle="Upstream sources and transformation pipeline"
              [items]="['Snowflake View', 'dbt Model', 'Raw Schema']"
            />
            <app-section-placeholder
              icon="🏷️" title="Metadata & Schema"
              subtitle="Column definitions, data types, freshness SLAs"
              [items]="['Schema', 'Quality Rules', 'SLA', 'Tags']"
            />
          </div>
        </mat-tab>

        <!-- Consumers -->
        <mat-tab label="Consumers">
          <div class="tab-content">
            <app-section-placeholder
              icon="📊" title="Connected BI Reports"
              subtitle="Tableau workbooks and dashboards consuming this product"
              [items]="['Workbooks', 'Dashboards', 'Sheets']"
            />
            <app-section-placeholder
              icon="👥" title="Consumer Teams"
              subtitle="Teams actively consuming this data product"
              [items]="['Finance', 'Marketing', 'Operations']"
            />
          </div>
        </mat-tab>

        <!-- Governance -->
        <mat-tab label="Governance">
          <div class="tab-content">
            <app-section-placeholder
              icon="✅" title="Certification Status"
              subtitle="Certification history, renewal schedule, compliance"
              [items]="['Renewal Date', 'Audit Log', 'Compliance']"
            />
            <app-section-placeholder
              icon="📋" title="Data Quality Scorecard"
              subtitle="Completeness, accuracy, and timeliness metrics"
              [items]="['Completeness', 'Accuracy', 'Timeliness']"
            />
          </div>
        </mat-tab>
      </mat-tab-group>
    </aside>
  `,
  styles: `
    /* ── Keyframes ── */
    @keyframes backdrop-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes panel-slide-in {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    /* ── Backdrop ── */
    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.15);
      z-index: 999;
      animation: backdrop-fade-in 0.2s ease both;
    }

    /* ── Panel Shell ── */
    .panel {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 540px;
      max-width: 92vw;
      background: #fafafa;
      box-shadow: -8px 0 40px rgba(0, 0, 0, 0.08);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      border-left: 1px solid rgba(0, 0, 0, 0.06);
      overflow: hidden;
      animation: panel-slide-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    /* ── Hero ── */
    .panel__hero {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 24px 24px 14px;
      flex-shrink: 0;
      max-height: 160px;
      overflow: hidden;
    }

    .panel__image-wrapper {
      position: relative;
      width: 180px;
      height: 120px;
      border-radius: 10px;
      overflow: hidden;
      flex-shrink: 0;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
      border: 1px solid rgba(0, 0, 0, 0.06);
    }

    .panel__image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    /* Image banner positioning */
    .panel__image-banner {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
    }

    .panel__title-area {
      flex: 1;
      min-width: 0;
      padding-top: 2px;
      overflow: hidden;
    }

    .panel__title {
      margin: 0 0 8px;
      font-size: 19px;
      font-weight: 700;
      color: #1a1a2e;
      font-family: 'Instrument Serif', Georgia, serif;
      line-height: 1.25;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      overflow-wrap: break-word;
      word-break: break-word;
    }

    .panel__owner-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
    }

    .panel__avatar {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3a3a5c, #5a5a7e);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 9px;
      font-weight: 700;
    }

    .panel__owner-name {
      font-weight: 560;
      color: #3a3a52;
    }

    .panel__owner-sep {
      color: #c0c0cc;
    }

    .panel__owner-role {
      color: #a0a0b0;
      font-weight: 400;
    }

    .panel__close {
      --mdc-icon-button-state-layer-size: 32px;
      --mdc-icon-button-icon-size: 20px;
      color: #8c8c9b;
      flex-shrink: 0;
    }

    /* ── Status Row ── */
    .panel__status-row {
      display: flex;
      gap: 8px;
      padding: 0 24px 14px;
      flex-wrap: wrap;
      align-items: center;
    }

    /* ── Tabs ── */
    .panel__tabs {
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
      padding: 20px 24px 28px;
    }

    /* ── Section ── */
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

    /* ═══════════════════════════════════════
       KEY METRICS ROW
       ═══════════════════════════════════════ */
    .metrics-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }

    .metric-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      padding: 14px 10px;
      border-radius: 10px;
      background: #fff;
      border: 1px solid rgba(0, 0, 0, 0.05);
      transition: border-color 0.15s ease;

      &:hover {
        border-color: rgba(0, 0, 0, 0.1);
      }

      &--accent {
        background: linear-gradient(168deg, #f0f9f4, #fff);
        border-color: rgba(42, 157, 110, 0.12);

        .metric-card__icon {
          color: #2a9d6e;
        }

        .metric-card__value {
          color: #15803d;
        }
      }

      &__icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: #a0a0b0;
        margin-bottom: 2px;
      }

      &__value {
        font-size: 18px;
        font-weight: 700;
        color: #1a1a2e;
        font-family: 'Instrument Serif', Georgia, serif;
        line-height: 1.2;
      }

      &__label {
        font-size: 10.5px;
        font-weight: 550;
        color: #8c8c9b;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
    }

    /* ═══════════════════════════════════════
       SOURCE CARD
       ═══════════════════════════════════════ */
    .source-card {
      padding: 14px 16px;
      border-radius: 10px;
      background: #fff;
      border: 1px solid rgba(0, 0, 0, 0.06);
    }

    .source-card__header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .source-card__db-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #6366f1;
    }

    .source-card__name {
      font-size: 13px;
      font-weight: 620;
      color: #1a1a2e;
      font-family: 'SF Mono', 'Fira Code', monospace;
      letter-spacing: -0.02em;
    }

    .source-card__link {
      display: flex;
      align-items: center;
      gap: 5px;
      text-decoration: none;
      color: #6e6e82;
      transition: color 0.15s ease;

      &:hover {
        color: #3a6abf;
      }
    }

    .source-card__link-icon {
      font-size: 13px;
      width: 13px;
      height: 13px;
      color: #b0b0c0;
    }

    .source-card__link-text {
      font-size: 11.5px;
      font-weight: 450;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* ═══════════════════════════════════════
       CERTIFICATION DUAL TRACK
       ═══════════════════════════════════════ */
    .cert-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .cert-track {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 16px 12px;
      border-radius: 10px;
      background: #fff;
      border: 1px solid rgba(0, 0, 0, 0.05);
      text-align: center;

      &--passed {
        background: linear-gradient(168deg, #f0f9f4, #fafffe);
        border-color: rgba(42, 157, 110, 0.15);

        .cert-track__icon-wrapper {
          background: rgba(42, 157, 110, 0.1);
        }

        .cert-track__icon {
          color: #2a9d6e;
        }

        .cert-track__status {
          color: #15803d;
        }
      }

      &__icon-wrapper {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: rgba(196, 85, 58, 0.08);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      &__icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: #c4553a;
      }

      &__title {
        font-size: 12px;
        font-weight: 650;
        color: #1a1a2e;
        letter-spacing: 0.01em;
      }

      &__status {
        font-size: 11px;
        font-weight: 550;
        color: #a0a0b0;
      }
    }

    /* ═══════════════════════════════════════
       LIFECYCLE — Vertical timeline
       ═══════════════════════════════════════ */
    .lifecycle {
      display: grid;
      grid-template-columns: 48px 1fr;
      gap: 0 14px;
    }

    .lifecycle__node {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .lifecycle__marker {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      position: relative;
      z-index: 1;

      &--start {
        background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
        border: 2px solid rgba(42, 157, 110, 0.25);
      }

      &--end {
        background: linear-gradient(135deg, #e3f2fd, #bbdefb);
        border: 2px solid rgba(58, 106, 191, 0.25);
      }
    }

    .lifecycle__marker-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;

      .lifecycle__marker--start & {
        color: #2a9d6e;
      }

      .lifecycle__marker--end & {
        color: #3a6abf;
      }
    }

    .lifecycle__rail {
      width: 2px;
      flex: 1;
      min-height: 20px;
      background: linear-gradient(180deg, rgba(42, 157, 110, 0.2), rgba(58, 106, 191, 0.2));
      border-radius: 1px;
    }

    .lifecycle__detail {
      display: flex;
      flex-direction: column;
      padding: 6px 0 22px;
    }

    .lifecycle__event {
      font-size: 13.5px;
      font-weight: 640;
      color: #1a1a2e;
      line-height: 1.2;
      margin-bottom: 2px;
    }

    .lifecycle__date {
      font-size: 13px;
      font-weight: 500;
      color: #3a3a52;
    }

    .lifecycle__age {
      font-size: 11.5px;
      color: #8c8c9b;
      font-weight: 450;
      margin-top: 2px;
    }
  `,
})
export class ProductDetailPanelComponent {
  private utilService = inject(ProductUtilService);

  product = input.required<Product>();
  closed = output<void>();

  initials = computed(() => this.utilService.getOwnerInitials(this.product().owner));

  daysSinceUpdate = computed(() =>
    this.utilService.daysSince(this.product().product_updatedAt)
  );

  lifecycleAge = computed(() =>
    this.utilService.getLifecycleAge(this.product().product_createdAt)
  );
}