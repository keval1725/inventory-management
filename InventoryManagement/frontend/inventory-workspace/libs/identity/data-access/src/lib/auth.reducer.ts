import { createFeature, createReducer, on } from '@ngrx/store';
import { AuthActions } from './auth.actions';

export interface AuthState {
  userId: string | null;
  email: string | null;
  role: string | null;
  isAuthenticating: boolean;
  error: string | null;
}

export const initialAuthState: AuthState = {
  userId: null,
  email: null,
  role: null,
  isAuthenticating: false,
  error: null,
};

export const authFeature = createFeature({
  name: 'auth',
  reducer: createReducer(
    initialAuthState,
    on(AuthActions.login, (state) => ({ ...state, isAuthenticating: true, error: null })),
    on(AuthActions.loginSuccess, (state, { response }) => ({
      ...state,
      isAuthenticating: false,
      userId: response.userId,
      email: response.email,
      role: response.role,
    })),
    on(AuthActions.loginFailure, (state, { message }) => ({
      ...state,
      isAuthenticating: false,
      error: message,
    })),
    on(AuthActions.logout, () => initialAuthState),
  ),
});
