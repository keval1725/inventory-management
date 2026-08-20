import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * A panel on the page plane, so it is bounded by a hairline and casts no shadow.
 * Shadow in this app means "floating above the page" and is reserved for
 * drawers, dialogs, menus and toasts.
 */
@Component({
  selector: 'inv-card',
  standalone: true,
  template: '<ng-content />',
  host: { class: 'block rounded-md border border-line bg-surface' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {}
