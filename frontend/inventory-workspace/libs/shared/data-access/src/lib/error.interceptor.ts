import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { catchError, throwError } from 'rxjs';
import { ProblemDetails } from '@inventory/shared-types';
import { TokenStorageService } from './token-storage.service';
import { NotificationActions } from './notification.actions';

export interface AppError {
  status: number;
  message: string;
}

/**
 * Normalizes every non-2xx response into the backend's ProblemDetails shape
 * (Result<T> failures and unhandled-exception responses use the same shape, per
 * backend-architecture.md §5) so callers never have to guess at a schema, and
 * raises one toast per failure so error handling isn't repeated in every effect
 * (frontend-architecture.md §7).
 *
 * The AppError is still rethrown: the toast is the ambient "something happened"
 * channel, while the rethrown error is what a specific screen reacts to.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorageService);
  const router = inject(Router);
  const store = inject(Store);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => error);
      }

      if (error.status === 401) {
        tokenStorage.clearToken();
        router.navigate(['/login']);
      }

      const problem = error.error as ProblemDetails | undefined;
      const appError: AppError = {
        status: error.status,
        message: problem?.detail ?? problem?.title ?? error.message ?? 'An unexpected error occurred.',
      };

      // 400s are field-level validation: they belong next to the offending
      // input, not in a corner of the screen. The form reads the rethrown error.
      if (error.status !== 400) {
        store.dispatch(NotificationActions.notify(toNotification(error.status, appError.message)));
      }

      return throwError(() => appError);
    }),
  );
};

/** Says what happened and what to do about it — never apologises, never stays vague. */
function toNotification(status: number, detailFromServer: string) {
  switch (status) {
    case 0:
      return {
        kind: 'error' as const,
        message: "Can't reach the server.",
        detail: 'Check your connection, then try again.',
      };
    case 401:
      return { kind: 'error' as const, message: 'Your session has expired.', detail: 'Sign in to continue.' };
    case 403:
      return {
        kind: 'error' as const,
        message: "You don't have permission to do that.",
        detail: 'Ask an administrator if you need access.',
      };
    case 404:
      return {
        kind: 'error' as const,
        message: 'That record no longer exists.',
        detail: 'Refresh to see the current list.',
      };
    case 409:
      return { kind: 'error' as const, message: detailFromServer, detail: 'Refresh and try again.' };
    default:
      return status >= 500
        ? { kind: 'error' as const, message: 'Something went wrong on the server.', detail: 'Try again in a moment.' }
        : { kind: 'error' as const, message: detailFromServer };
  }
}
