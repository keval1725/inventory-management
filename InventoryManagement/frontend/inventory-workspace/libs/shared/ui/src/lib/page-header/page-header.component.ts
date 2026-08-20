import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'inv-page-header',
  standalone: true,
  template: `
    <div class="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
      <div class="min-w-0">
        @if (eyebrow()) {
          <p class="micro-label mb-1.5">{{ eyebrow() }}</p>
        }

        <h1 class="text-2xl">{{ title() }}</h1>

        @if (description()) {
          <p class="mt-1 max-w-2xl text-md text-steel-600">{{ description() }}</p>
        }
      </div>

      <div class="flex shrink-0 items-center gap-2 empty:hidden">
        <ng-content />
      </div>
    </div>
  `,
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  /** Small tracked label above the title — the section this page sits in. */
  readonly eyebrow = input<string>();
  readonly title = input.required<string>();
  readonly description = input<string>();
}
