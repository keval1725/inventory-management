import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { NotificationActions, notificationFeature } from '@inventory/shared-data-access';
import { ToastHostComponent } from '@inventory/shared-ui';

@Component({
  selector: 'inv-root',
  standalone: true,
  imports: [RouterOutlet, ToastHostComponent],
  template: `
    <router-outlet />

    <!-- Outside the shell, so a "can't reach the server" toast still appears on
         the sign-in page, and so nothing in the layout can clip it. -->
    <inv-toast-host [toasts]="toasts()" (dismiss)="onDismiss($event)" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly store = inject(Store);

  readonly toasts = this.store.selectSignal(notificationFeature.selectToasts);

  onDismiss(id: string): void {
    this.store.dispatch(NotificationActions.dismiss({ id }));
  }
}
