import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

/**
 * An empty screen is an invitation to act, so the copy should name the next
 * step and the action should be projected in — never a dead end that only
 * reports absence.
 */
@Component({
  selector: 'inv-empty-state',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="flex flex-col items-center px-6 py-16 text-center">
      <span
        class="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface-sunken text-steel-500"
      >
        <inv-icon [name]="icon()" [size]="20" />
      </span>

      <h3 class="text-md font-semibold text-ink">{{ headline() }}</h3>

      @if (body()) {
        <p class="mt-1 max-w-sm text-base text-steel-600">{{ body() }}</p>
      }

      <div class="mt-5 flex items-center gap-2 empty:hidden">
        <ng-content />
      </div>
    </div>
  `,
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  readonly icon = input('inbox');
  readonly headline = input.required<string>();
  readonly body = input<string>();
}
