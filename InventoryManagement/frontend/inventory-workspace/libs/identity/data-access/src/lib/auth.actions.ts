import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { LoginRequest, LoginResponseDto } from '@inventory/shared-types';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    Login: props<{ request: LoginRequest }>(),
    'Login Success': props<{ response: LoginResponseDto }>(),
    'Login Failure': props<{ message: string }>(),
    Logout: emptyProps(),
  },
});
