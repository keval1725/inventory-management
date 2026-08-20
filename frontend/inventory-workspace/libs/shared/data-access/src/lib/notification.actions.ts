import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Toast, ToastKind } from '@inventory/shared-types';

export const NotificationActions = createActionGroup({
  source: 'Notification',
  events: {
    /**
     * The public entry point — dispatch this from any effect, component or
     * interceptor. The id is assigned downstream so callers never invent one.
     */
    Notify: props<{ kind: ToastKind; message: string; detail?: string }>(),

    /** Internal: the same notification, now identified. Raised by the effect. */
    'Toast Added': props<{ toast: Toast }>(),

    Dismiss: props<{ id: string }>(),
    'Dismiss All': emptyProps(),
  },
});
