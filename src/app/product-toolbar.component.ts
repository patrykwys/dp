import { Component, input, output, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSelectModule } from '@angular/material/select';
import { FilterStatus, SortBy, ViewMode } from './product.model';

@Component({
  selector: 'app-product-toolbar',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonToggleModule,
    MatSelectModule,
  ],
  template: `
    <div class="toolbar">
      <div class="toolbar__left">
        <!-- Search -->
        <mat-form-field class="toolbar__search" appearance="outline" subscriptSizing="dynamic">
          <mat-icon matPrefix>search</mat-icon>
          <input
            matInput
            placeholder="Search products, owners..."
            [ngModel]="searchQuery()"
            (ngModelChange)="searchQueryChange.emit($event)"
          />
        </mat-form-field>

        <!-- Filter chips -->
        <mat-button-toggle-group
          class="toolbar__filters"
          [value]="filterStatus()"
          (change)="filterStatusChange.emit($event.value)"
        >
          <mat-button-toggle value="all">All</mat-button-toggle>
          <mat-button-toggle value="certified">Certified</mat-button-toggle>
          <mat-button-toggle value="published">Published</mat-button-toggle>
          <mat-button-toggle value="draft">Drafts</mat-button-toggle>
        </mat-button-toggle-group>
      </div>

      <div class="toolbar__right">
        <!-- Sort -->
        <mat-form-field class="toolbar__sort" appearance="outline" subscriptSizing="dynamic">
          <mat-select
            [value]="sortBy()"
            (selectionChange)="sortByChange.emit($event.value)"
          >
            <mat-option value="name">Sort: Name</mat-option>
            <mat-option value="updated">Sort: Last Updated</mat-option>
            <mat-option value="owner">Sort: Owner</mat-option>
          </mat-select>
        </mat-form-field>

        <!-- View toggle -->
        <mat-button-toggle-group
          class="toolbar__view-toggle"
          [value]="viewMode()"
          (change)="viewModeChange.emit($event.value)"
        >
          <mat-button-toggle value="grid">
            <mat-icon>grid_view</mat-icon>
          </mat-button-toggle>
          <mat-button-toggle value="table">
            <mat-icon>view_list</mat-icon>
          </mat-button-toggle>
        </mat-button-toggle-group>
      </div>
    </div>
  `,
  styles: `
    .toolbar {
      padding: 18px 36px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;

      &__left,
      &__right {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      &__left {
        flex: 1;
      }

      &__search {
        flex: 1;
        max-width: 360px;

        --mdc-outlined-text-field-outline-color: rgba(0, 0, 0, 0.08);
        --mdc-outlined-text-field-focus-outline-color: #1a1a2e;
        --mdc-outlined-text-field-container-shape: 8px;
        --mat-form-field-container-height: 40px;
        --mat-form-field-container-vertical-padding: 8px;

        mat-icon {
          color: #9090a0;
          font-size: 20px;
          margin-right: 4px;
        }
      }

      &__sort {
        width: 180px;

        --mdc-outlined-text-field-outline-color: rgba(0, 0, 0, 0.08);
        --mdc-outlined-text-field-focus-outline-color: #1a1a2e;
        --mdc-outlined-text-field-container-shape: 8px;
        --mat-form-field-container-height: 40px;
        --mat-form-field-container-vertical-padding: 8px;
      }

      &__filters {
        --mat-standard-button-toggle-height: 38px;
        --mat-standard-button-toggle-shape: 7px;
        --mat-standard-button-toggle-selected-state-background-color: #1a1a2e;
        --mat-standard-button-toggle-selected-state-text-color: #fff;
        --mat-standard-button-toggle-text-color: #5a5a6e;
        --mat-standard-button-toggle-divider-color: rgba(0, 0, 0, 0.06);

        border: 1.5px solid rgba(0, 0, 0, 0.08);
        border-radius: 8px;
        overflow: hidden;

        .mat-button-toggle {
          font-size: 12.5px;
          font-weight: 550;
        }
      }

      &__view-toggle {
        --mat-standard-button-toggle-height: 38px;
        --mat-standard-button-toggle-shape: 7px;
        --mat-standard-button-toggle-selected-state-background-color: #1a1a2e;
        --mat-standard-button-toggle-selected-state-text-color: #fff;
        --mat-standard-button-toggle-text-color: #8c8c9b;
        --mat-standard-button-toggle-divider-color: rgba(0, 0, 0, 0.06);

        border: 1.5px solid rgba(0, 0, 0, 0.08);
        border-radius: 8px;
        overflow: hidden;

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }
    }
  `,
})
export class ProductToolbarComponent {
  searchQuery = input.required<string>();
  filterStatus = input.required<FilterStatus>();
  sortBy = input.required<SortBy>();
  viewMode = input.required<ViewMode>();

  searchQueryChange = output<string>();
  filterStatusChange = output<FilterStatus>();
  sortByChange = output<SortBy>();
  viewModeChange = output<ViewMode>();
}
