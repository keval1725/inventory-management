import { TokenStorageService } from './token-storage.service';

const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

/** UTF-8 then base64url, exactly as the .NET token handler writes a payload. */
function base64Url(value: object): string {
  const utf8 = encodeURIComponent(JSON.stringify(value)).replace(/%([0-9A-F]{2})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16)),
  );

  return btoa(utf8).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fakeToken(payload: Record<string, unknown>): string {
  return `${base64Url({ alg: 'HS256', typ: 'JWT' })}.${base64Url(payload)}.not-a-real-signature`;
}

describe('TokenStorageService', () => {
  let service: TokenStorageService;

  beforeEach(() => {
    localStorage.clear();
    service = new TokenStorageService();
  });

  it('round-trips a token', () => {
    service.setToken('a-token');

    expect(service.getToken()).toBe('a-token');

    service.clearToken();

    expect(service.getToken()).toBeNull();
  });

  it('reads the id, email and role claims the API issues', () => {
    service.setToken(
      fakeToken({
        sub: '8f14e45f-ceea-467a-9c1a-000000000001',
        email: 'admin@inventory.local',
        [ROLE_CLAIM]: 'Admin',
      }),
    );

    expect(service.getUser()).toEqual({
      id: '8f14e45f-ceea-467a-9c1a-000000000001',
      email: 'admin@inventory.local',
      role: 'Admin',
    });
  });

  it('has no user when there is no token', () => {
    expect(service.getUser()).toBeNull();
  });

  it('has no user when the token is not a readable JWT', () => {
    service.setToken('not.a.jwt');

    expect(service.getUser()).toBeNull();
  });

  it('reads a payload containing non-ASCII characters', () => {
    service.setToken(fakeToken({ sub: '1', email: 'jürgen@inventory.local', [ROLE_CLAIM]: 'Purchasing' }));

    expect(service.getUser()?.email).toBe('jürgen@inventory.local');
  });
});
