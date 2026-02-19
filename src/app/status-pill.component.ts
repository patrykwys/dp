import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-status-pill',
  standalone: true,
  template: `
    <span
      class="status-pill"
      [class.active]="active()"
    >
      <span class="status-pill__icon">{{ icon() }}</span>
      {{ label() }}
    </span>
  `,
  styles: `
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11.5px;
      font-weight: 550;
      letter-spacing: 0.02em;
      background: rgba(140, 140, 155, 0.08);
      color: #8c8c9b;
      border: 1px solid rgba(140, 140, 155, 0.12);
      transition: all 0.2s ease;

      &.active {
        background: rgba(42, 157, 110, 0.08);
        color: #2a9d6e;
        border-color: rgba(42, 157, 110, 0.15);
      }

      &__icon {
        font-size: 13px;
        line-height: 1;
      }
    }
  `,
})
export class StatusPillComponent {
  active = input.required<boolean>();
  label = input.required<string>();
  icon = input<string>('');
}
