import { Component, input, output, inject } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { Product } from './product.model';
import { ProductUtilService } from './product-util.service';
import { StatusPillComponent } from './status-pill.component';
import { HealthIndicatorComponent } from './health-indicator.component';
import { ShortDatePipe } from './short-date.pipe';

@Component({
  selector: 'app-product-table',
  standalone: true,
  imports: [
    MatTableModule,
    MatSortModule,
    StatusPillComponent,
    HealthIndicatorComponent,
    ShortDatePipe,
  ],
  template: `
    <div class="table-wrapper">
      <table mat-table [dataSource]="products()" matSort class="product-table">

        <!-- Name Column -->
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
          <td mat-cell *matCellDef="let product">
            <div class="table-name">
              @if (product.is_certified_on_bi_platform) {
                <span class="table-name__cert-dot"></span>
              }
              <span class="table-name__text">{{ product.name }}</span>
            </div>
          </td>
        </ng-container>

        <!-- Owner Column -->
        <ng-container matColumnDef="owner">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Owner</th>
          <td mat-cell *matCellDef="let product">
            <div class="table-owner">
              <span class="table-owner__avatar">
                {{ getInitials(product.owner) }}
              </span>
              {{ product.owner }}
            </div>
          </td>
        </ng-container>

        <!-- Status Column -->
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Status</th>
          <td mat-cell *matCellDef="let product">
            <div class="table-status">
              <app-status-pill
                [active]="product.is_certified_on_bi_platform"
                [label]="product.is_certified_on_bi_platform ? 'Cert' : '—'"
                [icon]="product.is_certified_on_bi_platform ? '✓' : ''"
              />
              <app-status-pill
                [active]="product.is_published"
                [label]="product.is_published ? 'Live' : 'Draft'"
                [icon]="product.is_published ? '◉' : '◌'"
              />
            </div>
          </td>
        </ng-container>

        <!-- Health Column -->
        <ng-container matColumnDef="health">
          <th mat-header-cell *matHeaderCellDef>Health</th>
          <td mat-cell *matCellDef="let product">
            <app-health-indicator [product]="product" />
          </td>
        </ng-container>

        <!-- Last Updated Column -->
        <ng-container matColumnDef="updatedAt">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Last Updated</th>
          <td mat-cell *matCellDef="let product" class="table-date">
            {{ product.product_updatedAt | shortDate }}
          </td>
        </ng-container>

        <!-- Age Column -->
        <ng-container matColumnDef="age">
          <th mat-header-cell *matHeaderCellDef>Age</th>
          <td mat-cell *matCellDef="let product" class="table-age">
            {{ getAge(product.product_createdAt) }}
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr
          mat-row
          *matRowDef="let row; columns: displayedColumns"
          class="table-row--clickable"
          (click)="rowClicked.emit(row)"
        ></tr>
      </table>
    </div>
  `,
  styles: `
    .table-wrapper {
      background: #fff;
      border-radius: 12px;
      border: 1px solid rgba(0, 0, 0, 0.06);
      overflow: hidden;
    }

    .product-table {
      width: 100%;

      --mat-table-header-headline-size: 11px;
      --mat-table-header-headline-weight: 600;
      --mat-table-header-headline-color: #8c8c9b;
      --mat-table-row-item-label-text-size: 13px;
      --mat-table-row-item-label-text-color: #3a3a52;

      th.mat-mdc-header-cell {
        letter-spacing: 0.06em;
        text-transform: uppercase;
        padding: 13px 18px;
        border-bottom: 1.5px solid rgba(0, 0, 0, 0.06);
      }

      td.mat-mdc-cell {
        padding: 14px 18px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.04);
      }
    }

    .table-row--clickable {
      cursor: pointer;
      transition: background 0.1s ease;

      &:hover {
        background: rgba(0, 0, 0, 0.015);
      }
    }

    .table-name {
      display: flex;
      align-items: center;
      gap: 8px;

      &__cert-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #c9a94e;
        flex-shrink: 0;
      }

      &__text {
        font-weight: 600;
        color: #1a1a2e;
      }
    }

    .table-owner {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #6e6e82;

      &__avatar {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: linear-gradient(135deg, #3a3a5c, #5a5a7e);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 8px;
        font-weight: 700;
      }
    }

    .table-status {
      display: flex;
      gap: 4px;
    }

    .table-date {
      color: #6e6e82;
    }

    .table-age {
      color: #8c8c9b;
    }
  `,
})
export class ProductTableComponent {
  private utilService = inject(ProductUtilService);

  products = input.required<Product[]>();
  rowClicked = output<Product>();

  displayedColumns = ['name', 'owner', 'status', 'health', 'updatedAt', 'age'];

  getInitials(owner: string): string {
    return this.utilService.getOwnerInitials(owner);
  }

  getAge(date: Date): string {
    return this.utilService.getLifecycleAge(date);
  }
}
