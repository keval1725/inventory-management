import { Route } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { authFeature, AuthEffects } from '@inventory/identity-data-access';
import { LoginPageComponent } from './login-page/login-page.component';

export const identityFeatureRoutes: Route[] = [
  {
    path: '',
    component: LoginPageComponent,
    providers: [provideState(authFeature), provideEffects(AuthEffects)],
  },
];
