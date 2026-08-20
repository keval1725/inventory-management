import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface FilterTabOption<T extends string = string> {
  value: T;
  label: string;
}

/**
 * A segmented filter. Buttons with `aria-pressed` rather than a tablist, because
 * these narrow one dataset — they don't switch between panels.
 */
@Component({
  selector: 'inv-filter-tabs',
  standalone: true,
  template: `
    <div role="group" [attr.aria-label]="label()" class="inline-flex gap-0.5 rounded border border-line bg-surface p-0.5">
      @for (option of options(); track option.value) {
        <button
          type="button"
          [attr.aria-pressed]="option.value === value()"
          (click)="selected.emit(option.value)"
          class="rounded-sm px-2.5 py-1 text-xs font-medium transition-colors duration-150"
          [class]="
            option.value === value() ? 'bg-ink text-white' : 'text-steel-600 hover:bg-surface-sunken hover:text-ink'
          "
        >
          {{ option.label }}
        </button>
      }
    </div>
  `,
  host: { class: 'inline-block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterTabsComponent {
  readonly options = input.required<readonly FilterTabOption[]>();
  readonly value = input.required<string>();
  readonly label = input('Filter');

  readonly selected = output<string>();
}
