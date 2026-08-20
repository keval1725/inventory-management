import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { Toast, ToastKind } from '@inventory/shared-types';
import { IconComponent } from '../icon/icon.component';
import { ButtonDirective } from '../button/button.directive';

const Kinds: Record<ToastKind, { icon: string; spine: string; iconColour: string }> = {
  success: { icon: 'check-circle', spine: 'spine-ok', iconColour: 'text-ok' },
  error: { icon: 'alert-triangle', spine: 'spine-problem', iconColour: 'text-danger' },
  info: { icon: 'info', spine: 'spine-muted', iconColour: 'text-steel-600' },
};

/**
 * Bottom-left, deliberately: the edit drawer occupies the right edge, and a toast
 * must never land on top of its Save button. The container is
 * `pointer-events-none` for the same reason — only the cards themselves take
 * clicks, so a toast can't swallow one meant for the page underneath.
 *
 * `z-index` sits above the CDK overlay container (1000) so a toast raised by a
 * save inside a drawer is still visible.
 *
 * Input-driven: this library is `type:ui` and cannot import the store, so the
 * app passes the toast list down and dispatches the dismissal.
 */
@Component({
  selector: 'inv-toast-host',
  standalone: true,
  imports: [IconComponent, ButtonDirective],
  template: `
    <div class="pointer-events-none fixed bottom-4 left-3 right-3 z-[1100] flex flex-col gap-2 sm:right-auto sm:w-80">
      @for (toast of toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex animate-toast-in items-start gap-2.5 rounded-md border border-line bg-surface py-2.5 pl-3.5 pr-2 shadow-popover"
          [class]="kinds[toast.kind].spine"
        >
          <inv-icon
            [name]="kinds[toast.kind].icon"
            [size]="15"
            class="mt-px"
            [class]="kinds[toast.kind].iconColour"
          />

          <div class="min-w-0 flex-1 pt-px">
            <p class="text-base font-medium text-ink">{{ toast.message }}</p>
            @if (toast.detail) {
              <p class="mt-0.5 text-xs text-steel-600">{{ toast.detail }}</p>
            }
          </div>

          <button
            type="button"
            invButton
            variant="ghost"
            size="sm"
            iconOnly
            aria-label="Dismiss"
            (click)="dismiss.emit(toast.id)"
          >
            <inv-icon name="x" [size]="14" />
          </button>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastHostComponent {
  readonly toasts = input.required<readonly Toast[]>();
  readonly dismiss = output<string>();

  readonly kinds = Kinds;

  private readonly announcer = inject(LiveAnnouncer);
  private readonly announced = new Set<string>();

  constructor() {
    // The visible stack isn't itself a live region — a region has to exist in the
    // DOM before its content changes to be announced reliably, and these cards
    // don't. The CDK's body-level announcer does, so announcements go through it.
    effect(() => {
      for (const toast of this.toasts()) {
        if (this.announced.has(toast.id)) {
          continue;
        }

        this.announced.add(toast.id);
        this.announcer.announce(
          toast.detail ? `${toast.message} ${toast.detail}` : toast.message,
          toast.kind === 'error' ? 'assertive' : 'polite',
        );
      }
    });
  }
}
