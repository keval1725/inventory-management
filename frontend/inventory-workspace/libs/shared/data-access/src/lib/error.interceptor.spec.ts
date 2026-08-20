import { HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { throwError } from 'rxjs';
import { AppError, errorInterceptor } from './error.interceptor';
import { NotificationActions } from './notification.actions';
import { TokenStorageService } from './token-storage.service';

interface Harness {
  caught: AppError | undefined;
  dispatch: jest.Mock;
  clearToken: jest.Mock;
  navigate: jest.Mock;
}

function intercept(error: HttpErrorResponse): Harness {
  const dispatch = jest.fn();
  const clearToken = jest.fn();
  const navigate = jest.fn();

  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      { provide: TokenStorageService, useValue: { clearToken } },
      { provide: Router, useValue: { navigate } },
      { provide: Store, useValue: { dispatch } },
    ],
  });

  let caught: AppError | undefined;

  TestBed.runInInjectionContext(() =>
    errorInterceptor(new HttpRequest('GET', '/api/v1/warehouses'), () => throwError(() => error)),
  ).subscribe({
    error: (thrown: AppError) => (caught = thrown),
  });

  return { caught, dispatch, clearToken, navigate };
}

describe('errorInterceptor', () => {
  it('stays quiet on a 400 — validation messages belong on the field', () => {
    const { dispatch, caught } = intercept(
      new HttpErrorResponse({ status: 400, error: { title: 'Validation failed', detail: 'Name is required.' } }),
    );

    expect(dispatch).not.toHaveBeenCalled();
    expect(caught).toEqual({ status: 400, message: 'Name is required.' });
  });

  it('passes a 409 conflict through with the server wording', () => {
    const { dispatch } = intercept(
      new HttpErrorResponse({ status: 409, error: { detail: 'Someone else changed this record.' } }),
    );

    expect(dispatch).toHaveBeenCalledWith(
      NotificationActions.notify({
        kind: 'error',
        message: 'Someone else changed this record.',
        detail: 'Refresh and try again.',
      }),
    );
  });

  it('never surfaces a server exception message', () => {
    const { dispatch } = intercept(
      new HttpErrorResponse({ status: 500, error: { detail: 'Object reference not set to an instance of an object.' } }),
    );

    expect(dispatch).toHaveBeenCalledWith(
      NotificationActions.notify({
        kind: 'error',
        message: 'Something went wrong on the server.',
        detail: 'Try again in a moment.',
      }),
    );
  });

  it('reports an unreachable API as a connection problem', () => {
    const { dispatch } = intercept(new HttpErrorResponse({ status: 0, statusText: 'Unknown Error' }));

    expect(dispatch).toHaveBeenCalledWith(
      NotificationActions.notify({
        kind: 'error',
        message: "Can't reach the server.",
        detail: 'Check your connection, then try again.',
      }),
    );
  });

  it('clears the token and returns to sign-in on a 401', () => {
    const { clearToken, navigate, dispatch } = intercept(new HttpErrorResponse({ status: 401 }));

    expect(clearToken).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(['/login']);
    expect(dispatch).toHaveBeenCalled();
  });
});
