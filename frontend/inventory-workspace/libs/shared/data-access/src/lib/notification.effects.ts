import { Injectable } from '@angular/core';
import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { delay, map, mergeMap, of } from 'rxjs';
import { Toast } from '@inventory/shared-types';
import { NotificationActions } from './notification.actions';

/** Errors linger — someone may need to read them twice — successes get out of the way. */
const DismissDelayMs: Record<Toast['kind'], number> = {
  success: 4500,
  info: 5000,
  error: 9000,
};

@Injectable()
export class NotificationEffects {
  private readonly actions$ = inject(Actions);

  /**
   * Ids are assigned here rather than by callers: dispatching feedback should
   * cost one line, and an effect is already the impure edge of the store.
   */
  private sequence = 0;

  assignId$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NotificationActions.notify),
      map(({ kind, message, detail }) =>
        NotificationActions.toastAdded({ toast: { id: `toast-${++this.sequence}`, kind, message, detail } }),
      ),
    ),
  );

  /**
   * `mergeMap`, not `switchMap` — each toast owns its own timer. Switching would
   * let a second toast cancel the first one's dismissal and leave it stuck.
   */
  autoDismiss$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NotificationActions.toastAdded),
      mergeMap(({ toast }) =>
        of(NotificationActions.dismiss({ id: toast.id })).pipe(delay(DismissDelayMs[toast.kind])),
      ),
    ),
  );
}
