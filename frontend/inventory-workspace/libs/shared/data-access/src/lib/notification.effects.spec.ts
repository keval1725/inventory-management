import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { Subject } from 'rxjs';
import { Toast } from '@inventory/shared-types';
import { NotificationActions } from './notification.actions';
import { NotificationEffects } from './notification.effects';

const SuccessDelayMs = 4500;
const ErrorDelayMs = 9000;

function toast(id: string, kind: Toast['kind'] = 'success'): Toast {
  return { id, kind, message: `Message ${id}` };
}

describe('NotificationEffects', () => {
  let actions$: Subject<Action>;
  let effects: NotificationEffects;

  beforeEach(() => {
    jest.useFakeTimers();
    actions$ = new Subject<Action>();

    TestBed.configureTestingModule({
      providers: [NotificationEffects, provideMockActions(() => actions$)],
    });

    effects = TestBed.inject(NotificationEffects);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('gives every notification its own id', () => {
    const ids: string[] = [];
    effects.assignId$.subscribe((action) => ids.push(action.toast.id));

    actions$.next(NotificationActions.notify({ kind: 'success', message: 'Warehouse created' }));
    actions$.next(NotificationActions.notify({ kind: 'success', message: 'Warehouse created' }));

    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
  });

  it('carries the message and detail through untouched', () => {
    const added: Toast[] = [];
    effects.assignId$.subscribe((action) => added.push(action.toast));

    actions$.next(
      NotificationActions.notify({ kind: 'error', message: 'That record no longer exists.', detail: 'Refresh.' }),
    );

    expect(added[0]).toEqual({
      id: expect.any(String),
      kind: 'error',
      message: 'That record no longer exists.',
      detail: 'Refresh.',
    });
  });

  // The reason autoDismiss$ uses mergeMap: switchMap would abandon the first
  // toast's timer when the second arrived, leaving it on screen for good.
  it('dismisses each toast on its own timer', () => {
    const dismissed: string[] = [];
    effects.autoDismiss$.subscribe((action) => dismissed.push(action.id));

    actions$.next(NotificationActions.toastAdded({ toast: toast('a') }));
    actions$.next(NotificationActions.toastAdded({ toast: toast('b') }));

    jest.advanceTimersByTime(SuccessDelayMs);

    expect(dismissed).toEqual(['a', 'b']);
  });

  it('leaves errors on screen longer than successes', () => {
    const dismissed: string[] = [];
    effects.autoDismiss$.subscribe((action) => dismissed.push(action.id));

    actions$.next(NotificationActions.toastAdded({ toast: toast('problem', 'error') }));

    jest.advanceTimersByTime(SuccessDelayMs);
    expect(dismissed).toEqual([]);

    jest.advanceTimersByTime(ErrorDelayMs - SuccessDelayMs);
    expect(dismissed).toEqual(['problem']);
  });
});
