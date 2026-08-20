import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { SortDirection } from '@inventory/shared-types';
import { IconComponent } from '../icon/icon.component';

/**
 * Applied to the `<th>` itself so `aria-sort` lands on the right element, while
 * the clickable target stays a real button inside the cell.
 *
 * Used as `<th inv-sort-header key="name" ...>` — the kebab-case attribute shape
 * Angular uses for its own host-bound components, e.g. `button[mat-button]`.
 *
 * The asc/desc toggle logic lives here rather than in each page, so every table
 * in the app sorts the same way: a new column starts ascending, and clicking the
 * active column reverses it.
 */
@Component({
  selector: 'th[inv-sort-header]',
  standalone: true,
  imports: [IconComponent],
  template: `
    <button
      type="button"
      (click)="onToggle()"
      class="group/sort inline-flex items-center gap-1 text-inherit transition-colors duration-150 hover:text-ink"
      [class.w-full]="align() === 'right'"
      [class.justify-end]="align() === 'right'"
    >
      <ng-content />
      <inv-icon
        [name]="icon()"
        [size]="12"
        [class]="isActive() ? 'text-ink' : 'text-steel-300 group-hover/sort:text-steel-500'"
      />
    </button>
  `,
  host: {
    '[attr.aria-sort]': 'ariaSort()',
    class: 'micro-label whitespace-nowrap px-3 py-2 text-left align-middle',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortHeaderComponent {
  /** Backend sort key for this column, e.g. `name`. */
  readonly key = input.required<string>();
  /** The column the list is currently sorted by. */
  readonly activeKey = input('');
  readonly direction = input<SortDirection>('asc');
  readonly align = input<'left' | 'right'>('left');

  readonly sort = output<{ key: string; direction: SortDirection }>();

  readonly isActive = computed(() => this.activeKey() === this.key());

  readonly icon = computed(() => {
    if (!this.isActive()) {
      return 'arrow-up-down';
    }

    return this.direction() === 'asc' ? 'arrow-up' : 'arrow-down';
  });

  readonly ariaSort = computed(() => {
    if (!this.isActive()) {
      return 'none';
    }

    return this.direction() === 'asc' ? 'ascending' : 'descending';
  });

  onToggle(): void {
    const direction: SortDirection = this.isActive() && this.direction() === 'asc' ? 'desc' : 'asc';
    this.sort.emit({ key: this.key(), direction });
  }
}
