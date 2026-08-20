import { A11yModule } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { ButtonDirective } from '../button/button.directive';

export interface ConfirmOptions {
  /** Ask the actual question, naming the record: "Deactivate East Dock?" */
  title: string;
  /** What will happen as a result. Consequences, not reassurance. */
  message?: string;
  /** The verb, matching the button that opened this: "Deactivate", not "OK". */
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
}

export type ResolvedConfirmOptions = Required<ConfirmOptions>;

@Component({
  selector: 'inv-confirm-dialog',
  standalone: true,
  imports: [A11yModule, IconComponent, ButtonDirective],
  template: `
    <div
      cdkTrapFocus
      [cdkTrapFocusAutoCapture]="true"
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="options().title"
      class="w-screen max-w-sm animate-scale-in rounded-md border border-line bg-surface shadow-overlay"
      [class.spine-problem]="isDanger()"
    >
      <div class="flex gap-3 px-5 pb-4 pt-5">
        <span
          class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          [class]="isDanger() ? 'bg-danger-100 text-danger' : 'bg-surface-sunken text-steel-600'"
        >
          <inv-icon [name]="isDanger() ? 'alert-triangle' : 'alert-circle'" [size]="16" />
        </span>

        <div class="min-w-0 pt-0.5">
          <h2 class="text-md font-semibold">{{ options().title }}</h2>
          @if (options().message) {
            <p class="mt-1 text-base text-steel-600">{{ options().message }}</p>
          }
        </div>
      </div>

      <div class="flex justify-end gap-2 border-t border-line bg-surface-sunken px-5 py-3">
        <!-- Cancel takes focus first: for a destructive prompt the safe answer
             should be the one an impatient Enter keypress lands on. -->
        <button type="button" invButton variant="secondary" cdkFocusInitial (click)="answered.emit(false)">
          {{ options().cancelLabel }}
        </button>
        <button type="button" invButton [variant]="isDanger() ? 'danger' : 'primary'" (click)="answered.emit(true)">
          {{ options().confirmLabel }}
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  readonly options = input.required<ResolvedConfirmOptions>();
  readonly answered = output<boolean>();

  readonly isDanger = computed(() => this.options().tone === 'danger');
}
