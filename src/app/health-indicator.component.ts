import { Component, input, computed, inject } from '@angular/core';
import { Product } from './product.model';
import { ProductUtilService } from './product-util.service';

@Component({
  selector: 'app-health-indicator',
  standalone: true,
  template: `
    <span
      class="health"
      [style.background]="health().bgColor"
      [style.color]="health().color"
      [style.borderColor]="health().color + '22'"
    >
      <span
        class="health__dot"
        [style.background]="health().color"
      ></span>
      {{ health().label }}
    </span>
  `,
  styles: `
    .health {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11.5px;
      font-weight: 550;
      border: 1px solid;
      transition: all 0.2s ease;

      &__dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        display: inline-block;
      }
    }
  `,
})
export class HealthIndicatorComponent {
  private utilService = inject(ProductUtilService);

  product = input.required<Product>();

  health = computed(() => this.utilService.getHealthStatus(this.product()));
}
