import { Injectable } from '@angular/core';
import { HealthStatus, Product } from './product.model';

@Injectable({ providedIn: 'root' })
export class ProductUtilService {

  getHealthStatus(product: Product): HealthStatus {
    const daysSinceUpdate = this.daysSince(product.product_updatedAt);

    if (daysSinceUpdate < 14) {
      return { label: 'Healthy', color: '#2a9d6e', bgColor: 'rgba(42,157,110,0.08)' };
    }
    if (daysSinceUpdate < 60) {
      return { label: 'Stable', color: '#b58a2b', bgColor: 'rgba(181,138,43,0.08)' };
    }
    return { label: 'Stale', color: '#c4553a', bgColor: 'rgba(196,85,58,0.08)' };
  }

  daysSince(date: Date): number {
    return Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
  }

  getLifecycleAge(date: Date): string {
    const months = Math.floor((Date.now() - new Date(date).getTime()) / (86_400_000 * 30));

    if (months < 1) return '< 1 month';
    if (months === 1) return '1 month';
    if (months < 12) return `${months} months`;

    const years = Math.floor(months / 12);
    const remainder = months % 12;
    return remainder > 0 ? `${years}y ${remainder}m` : `${years}y`;
  }

  getOwnerInitials(owner: string): string {
    return owner
      .split(' ')
      .map((n) => n[0])
      .join('');
  }
}
