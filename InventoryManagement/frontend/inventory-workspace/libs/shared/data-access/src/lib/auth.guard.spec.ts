import { Injector, runInInjectionContext } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { TokenStorageService } from './token-storage.service';

function runGuard(tokenStorage: Partial<TokenStorageService>, router: Partial<Router>) {
  const injector = Injector.create({
    providers: [
      { provide: TokenStorageService, useValue: tokenStorage },
      { provide: Router, useValue: router },
    ],
  });

  return runInInjectionContext(injector, () => authGuard({} as never, {} as never));
}

describe('authGuard', () => {
  it('allows navigation when a token is present', () => {
    const result = runGuard({ getToken: () => 'a-token' }, { createUrlTree: jest.fn() });

    expect(result).toBe(true);
  });

  it('redirects to /login when no token is present', () => {
    const urlTree = {} as UrlTree;
    const createUrlTree = jest.fn().mockReturnValue(urlTree);

    const result = runGuard({ getToken: () => null }, { createUrlTree });

    expect(result).toBe(urlTree);
    expect(createUrlTree).toHaveBeenCalledWith(['/login']);
  });
});
