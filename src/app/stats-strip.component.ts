import { Component, input } from '@angular/core';

export interface CatalogStats {
  total: number;
  certified: number;
  published: number;
  healthy: number;
}

@Component({
  selector: 'app-stats-strip',
  standalone: true,
  template: `
    <div class="stats-strip">
      <div class="stat">
        <span class="stat__value stat__value--dark">{{ stats().total }}</span>
        <span class="stat__label">Total Products</span>
      </div>
      <div class="stat">
        <span class="stat__value stat__value--green">
          {{ stats().certified }}/{{ stats().total }}
        </span>
        <span class="stat__label">Certified</span>
      </div>
      <div class="stat">
        <span class="stat__value stat__value--blue">{{ stats().published }}</span>
        <span class="stat__label">Published</span>
      </div>
      <div class="stat">
        <span class="stat__value stat__value--green">{{ stats().healthy }}</span>
        <span class="stat__label">Healthy</span>
      </div>
    </div>
  `,
  styles: `
    .stats-strip {
      display: flex;
      gap: 36px;
      padding: 16px 36px;
      background: #fff;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    }

    .stat {
      display: flex;
      align-items: baseline;
      gap: 8px;

      &__value {
        font-size: 22px;
        font-weight: 700;
        font-family: 'Instrument Serif', Georgia, serif;

        &--dark  { color: #1a1a2e; }
        &--green { color: #2a9d6e; }
        &--blue  { color: #3a6abf; }
      }

      &__label {
        font-size: 12px;
        color: #8c8c9b;
        font-weight: 500;
      }
    }
  `,
})
export class StatsStripComponent {
  stats = input.required<CatalogStats>();
}
