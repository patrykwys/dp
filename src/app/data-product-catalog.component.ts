import { Component, inject, signal, computed } from '@angular/core';
import { ProductDataService } from './product-data.service';
import { ProductUtilService } from './product-util.service';
import { Product, ViewMode } from './product.model';
import { StatsStripComponent, CatalogStats } from './stats-strip.component';
import { ProductCardComponent } from './product-card.component';
import { ProductTableComponent } from './product-table.component';
import { ProductExpansionListComponent } from './product-expansion-list.component';
import { ProductDetailPanelComponent } from './product-detail-panel.component';
import { ShortDatePipe } from './short-date.pipe';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-data-product-catalog',
  standalone: true,
  imports: [
    StatsStripComponent,
    ProductCardComponent,
    ProductTableComponent,
    ProductExpansionListComponent,
    ProductDetailPanelComponent,
    ShortDatePipe,
    MatButtonToggleModule,
    MatIconModule,
    MatTooltipModule,
  ],
  template: `
    <!-- Top Bar -->
    <header class="top-bar">
      <div class="top-bar__left">
        <div class="top-bar__logo">D</div>
        <div class="top-bar__text">
          <h1 class="top-bar__title">Data Product Catalog</h1>
          <p class="top-bar__subtitle">Governed data assets · Enterprise BI Platform</p>
        </div>
      </div>
      <div class="top-bar__right">
        <span class="top-bar__sync">Last sync: {{ today | shortDate }}</span>

        <!-- 3-way View Toggle -->
        <mat-button-toggle-group
          class="view-toggle"
          [value]="viewMode()"
          (change)="viewMode.set($event.value)"
        >
          <mat-button-toggle value="grid" matTooltip="Cards">
            <mat-icon>grid_view</mat-icon>
          </mat-button-toggle>
          <mat-button-toggle value="expansion" matTooltip="Expandable List">
            <mat-icon>expand_circle_down</mat-icon>
          </mat-button-toggle>
          <mat-button-toggle value="table" matTooltip="Table">
            <mat-icon>view_list</mat-icon>
          </mat-button-toggle>
        </mat-button-toggle-group>
      </div>
    </header>

    <!-- Stats -->
    <app-stats-strip [stats]="stats()" />

    <!-- Content -->
    <div class="content">

      <!-- ─── Grid View ─── -->
      @if (viewMode() === 'grid') {
        @if (certifiedProducts().length) {
          <section class="product-section">
            <div class="section-header">
              <div class="section-header__accent"></div>
              <span class="section-header__label">Certified</span>
              <span class="section-header__count">{{ certifiedProducts().length }}</span>
            </div>
            <div class="card-grid">
              @for (product of certifiedProducts(); track product.id) {
                <app-product-card
                  [product]="product"
                  (selected)="selectedProduct.set($event)"
                />
              }
            </div>
          </section>
        }
        @if (uncertifiedProducts().length) {
          <section class="product-section product-section--uncertified">
            <div class="section-header">
              <span class="section-header__label section-header__label--muted">Uncertified</span>
              <span class="section-header__count section-header__count--muted">{{ uncertifiedProducts().length }}</span>
            </div>
            <div class="card-grid">
              @for (product of uncertifiedProducts(); track product.id) {
                <app-product-card
                  [product]="product"
                  (selected)="selectedProduct.set($event)"
                />
              }
            </div>
          </section>
        }
      }

      <!-- ─── Expansion Panel View ─── -->
      @if (viewMode() === 'expansion') {
        @if (certifiedProducts().length) {
          <section class="product-section">
            <div class="section-header">
              <div class="section-header__accent"></div>
              <span class="section-header__label">Certified</span>
              <span class="section-header__count">{{ certifiedProducts().length }}</span>
            </div>
            <app-product-expansion-list
              [products]="certifiedProducts()"
              (openDetail)="selectedProduct.set($event)"
            />
          </section>
        }
        @if (uncertifiedProducts().length) {
          <section class="product-section product-section--uncertified">
            <div class="section-header">
              <span class="section-header__label section-header__label--muted">Uncertified</span>
              <span class="section-header__count section-header__count--muted">{{ uncertifiedProducts().length }}</span>
            </div>
            <app-product-expansion-list
              [products]="uncertifiedProducts()"
              (openDetail)="selectedProduct.set($event)"
            />
          </section>
        }
      }

      <!-- ─── Table View ─── -->
      @if (viewMode() === 'table') {
        <app-product-table
          [products]="sortedProducts()"
          (rowClicked)="selectedProduct.set($event)"
        />
      }
    </div>

    <!-- Detail Panel -->
    @if (selectedProduct(); as product) {
      <app-product-detail-panel
        [product]="product"
        (closed)="selectedProduct.set(null)"
      />
    }
  `,
  styles: `
    :host {
      display: block;
      min-height: 100vh;
      background: #f3f2ef;
      font-family: 'DM Sans', sans-serif;
    }

    /* ---------- Top Bar ---------- */
    .top-bar {
      background: #1a1a2e;
      padding: 20px 36px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      &__left {
        display: flex;
        align-items: center;
        gap: 14px;
      }

      &__logo {
        width: 34px;
        height: 34px;
        border-radius: 8px;
        background: linear-gradient(135deg, #c9a94e, #a07c2e);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        font-weight: 700;
        color: #1a1a2e;
      }

      &__title {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
        color: #ffffff;
        font-family: 'Instrument Serif', Georgia, serif;
        letter-spacing: 0.01em;
      }

      &__subtitle {
        margin: 0;
        font-size: 11.5px;
        color: rgba(255, 255, 255, 0.45);
        font-weight: 400;
      }

      &__right {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      &__sync {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.4);
      }
    }

    .view-toggle {
      --mat-standard-button-toggle-height: 34px;
      --mat-standard-button-toggle-shape: 7px;
      --mat-standard-button-toggle-selected-state-background-color: rgba(255, 255, 255, 0.15);
      --mat-standard-button-toggle-selected-state-text-color: #fff;
      --mat-standard-button-toggle-text-color: rgba(255, 255, 255, 0.35);
      --mat-standard-button-toggle-background-color: transparent;
      --mat-standard-button-toggle-divider-color: rgba(255, 255, 255, 0.1);

      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 8px;
      overflow: hidden;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }

    /* ---------- Content ---------- */
    .content {
      padding: 24px 36px 36px;
    }

    /* ---------- Section Grouping ---------- */
    .product-section {
      margin-bottom: 32px;

      &--uncertified {
        opacity: 0.85;
      }
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;

      &__accent {
        width: 4px;
        height: 18px;
        border-radius: 2px;
        background: linear-gradient(180deg, #c9a94e, #a07c2e);
      }

      &__label {
        font-size: 14px;
        font-weight: 650;
        color: #1a1a2e;
        letter-spacing: 0.01em;

        &--muted {
          color: #8c8c9b;
          font-weight: 550;
        }
      }

      &__count {
        font-size: 12px;
        font-weight: 600;
        color: #c9a94e;
        background: rgba(201, 169, 78, 0.1);
        padding: 2px 8px;
        border-radius: 10px;

        &--muted {
          color: #8c8c9b;
          background: rgba(140, 140, 155, 0.08);
        }
      }
    }

    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 14px;
    }
  `,
})
export class DataProductCatalogComponent {
  private dataService = inject(ProductDataService);
  private utilService = inject(ProductUtilService);

  readonly today = new Date();

  // ── State Signals ──
  readonly viewMode = signal<ViewMode>('grid');
  readonly selectedProduct = signal<Product | null>(null);

  // ── Computed: Stats ──
  readonly stats = computed<CatalogStats>(() => {
    const products = this.dataService.products();
    return {
      total: products.length,
      certified: products.filter((p) => p.is_certified_on_bi_platform).length,
      published: products.filter((p) => p.is_published).length,
      healthy: products.filter((p) => this.utilService.getHealthStatus(p).label === 'Healthy').length,
    };
  });

  // ── Computed: Grouped Products ──
  readonly certifiedProducts = computed(() =>
    this.dataService
      .products()
      .filter((p) => p.is_certified_on_bi_platform)
      .sort((a, b) => a.name.localeCompare(b.name))
  );

  readonly uncertifiedProducts = computed(() =>
    this.dataService
      .products()
      .filter((p) => !p.is_certified_on_bi_platform)
      .sort((a, b) => a.name.localeCompare(b.name))
  );

  // ── Computed: For table view (certified first, then uncertified) ──
  readonly sortedProducts = computed(() => [
    ...this.certifiedProducts(),
    ...this.uncertifiedProducts(),
  ]);
}