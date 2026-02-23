import { Component, input, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export type BadgeVariant =
  | 'certified'
  | 'uncertified'
  | 'published'
  | 'draft'
  | 'extract';

export type BadgeMode = 'overlay' | 'inline';

interface BadgeConfig {
  icon: string;
  label: string;
  useMatIcon: boolean;
}

const BADGE_CONFIGS: Record<BadgeVariant, BadgeConfig> = {
  certified: { icon: 'verified', label: 'Certified', useMatIcon: true },
  uncertified: { icon: 'gpp_maybe', label: 'Uncertified', useMatIcon: true },
  published: { icon: 'circle', label: 'Published', useMatIcon: true },
  draft: { icon: 'edit_note', label: 'Draft', useMatIcon: true },
  extract: { icon: 'downloading', label: 'Extract', useMatIcon: true },
};

@Component({
  selector: 'app-product-badge',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <span
      class="badge"
      [class.badge--certified]="variant() === 'certified'"
      [class.badge--uncertified]="variant() === 'uncertified'"
      [class.badge--published]="variant() === 'published'"
      [class.badge--draft]="variant() === 'draft'"
      [class.badge--extract]="variant() === 'extract'"
      [class.badge--overlay]="mode() === 'overlay'"
      [class.badge--inline]="mode() === 'inline'"
    >
      <mat-icon class="badge__icon">{{ config().icon }}</mat-icon>
      <span class="badge__label">{{ config().label }}</span>
    </span>
  `,
  styles: `
    /* ═══════════════════════════════════════
       BASE
       ═══════════════════════════════════════ */
    .badge {
      display: inline-flex;
      align-items: center;
      font-weight: 650;
      letter-spacing: 0.02em;
      white-space: nowrap;
    }

    .badge__icon {
      line-height: 1;
    }

    .badge__label {
      line-height: 1;
    }

    /* ═══════════════════════════════════════
       MODE: OVERLAY (on images)
       ═══════════════════════════════════════ */
    .badge--overlay {
      gap: 4px;
      padding: 5px 10px 5px 7px;
      border-radius: 7px;
      font-size: 11.5px;
      color: #fff;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

      .badge__icon {
        font-size: 15px;
        width: 15px;
        height: 15px;
      }
    }

    /* ═══════════════════════════════════════
       MODE: INLINE (status rows)
       ═══════════════════════════════════════ */
    .badge--inline {
      gap: 4px;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11.5px;
      font-weight: 550;
      transition: all 0.15s ease;

      .badge__icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }
    }

    /* ═══════════════════════════════════════
       VARIANT: CERTIFIED
       ═══════════════════════════════════════ */
    .badge--certified.badge--overlay {
      background: rgba(21, 128, 61, 0.88);
    }

    .badge--certified.badge--inline {
      color: #15803d;
      background: rgba(42, 157, 110, 0.08);
      border: 1px solid rgba(42, 157, 110, 0.15);

      .badge__icon {
        color: #2a9d6e;
      }
    }

    /* ═══════════════════════════════════════
       VARIANT: UNCERTIFIED
       ═══════════════════════════════════════ */
    .badge--uncertified.badge--overlay {
      background: rgba(80, 80, 100, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .badge--uncertified.badge--inline {
      color: #8c8c9b;
      background: rgba(140, 140, 155, 0.06);
      border: 1px solid rgba(140, 140, 155, 0.08);
    }

    /* ═══════════════════════════════════════
       VARIANT: PUBLISHED
       ═══════════════════════════════════════ */
    .badge--published.badge--inline {
      color: #2a9d6e;
      background: rgba(42, 157, 110, 0.08);
      border: 1px solid rgba(42, 157, 110, 0.15);

      .badge__icon {
        font-size: 8px;
        width: 8px;
        height: 8px;
      }
    }

    .badge--published.badge--overlay {
      background: rgba(42, 157, 110, 0.85);
    }

    /* ═══════════════════════════════════════
       VARIANT: DRAFT
       ═══════════════════════════════════════ */
    .badge--draft.badge--overlay {
      background: rgba(181, 138, 43, 0.85);
    }

    .badge--draft.badge--inline {
      color: #b58a2b;
      background: rgba(181, 138, 43, 0.08);
      border: 1px solid rgba(181, 138, 43, 0.12);

      .badge__icon {
        color: #b58a2b;
      }
    }

    /* ═══════════════════════════════════════
       VARIANT: EXTRACT
       ═══════════════════════════════════════ */
    .badge--extract.badge--inline {
      color: #6366f1;
      background: rgba(99, 102, 241, 0.08);
      border: 1px solid rgba(99, 102, 241, 0.12);

      .badge__icon {
        color: #6366f1;
      }
    }

    .badge--extract.badge--overlay {
      background: rgba(99, 102, 241, 0.85);
    }

    /* ═══════════════════════════════════════
       SPECIAL: IMAGE BANNER (bottom strip)
       ═══════════════════════════════════════ */
    :host(.badge-image-banner) {
      display: flex;
      width: 100%;

      .badge {
        width: 100%;
        justify-content: center;
        border-radius: 0;
        border: none;
        box-shadow: none;
        padding: 4px 0;
        font-size: 10.5px;
        text-transform: uppercase;
        letter-spacing: 0.03em;

        .badge__icon {
          font-size: 13px;
          width: 13px;
          height: 13px;
        }
      }
    }
  `,
})
export class ProductBadgeComponent {
  variant = input.required<BadgeVariant>();
  mode = input<BadgeMode>('inline');

  config = computed<BadgeConfig>(() => BADGE_CONFIGS[this.variant()]);
}