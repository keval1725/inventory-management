import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AuthActions, authFeature } from '@inventory/identity-data-access';

@Component({
  selector: 'inv-login-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {
  private readonly store = inject(Store);
  private readonly formBuilder = inject(FormBuilder);

  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  readonly isAuthenticating = this.store.selectSignal(authFeature.selectIsAuthenticating);
  readonly error = this.store.selectSignal(authFeature.selectError);

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    this.store.dispatch(AuthActions.login({ request: this.form.getRawValue() }));
  }
}
