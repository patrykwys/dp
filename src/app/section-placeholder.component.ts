import { Component, input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-section-placeholder',
  standalone: true,
  imports: [MatChipsModule],
  template: `
    <div class="placeholder">
      <div class="placeholder__header">
        <span class="placeholder__icon">{{ icon() }}</span>
        <span class="placeholder__title">{{ title() }}</span>
      </div>
      <p class="placeholder__subtitle">{{ subtitle() }}</p>
      @if (items().length) {
        <mat-chip-set class="placeholder__chips">
          @for (item of items(); track item) {
            <mat-chip class="placeholder__chip" disabled>{{ item }}</mat-chip>
          }
        </mat-chip-set>
      }
    </div>
  `,
  styles: `
    .placeholder {
      padding: 18px 20px;
      border-radius: 10px;
      border: 1.5px dashed rgba(140, 140, 155, 0.2);
      background: rgba(140, 140, 155, 0.02);

      &__header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;
      }

      &__icon {
        font-size: 16px;
        opacity: 0.5;
      }

      &__title {
        font-size: 13px;
        font-weight: 600;
        color: #5a5a6e;
        letter-spacing: 0.01em;
      }

      &__subtitle {
        margin: 0;
        font-size: 12px;
        color: #9090a0;
        line-height: 1.5;
      }

      &__chips {
        margin-top: 10px;
      }

      &__chip {
        --mdc-chip-label-text-size: 11px;
        --mdc-chip-label-text-color: #8888a0;
        --mdc-chip-elevated-container-color: rgba(140, 140, 155, 0.07);
      }
    }
  `,
})
export class SectionPlaceholderComponent {
  icon = input<string>('');
  title = input.required<string>();
  subtitle = input<string>('');
  items = input<string[]>([]);
}
