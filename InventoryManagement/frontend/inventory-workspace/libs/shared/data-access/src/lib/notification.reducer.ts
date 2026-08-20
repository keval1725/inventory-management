import { createFeature, createReducer, on } from '@ngrx/store';
import { Toast } from '@inventory/shared-types';
import { NotificationActions } from './notification.actions';

export interface NotificationState {
  toasts: Toast[];
}

/**
 * Past this many, the stack stops being feedback and becomes a wall — the
 * oldest is dropped rather than queued, because stale feedback is worth less
 * than the newest.
 */
const MaxVisible = 4;

export const initialNotificationState: NotificationState = { toasts: [] };

export const notificationFeature = createFeature({
  name: 'notification',
  reducer: createReducer(
    initialNotificationState,
    on(NotificationActions.toastAdded, (state, { toast }) => ({
      toasts: [...state.toasts, toast].slice(-MaxVisible),
    })),
    on(NotificationActions.dismiss, (state, { id }) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
    on(NotificationActions.dismissAll, () => initialNotificationState),
  ),
});
