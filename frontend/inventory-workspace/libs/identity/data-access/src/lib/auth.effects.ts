import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { AppError, TokenStorageService } from '@inventory/shared-data-access';
import { AuthActions } from './auth.actions';
import { AuthApiService } from './auth-api.service';

@Injectable()
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly authApi = inject(AuthApiService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ request }) =>
        this.authApi.login(request).pipe(
          map((response) => AuthActions.loginSuccess({ response })),
          catchError((error: AppError) => of(AuthActions.loginFailure({ message: error.message }))),
        ),
      ),
    ),
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ response }) => {
          this.tokenStorage.setToken(response.token);
          this.router.navigate(['/warehouses']);
        }),
      ),
    { dispatch: false },
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          this.tokenStorage.clearToken();
          this.router.navigate(['/login']);
        }),
      ),
    { dispatch: false },
  );
}
