import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { PAGE_SIZE_OPTIONS } from '@inventory/shared-types';
import { IconComponent } from '../icon/icon.component';
import { ButtonDirective } from '../button/button.directive';

/** -1 marks a gap in the page window, rendered as an ellipsis. */
const Gap = -1;
const MaxSlots = 7;

/** Exported for its own tests — off-by-one bugs here are invisible until someone hits page 2. */
export function pageWindow(current: number, total: number): number[] {
  if (total <= MaxSlots) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const anchors = [1, total, current, current - 1, current + 1];
  const visible = [...new Set(anchors)].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);

  const slots: number[] = [];
  let previous = 0;

  for (const page of visible) {
    if (previous && page - previous > 1) {
      slots.push(Gap);
    }

    slots.push(page);
    previous = page;
  }

  return slots;
}

@Component({
  selector: 'inv-pagination',
  standalone: true,
  imports: [IconComponent, ButtonDirective],
  template: `
    <div class="flex flex-wrap items-center justify-between gap-3 border-t border-line px-3 py-2">
      <p class="text-xs text-steel-600">
        @if (totalCount() === 0) {
          No results
        } @else {
          Showing <span class="font-mono font-medium text-ink">{{ rangeStart() }}</span
          >–<span class="font-mono font-medium text-ink">{{ rangeEnd() }}</span> of
          <span class="font-mono font-medium text-ink">{{ totalCount() }}</span>
        }
      </p>

      <div class="flex items-center gap-3">
        <label class="flex items-center gap-1.5 text-xs text-steel-600">
          Rows
          <select
            class="h-7 w-auto py-0 pl-2 pr-6 text-xs"
            [value]="pageSize()"
            (change)="onPageSize($event)"
            aria-label="Rows per page"
          >
            @for (option of pageSizeOptions; track option) {
              <option [value]="option">{{ option }}</option>
            }
          </select>
        </label>

        <div class="flex items-center gap-0.5">
          <button
            type="button"
            invButton
            variant="ghost"
            size="sm"
            iconOnly
            aria-label="First page"
            [disabled]="page() <= 1"
            (click)="goTo(1)"
          >
            <inv-icon name="chevrons-left" [size]="14" />
          </button>
          <button
            type="button"
            invButton
            variant="ghost"
            size="sm"
            iconOnly
            aria-label="Previous page"
            [disabled]="page() <= 1"
            (click)="goTo(page() - 1)"
          >
            <inv-icon name="chevron-left" [size]="14" />
          </button>

          @for (slot of slots(); track $index) {
            @if (slot === gap) {
              <span class="px-1 text-xs text-steel-400" aria-hidden="true">…</span>
            } @else {
              <button
                type="button"
                invButton
                [variant]="slot === page() ? 'primary' : 'ghost'"
                size="sm"
                iconOnly
                class="font-mono"
                [attr.aria-label]="'Page ' + slot"
                [attr.aria-current]="slot === page() ? 'page' : null"
                (click)="goTo(slot)"
              >
                {{ slot }}
              </button>
            }
          }

          <button
            type="button"
            invButton
            variant="ghost"
            size="sm"
            iconOnly
            aria-label="Next page"
            [disabled]="page() >= totalPages()"
            (click)="goTo(page() + 1)"
          >
            <inv-icon name="chevron-right" [size]="14" />
          </button>
          <button
            type="button"
            invButton
            variant="ghost"
            size="sm"
            iconOnly
            aria-label="Last page"
            [disabled]="page() >= totalPages()"
            (click)="goTo(totalPages())"
          >
            <inv-icon name="chevrons-right" [size]="14" />
          </button>
        </div>
      </div>
    </div>
  `,
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  readonly page = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly totalCount = input.required<number>();

  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>();

  readonly gap = Gap;
  readonly pageSizeOptions = PAGE_SIZE_OPTIONS;

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalCount() / this.pageSize())));
  readonly rangeStart = computed(() => (this.totalCount() === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1));
  readonly rangeEnd = computed(() => Math.min(this.page() * this.pageSize(), this.totalCount()));
  readonly slots = computed(() => pageWindow(this.page(), this.totalPages()));

  goTo(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.page()) {
      this.pageChange.emit(page);
    }
  }

  onPageSize(event: Event): void {
    this.pageSizeChange.emit(Number((event.target as HTMLSelectElement).value));
  }
}
