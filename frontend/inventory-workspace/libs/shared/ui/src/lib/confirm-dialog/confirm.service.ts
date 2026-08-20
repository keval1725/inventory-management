import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { inject, Injectable, Injector } from '@angular/core';
import { ConfirmDialogComponent, ConfirmOptions, ResolvedConfirmOptions } from './confirm-dialog.component';

const Defaults = {
  message: '',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  tone: 'default',
} satisfies Omit<ResolvedConfirmOptions, 'title'>;

/**
 * Destructive actions ask first. Awaited rather than callback-driven, so the
 * calling code reads as one sequence:
 *
 *   if (!(await this.confirm.ask({ ... }))) return;
 *   this.store.dispatch(...);
 *
 * Dismissing by backdrop or Escape resolves `false` — walking away is never
 * mistaken for consent.
 */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly overlay = inject(Overlay);
  private readonly injector = inject(Injector);

  ask(options: ConfirmOptions): Promise<boolean> {
    const overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
      scrollStrategy: this.overlay.scrollStrategies.block(),
      hasBackdrop: true,
      backdropClass: 'bg-ink/30',
      disposeOnNavigation: true,
    });

    const dialogRef = overlayRef.attach(new ComponentPortal(ConfirmDialogComponent, null, this.injector));
    dialogRef.setInput('options', { ...Defaults, ...options } satisfies ResolvedConfirmOptions);

    return new Promise<boolean>((resolve) => {
      const settle = (answer: boolean) => {
        overlayRef.dispose();
        resolve(answer);
      };

      dialogRef.instance.answered.subscribe(settle);
      overlayRef.backdropClick().subscribe(() => settle(false));
      overlayRef.keydownEvents().subscribe((event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          settle(false);
        }
      });
    });
  }
}
