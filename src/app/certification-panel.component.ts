import {
  Component,
  computed,
  signal,
  inject,
  DestroyRef,
  OnInit,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-certification-panel',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  template: `
    <div class="cert-form">

      <!-- ─── Header ─── -->
      <div class="cert-form__header">
        <div class="cert-form__header-icon">
          <mat-icon class="cert-form__header-mat-icon">verified</mat-icon>
        </div>
        <div class="cert-form__header-text">
          <h3 class="cert-form__title">Request Certification</h3>
          <p class="cert-form__subtitle">Complete all required fields to submit for review</p>
        </div>
      </div>

      <!-- ─── Progress ─── -->
      <div class="cert-form__progress">
        <div class="cert-form__progress-bar">
          <div
            class="cert-form__progress-fill"
            [style.width.%]="completionPct()"
          ></div>
        </div>
        <span class="cert-form__progress-label">{{ completionPct() }}% complete</span>
      </div>

      <form [formGroup]="form" class="cert-form__body">

        <!-- ═══════ 1. DESCRIPTION ═══════ -->
        <section class="field-section">
          <label class="field-section__label">
            Description
            <span class="field-section__req">*</span>
          </label>
          <p class="field-section__hint">Explain the purpose, scope, and intended consumers of this data product</p>

          <mat-form-field appearance="outline" class="field-section__full">
            <textarea
              matInput
              formControlName="description"
              rows="4"
              placeholder="Describe data lineage, quality expectations, refresh cadence…"
            ></textarea>
            <mat-error>
              @if (form.controls['description'].hasError('required')) {
                Description is required
              } @else if (form.controls['description'].hasError('minlength')) {
                Minimum 150 characters required
              }
            </mat-error>
          </mat-form-field>

          <!-- Character ring -->
          <div class="char-counter">
            <svg class="char-counter__ring" viewBox="0 0 36 36">
              <circle
                class="char-counter__ring-bg"
                cx="18" cy="18" r="15.9"
                fill="none" stroke-width="2.5"
              />
              <circle
                class="char-counter__ring-fill"
                cx="18" cy="18" r="15.9"
                fill="none" stroke-width="2.5"
                [attr.stroke-dasharray]="ringDash()"
                [attr.stroke-dashoffset]="ringOffset()"
                [class.char-counter__ring-fill--met]="charCount() >= 150"
              />
            </svg>
            <span
              class="char-counter__text"
              [class.char-counter__text--met]="charCount() >= 150"
            >{{ charCount() }}/150</span>
          </div>
        </section>

        <!-- ═══════ 2. CLASSIFICATION ═══════ -->
        <section class="field-section">
          <label class="field-section__label">
            Data Classification
            <span class="field-section__req">*</span>
          </label>

          <mat-form-field appearance="outline" class="field-section__full">
            <mat-select formControlName="classification" placeholder="Select classification">
              @for (opt of classificationOptions; track opt.value) {
                <mat-option [value]="opt.value">
                  <span class="select-opt">
                    <mat-icon class="select-opt__icon" [style.color]="opt.color">{{ opt.icon }}</mat-icon>
                    {{ opt.label }}
                  </span>
                </mat-option>
              }
            </mat-select>
            <mat-error>Classification is required</mat-error>
          </mat-form-field>
        </section>

        <!-- ═══════ 3. TAGS ═══════ -->
        <section class="field-section">
          <label class="field-section__label">
            Tags
            <span class="field-section__req">*</span>
          </label>
          <p class="field-section__hint">Type a tag and press Enter to add</p>

          <div class="tags-input">
            <div class="tags-input__chips">
              @for (tag of tags(); track tag) {
                <span class="tag-chip">
                  {{ tag }}
                  <button
                    class="tag-chip__remove"
                    (click)="removeTag(tag)"
                    type="button"
                    [attr.aria-label]="'Remove tag ' + tag"
                  >
                    <mat-icon class="tag-chip__remove-icon">close</mat-icon>
                  </button>
                </span>
              }
            </div>
            <div class="tags-input__field-row">
              <input
                class="tags-input__input"
                placeholder="{{ tags().length === 0 ? 'e.g. finance, revenue, quarterly' : 'Add another tag…' }}"
                [value]="tagInput()"
                (input)="tagInput.set($any($event.target).value)"
                (keydown.enter)="addTag(); $event.preventDefault()"
              />
              <button
                class="tags-input__add-btn"
                type="button"
                (click)="addTag()"
                [disabled]="!tagInput().trim()"
                matTooltip="Add tag"
              >
                <mat-icon class="tags-input__add-icon">add</mat-icon>
              </button>
            </div>
            @if (form.controls['tagsControl'].invalid && form.controls['tagsControl'].touched) {
              <span class="tags-input__error">At least one tag is required</span>
            }
          </div>
        </section>

        <!-- ═══════ 4. DATES ═══════ -->
        <section class="field-section">
          <label class="field-section__label">Certification Dates</label>
          <div class="date-pair">
            <div class="date-card date-card--cert">
              <mat-icon class="date-card__icon">event_available</mat-icon>
              <div class="date-card__info">
                <span class="date-card__label">Certified</span>
                <span class="date-card__value">{{ formattedCertDate() }}</span>
              </div>
            </div>
            <div class="date-pair__arrow">
              <mat-icon class="date-pair__arrow-icon">arrow_forward</mat-icon>
            </div>
            <div class="date-card date-card--exp">
              <mat-icon class="date-card__icon">event_busy</mat-icon>
              <div class="date-card__info">
                <span class="date-card__label">Expires</span>
                <span class="date-card__value">{{ formattedExpDate() }}</span>
              </div>
            </div>
          </div>
          <span class="field-section__footnote">
            <mat-icon class="field-section__footnote-icon">info</mat-icon>
            Certification is valid for 12 months from today
          </span>
        </section>

        <!-- ═══════ 5. CONTRACT ═══════ -->
        <section class="field-section">
          <label class="field-section__label">Contract</label>

          <div class="contract-check">
            <mat-checkbox
              formControlName="hasContract"
              color="primary"
            >
              This data product has an associated contract
            </mat-checkbox>
          </div>

          @if (form.controls['hasContract'].value) {
            <div class="contract-link">
              <mat-form-field appearance="outline" class="field-section__full">
                <mat-icon matPrefix class="contract-link__prefix-icon">link</mat-icon>
                <input
                  matInput
                  formControlName="contractLink"
                  placeholder="https://contracts.company.com/..."
                />
                <mat-error>Please enter a valid URL</mat-error>
              </mat-form-field>
            </div>
          }
        </section>

        <!-- ═══════ ATTESTATION ═══════ -->
        <section class="field-section">
          <div class="attestation">
            <mat-checkbox
              formControlName="attestation"
              color="primary"
            >
              <span class="attestation__text">
                I confirm that all information provided is accurate and complete.
                I accept responsibility as the certifying party for this data product.
              </span>
            </mat-checkbox>
          </div>
        </section>

        <!-- ═══════ SUBMIT ═══════ -->
        <div class="cert-form__actions">
          <button
            mat-flat-button
            class="cert-form__submit"
            [disabled]="!form.valid || tags().length === 0 || !form.controls['attestation'].value"
            type="submit"
            (click)="onSubmit()"
          >
            <mat-icon class="cert-form__submit-icon">verified</mat-icon>
            Submit for Certification
          </button>
        </div>

      </form>
    </div>
  `,
  styles: `
    /* ═══════════════════════════════════════
       CONTAINER
       ═══════════════════════════════════════ */
    .cert-form {
      display: flex;
      flex-direction: column;
    }

    /* ── Header ── */
    .cert-form__header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 20px;
    }

    .cert-form__header-icon {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .cert-form__header-mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
      color: #2a9d6e;
    }

    .cert-form__header-text {
      display: flex;
      flex-direction: column;
    }

    .cert-form__title {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: #1a1a2e;
      font-family: 'Instrument Serif', Georgia, serif;
      line-height: 1.2;
    }

    .cert-form__subtitle {
      margin: 2px 0 0;
      font-size: 12px;
      color: #8c8c9b;
      font-weight: 450;
    }

    /* ── Progress bar ── */
    .cert-form__progress {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 24px;
    }

    .cert-form__progress-bar {
      flex: 1;
      height: 4px;
      border-radius: 2px;
      background: rgba(0, 0, 0, 0.04);
      overflow: hidden;
    }

    .cert-form__progress-fill {
      height: 100%;
      border-radius: 2px;
      background: linear-gradient(90deg, #2a9d6e, #22c55e);
      transition: width 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .cert-form__progress-label {
      font-size: 11px;
      font-weight: 600;
      color: #8c8c9b;
      white-space: nowrap;
      min-width: 72px;
      text-align: right;
    }

    /* ── Body ── */
    .cert-form__body {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    /* ═══════════════════════════════════════
       FIELD SECTION
       ═══════════════════════════════════════ */
    .field-section {
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .field-section__label {
      font-size: 12.5px;
      font-weight: 650;
      color: #1a1a2e;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 3px;
    }

    .field-section__req {
      color: #e05d44;
      font-size: 13px;
    }

    .field-section__hint {
      margin: 0 0 8px;
      font-size: 11.5px;
      color: #8c8c9b;
      font-weight: 450;
      line-height: 1.4;
    }

    .field-section__full {
      width: 100%;

      --mdc-outlined-text-field-container-shape: 9px;
      --mdc-outlined-text-field-outline-color: rgba(0, 0, 0, 0.08);
      --mdc-outlined-text-field-hover-outline-color: rgba(0, 0, 0, 0.16);
      --mdc-outlined-text-field-focus-outline-color: #2a9d6e;
      --mdc-outlined-text-field-label-text-size: 13px;
    }

    .field-section__footnote {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 11.5px;
      color: #8c8c9b;
      font-weight: 450;
      margin-top: 6px;
    }

    .field-section__footnote-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
      color: #b0b0c0;
    }

    /* ═══════════════════════════════════════
       CHARACTER RING
       ═══════════════════════════════════════ */
    .char-counter {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: -8px;
    }

    .char-counter__ring {
      width: 28px;
      height: 28px;
      transform: rotate(-90deg);
    }

    .char-counter__ring-bg {
      stroke: rgba(0, 0, 0, 0.04);
    }

    .char-counter__ring-fill {
      stroke: #e05d44;
      stroke-linecap: round;
      transition: stroke-dashoffset 0.3s ease, stroke 0.3s ease;
    }

    .char-counter__ring-fill--met {
      stroke: #2a9d6e;
    }

    .char-counter__text {
      font-size: 11px;
      font-weight: 600;
      color: #8c8c9b;
      font-variant-numeric: tabular-nums;
    }

    .char-counter__text--met {
      color: #2a9d6e;
    }

    /* ═══════════════════════════════════════
       SELECT OPTION
       ═══════════════════════════════════════ */
    .select-opt {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .select-opt__icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    /* ═══════════════════════════════════════
       TAGS INPUT
       ═══════════════════════════════════════ */
    .tags-input {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .tags-input__chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .tag-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 5px 6px 5px 10px;
      border-radius: 7px;
      font-size: 12.5px;
      font-weight: 560;
      color: #1a1a2e;
      background: rgba(42, 157, 110, 0.07);
      border: 1px solid rgba(42, 157, 110, 0.15);
      animation: chip-in 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes chip-in {
      from {
        opacity: 0;
        transform: scale(0.85);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .tag-chip__remove {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: none;
      background: transparent;
      cursor: pointer;
      padding: 0;
      color: #8c8c9b;
      transition: all 0.15s ease;
    }

    .tag-chip__remove:hover {
      background: rgba(0, 0, 0, 0.06);
      color: #e05d44;
    }

    .tag-chip__remove-icon {
      font-size: 13px;
      width: 13px;
      height: 13px;
    }

    .tags-input__field-row {
      display: flex;
      gap: 6px;
      align-items: center;
    }

    .tags-input__input {
      flex: 1;
      padding: 10px 14px;
      border-radius: 9px;
      border: 1px solid rgba(0, 0, 0, 0.08);
      font-size: 13px;
      font-family: inherit;
      color: #1a1a2e;
      background: #fff;
      outline: none;
      transition: border-color 0.15s ease;
    }

    .tags-input__input::placeholder {
      color: #b0b0c0;
    }

    .tags-input__input:focus {
      border-color: #2a9d6e;
    }

    .tags-input__add-btn {
      width: 38px;
      height: 38px;
      min-width: 38px;
      min-height: 38px;
      border-radius: 9px;
      border: 1px solid rgba(42, 157, 110, 0.2);
      background: rgba(42, 157, 110, 0.06);
      color: #2a9d6e;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      transition: all 0.15s ease;
      flex-shrink: 0;
    }

    .tags-input__add-btn:hover:not(:disabled) {
      background: rgba(42, 157, 110, 0.12);
      border-color: rgba(42, 157, 110, 0.3);
    }

    .tags-input__add-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    .tags-input__add-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .tags-input__error {
      font-size: 11.5px;
      color: #e05d44;
      font-weight: 500;
    }

    /* ═══════════════════════════════════════
       DATE PAIR
       ═══════════════════════════════════════ */
    .date-pair {
      display: flex;
      align-items: center;
      gap: 0;
    }

    .date-card {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 14px;
      background: #fff;
      border: 1px solid rgba(0, 0, 0, 0.05);
    }

    .date-card--cert {
      border-radius: 10px 0 0 10px;
      border-right: none;
    }

    .date-card--exp {
      border-radius: 0 10px 10px 0;
    }

    .date-card__icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .date-card--cert .date-card__icon {
      color: #2a9d6e;
    }

    .date-card--exp .date-card__icon {
      color: #d97706;
    }

    .date-card__info {
      display: flex;
      flex-direction: column;
    }

    .date-card__label {
      font-size: 10.5px;
      font-weight: 600;
      color: #8c8c9b;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .date-card__value {
      font-size: 13px;
      font-weight: 620;
      color: #1a1a2e;
    }

    .date-pair__arrow {
      display: flex;
      align-items: center;
      padding: 0 2px;
      background: #fff;
      border-top: 1px solid rgba(0, 0, 0, 0.05);
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      align-self: stretch;
    }

    .date-pair__arrow-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #c0c0cc;
    }

    /* ═══════════════════════════════════════
       CONTRACT
       ═══════════════════════════════════════ */
    .contract-check {
      --mdc-checkbox-selected-icon-color: #2a9d6e;
      --mdc-checkbox-selected-hover-icon-color: #15803d;
      --mdc-checkbox-selected-focus-icon-color: #2a9d6e;
      --mdc-checkbox-selected-pressed-icon-color: #15803d;

      font-size: 13px;
      color: #3a3a52;
    }

    .contract-link {
      margin-top: 10px;
      animation: slide-down 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slide-down {
      from {
        opacity: 0;
        transform: translateY(-6px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .contract-link__prefix-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #b0b0c0;
      margin-right: 4px;
    }

    /* ═══════════════════════════════════════
       ATTESTATION
       ═══════════════════════════════════════ */
    .attestation {
      padding: 16px;
      border-radius: 10px;
      background: rgba(26, 26, 46, 0.03);
      border: 1px solid rgba(0, 0, 0, 0.05);

      --mdc-checkbox-selected-icon-color: #1a1a2e;
      --mdc-checkbox-selected-hover-icon-color: #2a2a48;
      --mdc-checkbox-selected-focus-icon-color: #1a1a2e;
      --mdc-checkbox-selected-pressed-icon-color: #2a2a48;
    }

    .attestation__text {
      font-size: 12.5px;
      color: #3a3a52;
      line-height: 1.55;
      font-weight: 450;
    }

    /* ═══════════════════════════════════════
       SUBMIT
       ═══════════════════════════════════════ */
    .cert-form__actions {
      padding-top: 8px;
    }

    .cert-form__submit {
      width: 100%;
      height: 44px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 650;
      letter-spacing: 0.01em;
      --mdc-filled-button-container-color: #1a1a2e;
      --mdc-filled-button-label-text-color: #fff;
    }

    .cert-form__submit:disabled {
      --mdc-filled-button-container-color: rgba(26, 26, 46, 0.08);
      --mdc-filled-button-label-text-color: #b0b0c0;
    }

    .cert-form__submit-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      margin-right: 6px;
    }
  `,
})
export class CertificationPanelComponent implements OnInit {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  readonly separatorKeyCodes = [ENTER, COMMA];

  tags = signal<string[]>([]);
  tagInput = signal('');
  charCount = signal(0);

  readonly classificationOptions = [
    { value: 'public', label: 'Public', icon: 'public', color: '#2a9d6e' },
    { value: 'internal', label: 'Internal', icon: 'business', color: '#3a6abf' },
    { value: 'confidential', label: 'Confidential', icon: 'lock', color: '#d97706' },
    { value: 'restricted', label: 'Restricted', icon: 'gpp_maybe', color: '#e05d44' },
  ];

  form: FormGroup = this.fb.group({
    description: ['', [Validators.required, Validators.minLength(150)]],
    classification: ['', Validators.required],
    tagsControl: ['', Validators.required],
    hasContract: [false],
    contractLink: [''],
    attestation: [false],
  });

  // ── Dates ──
  private certDate = new Date();
  private expDate = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d;
  })();

  formattedCertDate = computed(() => this.formatDate(this.certDate));
  formattedExpDate = computed(() => this.formatDate(this.expDate));

  // ── Character ring ──
  private readonly circumference = 2 * Math.PI * 15.9;
  ringDash = computed(() => `${this.circumference} ${this.circumference}`);
  ringOffset = computed(() => {
    const pct = Math.min(this.charCount() / 150, 1);
    return this.circumference - pct * this.circumference;
  });

  // ── Progress ──
  completionPct = computed(() => {
    let done = 0;
    const total = 4;
    if (this.charCount() >= 150) done++;
    if (this.form.controls['classification'].valid) done++;
    if (this.tags().length > 0) done++;
    if (!this.form.controls['hasContract'].value || this.form.controls['contractLink'].value?.trim()) done++;
    return Math.round((done / total) * 100);
  });

  ngOnInit(): void {
    this.form.controls['description'].valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((val: string) => this.charCount.set((val ?? '').length));

    this.form.controls['hasContract'].valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((checked: boolean) => {
        const ctrl = this.form.controls['contractLink'];
        if (checked) {
          ctrl.setValidators([Validators.required, Validators.pattern(/^https?:\/\/.+/)]);
        } else {
          ctrl.clearValidators();
          ctrl.setValue('');
        }
        ctrl.updateValueAndValidity();
      });
  }

  addTag(): void {
    const val = this.tagInput().trim().toLowerCase();
    if (val && !this.tags().includes(val)) {
      this.tags.update(t => [...t, val]);
      this.form.controls['tagsControl'].setValue('filled');
    }
    this.tagInput.set('');
  }

  removeTag(tag: string): void {
    this.tags.update(t => t.filter(item => item !== tag));
    if (this.tags().length === 0) {
      this.form.controls['tagsControl'].setValue('');
    }
  }

  onSubmit(): void {
    if (!this.form.valid || this.tags().length === 0) return;
    console.log({
      ...this.form.value,
      tags: this.tags(),
      certificationDate: this.certDate,
      expirationDate: this.expDate,
    });
  }

  private formatDate(date: Date): string {
    const day = date.getDate();
    const suffix = this.getOrdinalSuffix(day);
    const month = date.toLocaleDateString('en-GB', { month: 'long' });
    const year = date.getFullYear();
    return `${day}${suffix} ${month} ${year}`;
  }

  private getOrdinalSuffix(day: number): string {
    if (day >= 11 && day <= 13) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }
}