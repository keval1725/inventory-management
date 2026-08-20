import { A11yModule } from '@angular/cdk/a11y';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { CdkPortal, PortalModule } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { ButtonDirective } from '../button/button.directive';

/**
 * A right-hand slide-over for create and edit.
 *
 * A drawer rather than a separate page: the list stays visible behind it, so the
 * record keeps its context and closing returns you exactly where you were,
 * scroll position and filters intact.
 *
 * It goes through the CDK overlay rather than rendering inline, which puts the
 * panel in a body-level container — immune to any `overflow` or `transform` on
 * the shell — and brings scroll blocking and a focus trap with it.
 *
 * The parent owns the open state and does the closing, so an unsaved-changes
 * guard can intercept `closeRequested` and decline.
 */
@Component({
  selector: 'inv-drawer',
  standalone: true,
  imports: [PortalModule, A11yModule, IconComponent, ButtonDirective],
  template: `
    <ng-template cdkPortal>
      <div
        cdkTrapFocus
        [cdkTrapFocusAutoCapture]="true"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="title()"
        class="flex h-full w-screen max-w-md animate-slide-in-right flex-col border-l border-line bg-surface shadow-overlay"
      >
        <header class="order-1 flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div class="min-w-0">
            <h2 class="text-lg">{{ title() }}</h2>
            @if (description()) {
              <p class="mt-0.5 text-base text-steel-600">{{ description() }}</p>
            }
          </div>

          <button
            type="button"
            invButton
            variant="ghost"
            size="sm"
            iconOnly
            aria-label="Close"
            (click)="closeRequested.emit()"
          >
            <inv-icon name="x" [size]="16" />
          </button>
        </header>

        <!-- Declared before the catch-all slot below, because Angular matches projected
             content against slots in declaration order and an unnamed <ng-content>
             matches everything — including this footer. The order-* utilities put it
             back where it belongs visually. -->
        <footer
          class="order-3 flex items-center justify-end gap-2 border-t border-line bg-surface-sunken px-5 py-3 empty:hidden"
        >
          <ng-content select="[drawerFooter]" />
        </footer>

        <div class="order-2 min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <ng-content />
        </div>
      </div>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawerComponent {
  readonly open = input(false);
  readonly title = input.required<string>();
  readonly description = input<string>();

  /** Backdrop click, Escape, or the close button. The parent decides whether to honour it. */
  readonly closeRequested = output<void>();

  private readonly overlay = inject(Overlay);
  private readonly portal = viewChild.required(CdkPortal);
  private overlayRef?: OverlayRef;

  constructor() {
    effect(() => (this.open() ? this.attach() : this.detach()));
    inject(DestroyRef).onDestroy(() => this.overlayRef?.dispose());
  }

  private attach(): void {
    if (this.overlayRef) {
      return;
    }

    const overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().global().right().top(),
      scrollStrategy: this.overlay.scrollStrategies.block(),
      hasBackdrop: true,
      backdropClass: 'bg-ink/25',
      disposeOnNavigation: true,
      height: '100%',
    });

    overlayRef.attach(this.portal());
    overlayRef.backdropClick().subscribe(() => this.closeRequested.emit());
    overlayRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.closeRequested.emit();
      }
    });

    this.overlayRef = overlayRef;
  }

  private detach(): void {
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
  }
}
