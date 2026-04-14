import { Component, signal, computed, linkedSignal, Signal, WritableSignal } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';






export type TaxTag = {
  id: number;
  name: string;
  definition: string;
  level: number;
  parent_id: number;
};
 
export type TaxAssetTagging = {
  asset_type: string;
  assetId: string;
  taxTagId: number;
};
 
interface Selections {
  l1: number | null;
  l2: number | null;
  l3: number | null;
  l4: number | null;
}
 
const MOCK_TAGS: TaxTag[] = [
  { id: 1, name: 'Client Organizations', definition: 'Client org data', level: 1, parent_id: 0 },
  { id: 2, name: 'Market Data', definition: 'Market data assets', level: 1, parent_id: 0 },
  { id: 3, name: 'Regulatory & Compliance', definition: 'Regulatory data', level: 1, parent_id: 0 },
 
  { id: 10, name: 'Client Intelligence & Analytics', definition: 'Client analytics', level: 2, parent_id: 1 },
  { id: 11, name: 'Client Onboarding', definition: 'Onboarding data', level: 2, parent_id: 1 },
  { id: 12, name: 'Equity Research', definition: 'Equity research data', level: 2, parent_id: 2 },
  { id: 13, name: 'Fixed Income Analytics', definition: 'FI analytics', level: 2, parent_id: 2 },
  { id: 14, name: 'Trade Surveillance', definition: 'Surveillance data', level: 2, parent_id: 3 },
 
  { id: 100, name: 'Client Profitability / Lifetime Value', definition: 'CLV metrics', level: 3, parent_id: 10 },
  { id: 101, name: 'Client Segmentation Models', definition: 'Segmentation', level: 3, parent_id: 10 },
  { id: 102, name: 'KYC Document Classification', definition: 'KYC docs', level: 3, parent_id: 11 },
  { id: 103, name: 'Sector Performance Tracking', definition: 'Sector perf', level: 3, parent_id: 12 },
  { id: 104, name: 'Yield Curve Analytics', definition: 'Yield curves', level: 3, parent_id: 13 },
  { id: 105, name: 'Anomaly Detection Rules', definition: 'Anomaly rules', level: 3, parent_id: 14 },
 
  { id: 1000, name: 'Revenue Attribution by Client', definition: 'Rev attribution', level: 4, parent_id: 100 },
  { id: 1001, name: 'Churn Probability Scoring', definition: 'Churn scoring', level: 4, parent_id: 100 },
  { id: 1002, name: 'Behavioral Clustering', definition: 'Clustering', level: 4, parent_id: 101 },
  { id: 1003, name: 'Document Verification Status', definition: 'Doc verification', level: 4, parent_id: 102 },
  { id: 1004, name: 'Relative Value Signals', definition: 'RV signals', level: 4, parent_id: 103 },
  { id: 1005, name: 'Spread Duration Models', definition: 'Spread models', level: 4, parent_id: 104 },
  { id: 1006, name: 'Pattern Match Rulesets', definition: 'Pattern rules', level: 4, parent_id: 105 },
];
 
@Component({
  selector: 'app-taxonomy-tags-panel',
  standalone: true,
  imports: [MatSelectModule, MatFormFieldModule, MatIconModule, MatButtonModule],
  template: `
    <div class="tp">
 
      <!-- Info banner -->
      <div class="tp__info">
        <mat-icon class="tp__info-icon">sell</mat-icon>
        <div class="tp__info-body">
          <span class="tp__info-title">Classify this BI Asset with Enterprise Data Taxonomy Tags</span>
          <span class="tp__info-desc">
            Select approved tags from the Enterprise Data Taxonomy to classify your BI Asset.
            The Enterprise Data Taxonomy is a consolidated view of data assets in a hierarchical structure based on subject areas.
          </span>
        </div>
      </div>
 
      <!-- Dropdowns row -->
      <div class="tp__selectors">
        <div class="tp__col">
          <label class="tp__label">Level 1</label>
          <mat-form-field appearance="outline" class="tp__field">
            <mat-select
              [value]="selections().l1"
              (selectionChange)="selectLevel(1, $event.value)"
              placeholder="— Select —"
            >
              @for (tag of level1Options(); track tag.id) {
                <mat-option [value]="tag.id">{{ tag.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>
 
        <div class="tp__col">
          <label class="tp__label">Level 2</label>
          <mat-form-field appearance="outline" class="tp__field">
            <mat-select
              [value]="selections().l2"
              (selectionChange)="selectLevel(2, $event.value)"
              placeholder="— Select —"
              [disabled]="!selections().l1"
            >
              @for (tag of level2Options(); track tag.id) {
                <mat-option [value]="tag.id">{{ tag.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>
 
        <div class="tp__col">
          <label class="tp__label">Level 3</label>
          <mat-form-field appearance="outline" class="tp__field">
            <mat-select
              [value]="selections().l3"
              (selectionChange)="selectLevel(3, $event.value)"
              placeholder="— Select —"
              [disabled]="!selections().l2"
            >
              @for (tag of level3Options(); track tag.id) {
                <mat-option [value]="tag.id">{{ tag.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>
 
        <div class="tp__col">
          <label class="tp__label">Level 4</label>
          <mat-form-field appearance="outline" class="tp__field">
            <mat-select
              [value]="selections().l4"
              (selectionChange)="selectLevel(4, $event.value)"
              placeholder="— Select —"
              [disabled]="!selections().l3"
            >
              @for (tag of level4Options(); track tag.id) {
                <mat-option [value]="tag.id">{{ tag.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>
      </div>
 
      <!-- Add button -->
      <button
        mat-flat-button
        class="tp__add-btn"
        [disabled]="!canAdd()"
        (click)="addTag()"
      >
        + Add Tags
      </button>
 
      <!-- Applied tags -->
      @if (appliedTags().length > 0) {
        <div class="tp__applied">
          <label class="tp__applied-title">Applied Tags</label>
 
          <div class="tp__applied-list">
            @for (group of appliedTags(); track group.id) {
              <div class="tp__tag-group">
                <div class="tp__tag-pills">
                  @for (anc of group.ancestors; track anc.id) {
                    <div class="tag-chip-item" [style.margin-left.px]="(anc.level - 1) * 24">
                      <span class="tag-chip-level">L{{ anc.level }}</span>
                      <span class="tag-chip-name">{{ anc.name }}</span>
                    </div>
                  }
                </div>
                <button
                  mat-icon-button
                  class="tp__tag-delete"
                  (click)="removeTag(group.id)"
                >
                  <mat-icon class="tp__tag-delete-icon">delete_outline</mat-icon>
                </button>
              </div>
            }
          </div>
        </div>
      }
 
      <!-- Save button -->
      @if (appliedTags().length > 0) {
        <div class="tp__actions">
          <button mat-flat-button class="tp__save-btn">Save Tags</button>
        </div>
      }
    </div>
  `,
  styles: `
    .tp {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
 
    /* ── Info ── */
    .tp__info {
      display: flex;
      gap: 12px;
      padding: 14px 16px;
      border-radius: 8px;
      background: #fff;
      border: 1px solid rgba(0, 0, 0, 0.06);
    }
 
    .tp__info-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #8c8c9b;
      flex-shrink: 0;
      margin-top: 2px;
    }
 
    .tp__info-body {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
 
    .tp__info-title {
      font-size: 13px;
      font-weight: 650;
      color: #1a1a2e;
    }
 
    .tp__info-desc {
      font-size: 12px;
      color: #6e6e82;
    }
 
    /* ── Selectors ── */
    .tp__selectors {
      display: flex;
      gap: 8px;
    }
 
    .tp__col {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }
 
    .tp__label {
      font-size: 11px;
      font-weight: 650;
      color: #8c8c9b;
      text-transform: uppercase;
    }
 
    .tp__field {
      width: 100%;
      --mdc-outlined-text-field-container-shape: 6px;
      --mdc-outlined-text-field-outline-color: rgba(0, 0, 0, 0.1);
      --mdc-outlined-text-field-hover-outline-color: rgba(0, 0, 0, 0.2);
      --mdc-outlined-text-field-focus-outline-color: #15803d;
      --mat-select-trigger-text-size: 12px;
    }
 
    /* ── Add button ── */
    .tp__add-btn {
      align-self: flex-start;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 650;
      --mdc-filled-button-container-color: #15803d;
      --mdc-filled-button-label-text-color: #fff;
      --mdc-filled-button-disabled-container-color: rgba(0, 0, 0, 0.06);
      --mdc-filled-button-disabled-label-text-color: #b0b0c0;
    }
 
    /* ── Applied tags ── */
    .tp__applied {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 16px;
      border-radius: 8px;
      background: #fff;
      border: 1px solid rgba(0, 0, 0, 0.06);
    }
 
    .tp__applied-title {
      font-size: 11px;
      font-weight: 650;
      color: #8c8c9b;
      text-transform: uppercase;
    }
 
    .tp__applied-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
 
    .tp__tag-group {
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }
 
    .tp__tag-pills {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 0;
    }
 
    /* ── Tag chip (provided styling) ── */
    .tag-chip-item {
      display: inline-flex;
      align-items: center;
      background: #e8f5e9;
      border: 1px solid #a5d6a7;
      padding: 4px 12px 4px 8px;
      font-size: 12px;
      font-weight: 500;
      color: #155724;
      gap: 6px;
      max-width: 340px;
      border-radius: 20px;
      box-shadow: 0 1px 3px rgba(30, 126, 52, 0.10);
      transition: box-shadow 0.15s;
    }
 
    .tag-chip-item:hover {
      box-shadow: 0 2px 6px rgba(30, 126, 52, 0.18);
    }
 
    .tag-chip-level {
      font-size: 10px;
      color: #ffffff;
      background: #1e7e34;
      padding: 1px 8px;
      border-radius: 10px;
      flex-shrink: 0;
      font-weight: 700;
    }
 
    .tag-chip-name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
 
    /* ── Delete ── */
    .tp__tag-delete {
      --mdc-icon-button-state-layer-size: 32px;
      --mdc-icon-button-icon-size: 18px;
      color: #8c8c9b;
      flex-shrink: 0;
      align-self: center;
    }
 
    .tp__tag-delete-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
 
    /* ── Save button ── */
    .tp__actions {
      display: flex;
      justify-content: flex-end;
    }
 
    .tp__save-btn {
      border-radius: 8px;
      font-size: 13px;
      font-weight: 650;
      --mdc-filled-button-container-color: #15803d;
      --mdc-filled-button-label-text-color: #fff;
    }
  `,
})
export class TaxonomyTagsPanelComponent {
 
  private readonly allTags = signal<TaxTag[]>(MOCK_TAGS);
 
  private readonly tagMap = computed(() =>
    new Map(this.allTags().map(tag => [tag.id, tag]))
  );
 
  readonly selections = signal<Selections>({ l1: null, l2: null, l3: null, l4: null });
  readonly appliedTagIds = signal<number[]>([]);
 
  readonly level1Options = computed(() =>
    this.allTags().filter(t => t.level === 1)
  );
 
  readonly level2Options = this.childrenOf('l1', 2);
  readonly level3Options = this.childrenOf('l2', 3);
  readonly level4Options = this.childrenOf('l3', 4);
 
  readonly deepestSelected = computed<TaxTag | null>(() => {
    const { l4, l3 } = this.selections();
    const id = l4 ?? l3;
    return id != null ? this.tagMap().get(id) ?? null : null;
  });
 
  readonly canAdd = computed(() => {
    const tag = this.deepestSelected();
    return tag != null && !this.appliedTagIds().includes(tag.id);
  });
 
  readonly appliedTags = computed(() =>
    this.appliedTagIds().map(id => ({
      id,
      ancestors: this.buildAncestorChain(id),
    }))
  );
 
  selectLevel(level: number, id: number): void {
    this.selections.update(s => {
      switch (level) {
        case 1:  return { l1: id, l2: null, l3: null, l4: null };
        case 2:  return { ...s, l2: id, l3: null, l4: null };
        case 3:  return { ...s, l3: id, l4: null };
        default: return { ...s, l4: id };
      }
    });
  }
 
  addTag(): void {
    const tag = this.deepestSelected();
    if (tag == null || this.appliedTagIds().includes(tag.id)) return;
    this.appliedTagIds.update(ids => [...ids, tag.id]);
  }
 
  removeTag(id: number): void {
    this.appliedTagIds.update(ids => ids.filter(existing => existing !== id));
  }
 
  private childrenOf(parentKey: keyof Selections, level: number) {
    return computed(() => {
      const pid = this.selections()[parentKey];
      return pid != null
        ? this.allTags().filter(t => t.level === level && t.parent_id === pid)
        : [];
    });
  }
 
  private buildAncestorChain(tagId: number): TaxTag[] {
    const map = this.tagMap();
    const tag = map.get(tagId);
    if (tag == null) return [];
 
    const chain: TaxTag[] = [tag];
    let current = tag;
    while (current.parent_id !== 0) {
      const parent = map.get(current.parent_id);
      if (parent == null) break;
      chain.unshift(parent);
      current = parent;
    }
    return chain;
  }
}














// export type TaxTag = {
//     id: number;
//     name: string;
//     definition: string;
//     level: number;
//     parent_id: number;
// };

// export type TaxAssetTagging = {
//     asset_type: string;
//     assetId: string;
//     taxTagId: number;
// };

// interface Selections {
//   l1: number | null;
//   l2: number | null;
//   l3: number | null;
//   l4: number | null;
// }
// const MOCK_TAGS: TaxTag[] = [
//     { id: 1, name: 'Client Organizations', definition: 'Client org data', level: 1, parent_id: 0 },
//     { id: 2, name: 'Market Data', definition: 'Market data assets', level: 1, parent_id: 0 },
//     { id: 3, name: 'Regulatory & Compliance', definition: 'Regulatory data', level: 1, parent_id: 0 },

//     { id: 10, name: 'Client Intelligence & Analytics', definition: 'Client analytics', level: 2, parent_id: 1 },
//     { id: 11, name: 'Client Onboarding', definition: 'Onboarding data', level: 2, parent_id: 1 },
//     { id: 12, name: 'Equity Research', definition: 'Equity research data', level: 2, parent_id: 2 },
//     { id: 13, name: 'Fixed Income Analytics', definition: 'FI analytics', level: 2, parent_id: 2 },
//     { id: 14, name: 'Trade Surveillance', definition: 'Surveillance data', level: 2, parent_id: 3 },

//     { id: 100, name: 'Client Profitability / Lifetime Value', definition: 'CLV metrics', level: 3, parent_id: 10 },
//     { id: 101, name: 'Client Segmentation Models', definition: 'Segmentation', level: 3, parent_id: 10 },
//     { id: 102, name: 'KYC Document Classification', definition: 'KYC docs', level: 3, parent_id: 11 },
//     { id: 103, name: 'Sector Performance Tracking', definition: 'Sector perf', level: 3, parent_id: 12 },
//     { id: 104, name: 'Yield Curve Analytics', definition: 'Yield curves', level: 3, parent_id: 13 },
//     { id: 105, name: 'Anomaly Detection Rules', definition: 'Anomaly rules', level: 3, parent_id: 14 },

//     { id: 1000, name: 'Revenue Attribution by Client', definition: 'Rev attribution', level: 4, parent_id: 100 },
//     { id: 1001, name: 'Churn Probability Scoring', definition: 'Churn scoring', level: 4, parent_id: 100 },
//     { id: 1002, name: 'Behavioral Clustering', definition: 'Clustering', level: 4, parent_id: 101 },
//     { id: 1003, name: 'Document Verification Status', definition: 'Doc verification', level: 4, parent_id: 102 },
//     { id: 1004, name: 'Relative Value Signals', definition: 'RV signals', level: 4, parent_id: 103 },
//     { id: 1005, name: 'Spread Duration Models', definition: 'Spread models', level: 4, parent_id: 104 },
//     { id: 1006, name: 'Pattern Match Rulesets', definition: 'Pattern rules', level: 4, parent_id: 105 },
// ];

// interface AppliedTagGroup {
//     id: number;
//     ancestors: TaxTag[];
// }

// @Component({
//     selector: 'app-taxonomy-tags-panel',
//     standalone: true,
//     imports: [MatSelectModule, MatFormFieldModule, MatIconModule, MatButtonModule],
//     template: `
//     <div class="tp">
 
//       <!-- Info banner -->
//       <div class="tp__info">
//         <mat-icon class="tp__info-icon">sell</mat-icon>
//         <div class="tp__info-body">
//           <span class="tp__info-title">Classify this BI Asset with Enterprise Data Taxonomy Tags</span>
//           <span class="tp__info-desc">
//             Select approved tags from the Enterprise Data Taxonomy to classify your BI Asset.
//             The Enterprise Data Taxonomy is a consolidated view of data assets in a hierarchical structure based on subject areas.
//           </span>
//         </div>
//       </div>
 
//       <!-- Dropdowns row -->
//       <div class="tp__selectors">
//         <div class="tp__col">
//           <label class="tp__label">Level 1</label>
//           <mat-form-field appearance="outline" class="tp__field">
//             <mat-select
//               [value]="selections().l1"
//               (selectionChange)="selectLevel(1, $event.value)"
//               placeholder="— Select —"
//             >
//               @for (tag of level1Options(); track tag.id) {
//                 <mat-option [value]="tag.id">{{ tag.name }}</mat-option>
//               }
//             </mat-select>
//           </mat-form-field>
//         </div>
 
//         <div class="tp__col">
//           <label class="tp__label">Level 2</label>
//           <mat-form-field appearance="outline" class="tp__field">
//             <mat-select
//               [value]="selections().l2"
//               (selectionChange)="selectLevel(2, $event.value)"
//               placeholder="— Select —"
//               [disabled]="!selections().l1"
//             >
//               @for (tag of level2Options(); track tag.id) {
//                 <mat-option [value]="tag.id">{{ tag.name }}</mat-option>
//               }
//             </mat-select>
//           </mat-form-field>
//         </div>
 
//         <div class="tp__col">
//           <label class="tp__label">Level 3</label>
//           <mat-form-field appearance="outline" class="tp__field">
//             <mat-select
//               [value]="selections().l3"
//               (selectionChange)="selectLevel(3, $event.value)"
//               placeholder="— Select —"
//               [disabled]="!selections().l2"
//             >
//               @for (tag of level3Options(); track tag.id) {
//                 <mat-option [value]="tag.id">{{ tag.name }}</mat-option>
//               }
//             </mat-select>
//           </mat-form-field>
//         </div>
 
//         <div class="tp__col">
//           <label class="tp__label">Level 4</label>
//           <mat-form-field appearance="outline" class="tp__field">
//             <mat-select
//               [value]="selections().l4"
//               (selectionChange)="selectLevel(4, $event.value)"
//               placeholder="— Select —"
//               [disabled]="!selections().l3"
//             >
//               @for (tag of level4Options(); track tag.id) {
//                 <mat-option [value]="tag.id">{{ tag.name }}</mat-option>
//               }
//             </mat-select>
//           </mat-form-field>
//         </div>
//       </div>
 
//       <!-- Add button -->
//       <button
//         mat-flat-button
//         class="tp__add-btn"
//         [disabled]="!canAdd()"
//         (click)="addTag()"
//       >
//         + Add Tags
//       </button>
 
//       <!-- Applied tags -->
//       @if (appliedTags().length > 0) {
//         <div class="tp__applied">
//           <label class="tp__applied-title">Applied Tags</label>
 
//           <div class="tp__applied-list">
//             @for (group of appliedTags(); track group.id) {
//               <div class="tp__tag-group">
//                 <div class="tp__tag-pills">
//                   @for (anc of group.ancestors; track anc.id) {
//                     <div class="tp__tag-pill" [style.margin-left.px]="(anc.level - 1) * 24">
//                       <span class="tp__tag-badge">L{{ anc.level }}</span>
//                       <span class="tp__tag-name">{{ anc.name }}</span>
//                     </div>
//                   }
//                 </div>
//                 <button
//                   mat-icon-button
//                   class="tp__tag-delete"
//                   (click)="removeTag(group.id)"
//                 >
//                   <mat-icon class="tp__tag-delete-icon">delete_outline</mat-icon>
//                 </button>
//               </div>
//             }
//           </div>
//         </div>
//       }
 
//       <!-- Save button -->
//       @if (appliedTags().length > 0) {
//         <div class="tp__actions">
//           <button mat-flat-button class="tp__save-btn">Save Tags</button>
//         </div>
//       }
//     </div>
//   `,
//     styles: `
//     .tp {
//       display: flex;
//       flex-direction: column;
//       gap: 16px;
//     }
 
//     /* ── Info ── */
//     .tp__info {
//       display: flex;
//       gap: 12px;
//       padding: 14px 16px;
//       border-radius: 8px;
//       background: #fff;
//       border: 1px solid rgba(0, 0, 0, 0.06);
//     }
 
//     .tp__info-icon {
//       font-size: 20px;
//       width: 20px;
//       height: 20px;
//       color: #8c8c9b;
//       flex-shrink: 0;
//       margin-top: 2px;
//     }
 
//     .tp__info-body {
//       display: flex;
//       flex-direction: column;
//       gap: 4px;
//     }
 
//     .tp__info-title {
//       font-size: 13px;
//       font-weight: 650;
//       color: #1a1a2e;
//     }
 
//     .tp__info-desc {
//       font-size: 12px;
//       color: #6e6e82;
//     }
 
//     /* ── Selectors ── */
//     .tp__selectors {
//       display: flex;
//       gap: 8px;
//     }
 
//     .tp__col {
//       flex: 1;
//       display: flex;
//       flex-direction: column;
//       gap: 4px;
//       min-width: 0;
//     }
 
//     .tp__label {
//       font-size: 11px;
//       font-weight: 650;
//       color: #8c8c9b;
//       text-transform: uppercase;
//     }
 
//     .tp__field {
//       width: 100%;
//       --mdc-outlined-text-field-container-shape: 6px;
//       --mdc-outlined-text-field-outline-color: rgba(0, 0, 0, 0.1);
//       --mdc-outlined-text-field-hover-outline-color: rgba(0, 0, 0, 0.2);
//       --mdc-outlined-text-field-focus-outline-color: #15803d;
//       --mat-select-trigger-text-size: 12px;
//     }
 
//     /* ── Add button ── */
//     .tp__add-btn {
//       align-self: flex-start;
//       border-radius: 8px;
//       font-size: 13px;
//       font-weight: 650;
//       --mdc-filled-button-container-color: #15803d;
//       --mdc-filled-button-label-text-color: #fff;
//       --mdc-filled-button-disabled-container-color: rgba(0, 0, 0, 0.06);
//       --mdc-filled-button-disabled-label-text-color: #b0b0c0;
//     }
 
//     /* ── Applied tags ── */
//     .tp__applied {
//       display: flex;
//       flex-direction: column;
//       gap: 10px;
//       padding: 16px;
//       border-radius: 8px;
//       background: #fff;
//       border: 1px solid rgba(0, 0, 0, 0.06);
//     }
 
//     .tp__applied-title {
//       font-size: 11px;
//       font-weight: 650;
//       color: #8c8c9b;
//       text-transform: uppercase;
//     }
 
//     .tp__applied-list {
//       display: flex;
//       flex-direction: column;
//       gap: 8px;
//     }
 
//     .tp__tag-group {
//       display: flex;
//       align-items: flex-start;
//       gap: 8px;
//       padding: 12px 8px 12px 12px;
//       border-radius: 8px;
//       background: rgba(42, 157, 110, 0.04);
//       border: 1px solid rgba(42, 157, 110, 0.1);
//     }
 
//     .tp__tag-pills {
//       flex: 1;
//       display: flex;
//       flex-direction: column;
//       gap: 6px;
//       min-width: 0;
//     }
 
//     .tp__tag-pill {
//       display: inline-flex;
//       align-items: center;
//       gap: 8px;
//       padding: 6px 14px 6px 6px;
//       border-radius: 20px;
//       background: rgba(42, 157, 110, 0.08);
//       border: 1px solid rgba(42, 157, 110, 0.14);
//       width: fit-content;
//       max-width: 100%;
//     }
 
//     .tp__tag-badge {
//       display: inline-flex;
//       align-items: center;
//       justify-content: center;
//       width: 24px;
//       height: 24px;
//       min-width: 24px;
//       border-radius: 50%;
//       background: #15803d;
//       color: #fff;
//       font-size: 10px;
//       font-weight: 700;
//       flex-shrink: 0;
//     }
 
//     .tp__tag-name {
//       font-size: 13px;
//       font-weight: 500;
//       color: #1a1a2e;
//       white-space: nowrap;
//       overflow: hidden;
//       text-overflow: ellipsis;
//     }
 
//     .tp__tag-delete {
//       --mdc-icon-button-state-layer-size: 32px;
//       --mdc-icon-button-icon-size: 18px;
//       color: #8c8c9b;
//       flex-shrink: 0;
//       align-self: center;
//     }
 
//     .tp__tag-delete-icon {
//       font-size: 18px;
//       width: 18px;
//       height: 18px;
//     }
 
//     /* ── Save button ── */
//     .tp__actions {
//       display: flex;
//       justify-content: flex-end;
//     }
 
//     .tp__save-btn {
//       border-radius: 8px;
//       font-size: 13px;
//       font-weight: 650;
//       --mdc-filled-button-container-color: #15803d;
//       --mdc-filled-button-label-text-color: #fff;
//     }
//   `,
// })
// export class TaxonomyTagsPanelComponent {
// private readonly allTags = signal<TaxTag[]>(MOCK_TAGS);

//   private readonly tagMap = computed(() =>
//     new Map(this.allTags().map(tag => [tag.id, tag]))
//   );

//   // ── Two writable signals instead of five ───────────────────────────

//   readonly selections = signal<Selections>({ l1: null, l2: null, l3: null, l4: null });
//   readonly appliedTagIds = signal<number[]>([]);

//   // ── Level options ──────────────────────────────────────────────────

//   readonly level1Options = computed(() =>
//     this.allTags().filter(t => t.level === 1)
//   );

//   readonly level2Options = this.childrenOf('l1', 2);
//   readonly level3Options = this.childrenOf('l2', 3);
//   readonly level4Options = this.childrenOf('l3', 4);

//   // ── Derived state ──────────────────────────────────────────────────

//   readonly deepestSelected = computed<TaxTag | null>(() => {
//     const { l4, l3 } = this.selections();
//     const id = l4 ?? l3;
//     return id != null ? this.tagMap().get(id) ?? null : null;
//   });

//   readonly canAdd = computed(() => {
//     const tag = this.deepestSelected();
//     return tag != null && !this.appliedTagIds().includes(tag.id);
//   });

//   /** Derives full ancestor chains from flat IDs — no stored interface needed */
//   readonly appliedTags = computed(() =>
//     this.appliedTagIds().map(id => ({
//       id,
//       ancestors: this.buildAncestorChain(id),
//     }))
//   );

//   // ── Actions ────────────────────────────────────────────────────────

//   selectLevel(level: number, id: number): void {
//     this.selections.update(s => {
//       switch (level) {
//         case 1:  return { l1: id, l2: null, l3: null, l4: null };
//         case 2:  return { ...s, l2: id, l3: null, l4: null };
//         case 3:  return { ...s, l3: id, l4: null };
//         default: return { ...s, l4: id };
//       }
//     });
//   }

//   addTag(): void {
//     const tag = this.deepestSelected();
//     if (tag == null || this.appliedTagIds().includes(tag.id)) return;
//     this.appliedTagIds.update(ids => [...ids, tag.id]);
//   }

//   removeTag(id: number): void {
//     this.appliedTagIds.update(ids => ids.filter(existing => existing !== id));
//   }

//   // ── Helpers ────────────────────────────────────────────────────────

//   private childrenOf(parentKey: keyof Selections, level: number) {
//     return computed(() => {
//       const pid = this.selections()[parentKey];
//       return pid != null
//         ? this.allTags().filter(t => t.level === level && t.parent_id === pid)
//         : [];
//     });
//   }

//   private buildAncestorChain(tagId: number): TaxTag[] {
//     const map = this.tagMap();
//     const tag = map.get(tagId);
//     if (tag == null) return [];

//     const chain: TaxTag[] = [tag];
//     let current = tag;
//     while (current.parent_id !== 0) {
//       const parent = map.get(current.parent_id);
//       if (parent == null) break;
//       chain.unshift(parent);
//       current = parent;
//     }
//     return chain;
//   }



//     // private readonly allTags = signal<TaxTag[]>(MOCK_TAGS);

//     // /** O(1) lookup instead of repeated .find() calls */
//     // private readonly tagMap = computed(() =>
//     //     new Map(this.allTags().map(tag => [tag.id, tag]))
//     // );

//     // // ── Cascading selections via linkedSignal ──────────────────────────
//     // // Setting L1 auto-resets L2 → L3 → L4, setting L2 resets L3 → L4, etc.

//     // readonly selectedL1 = signal<number | null>(null);

//     // readonly selectedL2 = linkedSignal<number | null>(() => {
//     //     this.selectedL1();
//     //     return null;
//     // });

//     // readonly selectedL3 = linkedSignal<number | null>(() => {
//     //     this.selectedL2();
//     //     return null;
//     // });

//     // readonly selectedL4 = linkedSignal<number | null>(() => {
//     //     this.selectedL3();
//     //     return null;
//     // });

//     // // ── Level options ──────────────────────────────────────────────────

//     // readonly level1Options = computed(() =>
//     //     this.allTags().filter(t => t.level === 1)
//     // );

//     // readonly level2Options = this.childrenOf(this.selectedL1, 2);
//     // readonly level3Options = this.childrenOf(this.selectedL2, 3);
//     // readonly level4Options = this.childrenOf(this.selectedL3, 4);

//     // // ── Applied tags ───────────────────────────────────────────────────

//     // readonly appliedTagGroups = signal<AppliedTagGroup[]>([]);

//     // private readonly appliedIds = computed(() =>
//     //     new Set(this.appliedTagGroups().map(g => g.id))
//     // );

//     // readonly deepestSelected = computed<TaxTag | null>(() => {
//     //     const id = this.selectedL4() ?? this.selectedL3();
//     //     return id != null ? (this.tagMap().get(id) ?? null) : null;
//     // });

//     // readonly canAdd = computed(() => {
//     //     const tag = this.deepestSelected();
//     //     return tag != null && tag.level >= 3 && !this.appliedIds().has(tag.id);
//     // });

//     // // ── Actions ────────────────────────────────────────────────────────

//     // private readonly levelSignals: Signal<number | null>[] = [
//     //     this.selectedL1, this.selectedL2, this.selectedL3, this.selectedL4,
//     // ];

//     // selectLevel(level: number, id: number): void {
//     //     const target = this.levelSignals[level - 1] as WritableSignal<number | null>;
//     //     target.set(id);
//     //     // linkedSignal handles all downstream resets automatically
//     // }

//     // addTag(): void {
//     //     const tag = this.deepestSelected();
//     //     if (!tag || tag.level < 3 || this.appliedIds().has(tag.id)) return;

//     //     const ancestors = this.buildAncestorChain(tag);
//     //     this.appliedTagGroups.update(groups => [...groups, { id: tag.id, ancestors }]);
//     // }

//     // removeTag(id: number): void {
//     //     this.appliedTagGroups.update(groups => groups.filter(g => g.id !== id));
//     // }

//     // // ── Helpers ────────────────────────────────────────────────────────

//     // private childrenOf(parentId: Signal<number | null>, level: number): Signal<TaxTag[]> {
//     //     return computed(() => {
//     //         const pid = parentId();
//     //         return pid != null
//     //             ? this.allTags().filter(t => t.level === level && t.parent_id === pid)
//     //             : [];
//     //     });
//     // }

//     // private buildAncestorChain(tag: TaxTag): TaxTag[] {
//     //     const chain: TaxTag[] = [tag];
//     //     let current = tag;
//     //     const map = this.tagMap();

//     //     while (current.parent_id !== 0) {
//     //         const parent = map.get(current.parent_id);
//     //         if (!parent) break;
//     //         chain.unshift(parent);
//     //         current = parent;
//     //     }
//     //     return chain;
//     // }


//     //   private readonly allTags = signal<TaxTag[]>(MOCK_TAGS);

//     //   readonly selectedL1 = signal<number | null>(null);
//     //   readonly selectedL2 = signal<number | null>(null);
//     //   readonly selectedL3 = signal<number | null>(null);
//     //   readonly selectedL4 = signal<number | null>(null);

//     //   readonly appliedTagGroups = signal<AppliedTagGroup[]>([]);

//     //   readonly level1Options = computed(() =>
//     //     this.allTags().filter(t => t.level === 1)
//     //   );

//     //   readonly level2Options = computed(() => {
//     //     const parent = this.selectedL1();
//     //     if (!parent) return [];
//     //     return this.allTags().filter(t => t.level === 2 && t.parent_id === parent);
//     //   });

//     //   readonly level3Options = computed(() => {
//     //     const parent = this.selectedL2();
//     //     if (!parent) return [];
//     //     return this.allTags().filter(t => t.level === 3 && t.parent_id === parent);
//     //   });

//     //   readonly level4Options = computed(() => {
//     //     const parent = this.selectedL3();
//     //     if (!parent) return [];
//     //     return this.allTags().filter(t => t.level === 4 && t.parent_id === parent);
//     //   });

//     //   readonly deepestSelected = computed<TaxTag | null>(() => {
//     //     const l4 = this.selectedL4();
//     //     if (l4) return this.allTags().find(t => t.id === l4) ?? null;
//     //     const l3 = this.selectedL3();
//     //     if (l3) return this.allTags().find(t => t.id === l3) ?? null;
//     //     return null;
//     //   });

//     //   readonly canAdd = computed(() => {
//     //     const tag = this.deepestSelected();
//     //     if (!tag || tag.level < 3) return false;
//     //     return !this.appliedTagGroups().some(g => g.id === tag.id);
//     //   });

//     //   selectLevel(level: number, id: number): void {
//     //     if (level === 1) {
//     //       this.selectedL1.set(id);
//     //       this.selectedL2.set(null);
//     //       this.selectedL3.set(null);
//     //       this.selectedL4.set(null);
//     //     } else if (level === 2) {
//     //       this.selectedL2.set(id);
//     //       this.selectedL3.set(null);
//     //       this.selectedL4.set(null);
//     //     } else if (level === 3) {
//     //       this.selectedL3.set(id);
//     //       this.selectedL4.set(null);
//     //     } else {
//     //       this.selectedL4.set(id);
//     //     }
//     //   }

//     //   addTag(): void {
//     //     const tag = this.deepestSelected();
//     //     if (!tag || tag.level < 3) return;
//     //     if (this.appliedTagGroups().some(g => g.id === tag.id)) return;

//     //     const ancestors = this.buildAncestorChain(tag);
//     //     this.appliedTagGroups.update(groups => [...groups, { id: tag.id, ancestors }]);
//     //   }

//     //   removeTag(id: number): void {
//     //     this.appliedTagGroups.update(groups => groups.filter(g => g.id !== id));
//     //   }

//     //   private buildAncestorChain(tag: TaxTag): TaxTag[] {
//     //     const chain: TaxTag[] = [tag];
//     //     let current = tag;
//     //     while (current.parent_id) {
//     //       const parent = this.allTags().find(t => t.id === current.parent_id);
//     //       if (!parent) break;
//     //       chain.unshift(parent);
//     //       current = parent;
//     //     }
//     //     return chain;
//     //   }
// }