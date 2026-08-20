import { Toast } from '@inventory/shared-types';
import { NotificationActions } from './notification.actions';
import { initialNotificationState, notificationFeature } from './notification.reducer';

const { reducer } = notificationFeature;

function toast(id: string, kind: Toast['kind'] = 'success'): Toast {
  return { id, kind, message: `Message ${id}` };
}

function stateWith(...ids: string[]) {
  return ids.reduce((state, id) => reducer(state, NotificationActions.toastAdded({ toast: toast(id) })), {
    ...initialNotificationState,
  });
}

describe('notification reducer', () => {
  it('appends toasts in the order they arrive', () => {
    const state = stateWith('a', 'b');

    expect(state.toasts.map((entry) => entry.id)).toEqual(['a', 'b']);
  });

  it('drops the oldest toast rather than growing past the visible cap', () => {
    const state = stateWith('a', 'b', 'c', 'd', 'e');

    expect(state.toasts.map((entry) => entry.id)).toEqual(['b', 'c', 'd', 'e']);
  });

  it('removes only the dismissed toast', () => {
    const state = reducer(stateWith('a', 'b', 'c'), NotificationActions.dismiss({ id: 'b' }));

    expect(state.toasts.map((entry) => entry.id)).toEqual(['a', 'c']);
  });

  it('ignores a dismissal for a toast that is already gone', () => {
    const before = stateWith('a');
    const after = reducer(before, NotificationActions.dismiss({ id: 'gone' }));

    expect(after.toasts).toEqual(before.toasts);
  });

  it('clears everything on dismissAll', () => {
    const state = reducer(stateWith('a', 'b'), NotificationActions.dismissAll());

    expect(state.toasts).toEqual([]);
  });
});
