import { Component, input, output, inject, computed, signal } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Product } from './product.model';
import { ProductUtilService } from './product-util.service';
import { ProductBadgeComponent } from './product-badge.component';
import { HealthIndicatorComponent } from './health-indicator.component';
import { SectionPlaceholderComponent } from './section-placeholder.component';
import { ShortDatePipe } from './short-date.pipe';
import { CertificationPanelComponent } from './certification-panel.component';

@Component({
  selector: 'app-product-detail-panel',
  standalone: true,
  host: {
    '(document:keydown.escape)': 'closed.emit()',
  },
  imports: [
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    ProductBadgeComponent,
    HealthIndicatorComponent,
    SectionPlaceholderComponent,
    CertificationPanelComponent,
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
            <span class="panel__owner-name" [matTooltip]="product().owner" matTooltipShowDelay="300">{{ product().owner }}</span>
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
        <app-health-indicator [product]="product()" />
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
                  [class.cert-track-passed]="product().is_certified_on_source"
                  [class.cert-track-failed]="!product().is_certified_on_source"
                >
                  <div
                    class="cert-track__icon-wrapper"
                    [class.cert-track__icon-wrapper--green]="product().is_certified_on_source"
                    [class.cert-track__icon-wrapper--red]="!product().is_certified_on_source"
                  >
                    <mat-icon
                      class="cert-track__icon"
                      [class.cert-track__icon--green]="product().is_certified_on_source"
                      [class.cert-track__icon--red]="!product().is_certified_on_source"
                    >
                      {{ product().is_certified_on_source ? 'check_circle' : 'cancel' }}
                    </mat-icon>
                  </div>
                  <span class="cert-track__title">Source</span>
                  <span
                    class="cert-track__status"
                    [class.cert-track__status--green]="product().is_certified_on_source"
                    [class.cert-track__status--red]="!product().is_certified_on_source"
                  >
                    {{ product().is_certified_on_source ? 'Certified' : 'Not Certified' }}
                  </span>
                </div>
                <div
                  class="cert-track"
                  [class.cert-track-passed]="product().is_certified_on_bi_platform"
                  [class.cert-track-failed]="!product().is_certified_on_bi_platform"
                >
                  <div
                    class="cert-track__icon-wrapper"
                    [class.cert-track__icon-wrapper--green]="product().is_certified_on_bi_platform"
                    [class.cert-track__icon-wrapper--red]="!product().is_certified_on_bi_platform"
                  >
                    <mat-icon
                      class="cert-track__icon"
                      [class.cert-track__icon--green]="product().is_certified_on_bi_platform"
                      [class.cert-track__icon--red]="!product().is_certified_on_bi_platform"
                    >
                      {{ product().is_certified_on_bi_platform ? 'check_circle' : 'cancel' }}
                    </mat-icon>
                  </div>
                  <span class="cert-track__title">BI Platform</span>
                  <span
                    class="cert-track__status"
                    [class.cert-track__status--green]="product().is_certified_on_bi_platform"
                    [class.cert-track__status--red]="!product().is_certified_on_bi_platform"
                  >
                    {{ product().is_certified_on_bi_platform ? 'Certified' : 'Not Certified' }}
                  </span>
                </div>
              </div>
            </section>
 
            <!-- Lifecycle -->
            <section class="section">
              <label class="section__label">Lifecycle</label>
              <div class="lifecycle">
                <div class="lifecycle__item">
                  <mat-icon class="lifecycle__icon">calendar_today</mat-icon>
                  <div class="lifecycle__detail">
                    <span class="lifecycle__label">Created</span>
                    <span class="lifecycle__date">{{ product().product_createdAt | shortDate }}</span>
                    <span class="lifecycle__age">{{ lifecycleAge() }} ago</span>
                  </div>
                </div>
                <div class="lifecycle__divider"></div>
                <div class="lifecycle__item">
                  <mat-icon class="lifecycle__icon">update</mat-icon>
                  <div class="lifecycle__detail">
                    <span class="lifecycle__label">Last Updated</span>
                    <span class="lifecycle__date">{{ product().product_updatedAt | shortDate }}</span>
                    <span class="lifecycle__age">{{ daysSinceUpdate() }}d ago</span>
                  </div>
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
 
            <!-- Flow visualization -->
            <div class="flow">
              <!-- Source label -->
              <div class="flow__label">
                <mat-icon class="flow__label-icon">cloud_upload</mat-icon>
                <span class="flow__label-text">{{ product().connections.length }} upstream {{ product().connections.length === 1 ? 'source' : 'sources' }}</span>
              </div>
 
              <!-- Source nodes -->
              <div class="flow__sources">
                @for (conn of product().connections; track conn.id; let i = $index) {
                  <div class="flow__node" [class.flow__node--expanded]="expandedConn() === conn.id" (click)="toggleConn(conn.id)">
                    <div class="flow__node-bar" [style.background]="getConnColor(conn.type)"></div>
                    <div class="flow__node-body">
                      <div class="flow__node-header">
                        <span class="flow__node-type" [style.color]="getConnColor(conn.type)">{{ conn.type }}</span>
                        <span class="flow__node-db">{{ conn.dbName }}</span>
                        <mat-icon class="flow__node-chevron">{{ expandedConn() === conn.id ? 'expand_less' : 'expand_more' }}</mat-icon>
                      </div>
                      @if (expandedConn() === conn.id) {
                        <div class="flow__node-detail">
                          <div class="flow__node-row">
                            <mat-icon class="flow__node-row-icon">dns</mat-icon>
                            <span class="flow__node-row-text">{{ conn.serverName }}</span>
                          </div>
                          <div class="flow__node-dates">
                            <span class="flow__node-date">
                              <mat-icon class="flow__node-date-icon">calendar_today</mat-icon>
                              {{ conn.createdAt | shortDate }}
                            </span>
                            <span class="flow__node-date">
                              <mat-icon class="flow__node-date-icon">update</mat-icon>
                              {{ conn.updatedAt | shortDate }}
                            </span>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
 
              @if (product().connections.length === 0) {
                <div class="flow__empty">
                  <mat-icon class="flow__empty-icon">link_off</mat-icon>
                  <span class="flow__empty-text">No connections found</span>
                </div>
              }
 
              <!-- Converge arrow -->
              @if (product().connections.length > 0) {
                <div class="flow__pipe">
                  <div class="flow__pipe-line"></div>
                  <mat-icon class="flow__pipe-arrow">arrow_downward</mat-icon>
                  <div class="flow__pipe-line"></div>
                </div>
 
                <!-- Destination node -->
                <div class="flow__destination">
                  <mat-icon class="flow__destination-icon">hub</mat-icon>
                  <div class="flow__destination-info">
                    <span class="flow__destination-name">{{ product().name }}</span>
                    <span class="flow__destination-sub">This product</span>
                  </div>
                </div>
              }
            </div>
 
            <!-- Future placeholder -->
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
            <app-certification-panel />
 
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
      min-width: 22px;
      min-height: 22px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3a3a5c, #5a5a7e);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 9px;
      font-weight: 700;
      flex-shrink: 0;
    }
 
    .panel__owner-name {
      font-weight: 560;
      color: #3a3a52;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 260px;
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
    }
 
    .cert-track-passed {
      background: linear-gradient(168deg, #f0f9f4, #fafffe);
      border-color: rgba(42, 157, 110, 0.15);
    }
 
    .cert-track-failed {
      background: linear-gradient(168deg, #fef7f6, #fff);
      border-color: rgba(196, 85, 58, 0.1);
    }
 
    .cert-track__icon-wrapper {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
 
    .cert-track__icon-wrapper--green {
      background: rgba(42, 157, 110, 0.1);
    }
 
    .cert-track__icon-wrapper--red {
      background: rgba(196, 85, 58, 0.08);
    }
 
    .cert-track__icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
 
    .cert-track__icon--green {
      color: #2a9d6e;
    }
 
    .cert-track__icon--red {
      color: #c4553a;
    }
 
    .cert-track__title {
      font-size: 12px;
      font-weight: 650;
      color: #1a1a2e;
      letter-spacing: 0.01em;
    }
 
    .cert-track__status {
      font-size: 11px;
      font-weight: 550;
    }
 
    .cert-track__status--green {
      color: #15803d;
    }
 
    .cert-track__status--red {
      color: #c4553a;
    }
 
    /* ═══════════════════════════════════════
       LIFECYCLE — Horizontal
       ═══════════════════════════════════════ */
    .lifecycle {
      display: flex;
      align-items: stretch;
      gap: 0;
      background: #fff;
      border-radius: 10px;
      border: 1px solid rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }
 
    .lifecycle__item {
      flex: 1;
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 14px 16px;
    }
 
    .lifecycle__divider {
      width: 1px;
      background: rgba(0, 0, 0, 0.06);
      flex-shrink: 0;
    }
 
    .lifecycle__icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #b0b0c0;
      flex-shrink: 0;
      margin-top: 1px;
    }
 
    .lifecycle__detail {
      display: flex;
      flex-direction: column;
    }
 
    .lifecycle__label {
      font-size: 10.5px;
      font-weight: 600;
      color: #8c8c9b;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 3px;
    }
 
    .lifecycle__date {
      font-size: 13.5px;
      font-weight: 620;
      color: #1a1a2e;
      line-height: 1.3;
    }
 
    .lifecycle__age {
      font-size: 11.5px;
      color: #8c8c9b;
      font-weight: 450;
      margin-top: 2px;
    }
 
    /* ═══════════════════════════════════════
       FLOW / PIPELINE
       ═══════════════════════════════════════ */
    .flow {
      display: flex;
      flex-direction: column;
      gap: 0;
    }
 
    .flow__label {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 12px;
    }
 
    .flow__label-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #8c8c9b;
    }
 
    .flow__label-text {
      font-size: 11.5px;
      font-weight: 600;
      color: #8c8c9b;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
 
    /* Source nodes container */
    .flow__sources {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
 
    /* Individual node */
    .flow__node {
      display: flex;
      border-radius: 9px;
      background: #fff;
      border: 1px solid rgba(0, 0, 0, 0.05);
      overflow: hidden;
      cursor: pointer;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
 
    .flow__node:hover {
      border-color: rgba(0, 0, 0, 0.1);
    }
 
    .flow__node--expanded {
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
    }
 
    .flow__node-bar {
      width: 4px;
      flex-shrink: 0;
    }
 
    .flow__node-body {
      flex: 1;
      min-width: 0;
      padding: 11px 14px;
    }
 
    .flow__node-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }
 
    .flow__node-type {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.02em;
      flex-shrink: 0;
    }
 
    .flow__node-db {
      flex: 1;
      font-size: 13px;
      font-weight: 600;
      color: #1a1a2e;
      font-family: 'SF Mono', 'Fira Code', monospace;
      letter-spacing: -0.02em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
 
    .flow__node-chevron {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #c0c0cc;
      flex-shrink: 0;
      transition: color 0.15s ease;
    }
 
    .flow__node:hover .flow__node-chevron {
      color: #8c8c9b;
    }
 
    /* Expanded detail */
    .flow__node-detail {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding-top: 10px;
      margin-top: 10px;
      border-top: 1px solid rgba(0, 0, 0, 0.04);
    }
 
    .flow__node-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }
 
    .flow__node-row-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
      color: #b0b0c0;
      flex-shrink: 0;
    }
 
    .flow__node-row-text {
      font-size: 12px;
      color: #6e6e82;
      font-weight: 450;
      overflow-wrap: break-word;
      word-break: break-all;
    }
 
    .flow__node-dates {
      display: flex;
      gap: 16px;
    }
 
    .flow__node-date {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11.5px;
      color: #8c8c9b;
      font-weight: 450;
    }
 
    .flow__node-date-icon {
      font-size: 13px;
      width: 13px;
      height: 13px;
      color: #c0c0cc;
    }
 
    /* Pipe / converge */
    .flow__pipe {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 4px 0;
    }
 
    .flow__pipe-line {
      width: 2px;
      height: 12px;
      background: rgba(0, 0, 0, 0.08);
    }
 
    .flow__pipe-arrow {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #b0b0c0;
    }
 
    /* Destination */
    .flow__destination {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      border-radius: 10px;
      background: linear-gradient(135deg, #1a1a2e, #2a2a48);
      color: #fff;
    }
 
    .flow__destination-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
      color: rgba(255, 255, 255, 0.7);
      flex-shrink: 0;
    }
 
    .flow__destination-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
 
    .flow__destination-name {
      font-size: 13.5px;
      font-weight: 650;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
 
    .flow__destination-sub {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.5);
      font-weight: 450;
    }
 
    /* Empty state */
    .flow__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 32px 16px;
      color: #b0b0c0;
    }
 
    .flow__empty-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }
 
    .flow__empty-text {
      font-size: 13px;
      font-weight: 500;
    }
  `,
})
export class ProductDetailPanelComponent {
  private utilService = inject(ProductUtilService);
 
  product = input.required<Product>();
  closed = output<void>();
 
  expandedConn = signal<string | null>(null);
 
  initials = computed(() => this.utilService.getOwnerInitials(this.product().owner));
 
  daysSinceUpdate = computed(() =>
    this.utilService.daysSince(this.product().product_updatedAt)
  );
 
  lifecycleAge = computed(() =>
    this.utilService.getLifecycleAge(this.product().product_createdAt)
  );
 
  toggleConn(id: string): void {
    this.expandedConn.update(current => current === id ? null : id);
  }
 
  private readonly connColors: Record<string, string> = {
    Snowflake: '#29b5e8',
    PostgreSQL: '#336791',
    BigQuery: '#4285f4',
    Redshift: '#e05d44',
    MySQL: '#f29111',
    'SQL Server': '#cc2927',
    Oracle: '#f80000',
    ClickHouse: '#d4a017',
    Kafka: '#6e6e82',
    S3: '#e25d34',
  };
 
  getConnColor(type: string): string {
    return this.connColors[type] ?? '#6366f1';
  }
}
 