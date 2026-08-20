import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenStorageService } from './token-storage.service';

export const authGuard: CanActivateFn = () => {
  if (inject(TokenStorageService).getToken()) {
    return true;
  }

  return inject(Router).createUrlTree(['/login']);
};
