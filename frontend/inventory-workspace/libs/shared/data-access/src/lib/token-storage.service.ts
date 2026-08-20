import { Injectable } from '@angular/core';

const STORAGE_KEY = 'inventory_auth_token';

/** `ClaimTypes.Role` as the .NET token handler writes it into the payload. */
const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

export interface SessionUser {
  id: string;
  email: string;
  role: string;
}

/**
 * Reads the JWT payload without verifying the signature — for display only
 * (the account block in the sidebar, hiding actions the server would reject
 * anyway). Every real authorization decision is the API's; anything derived
 * here is a hint, and a tampered token simply gets a 401 or 403 back.
 */
function decodePayload(token: string): Record<string, unknown> | null {
  const segment = token.split('.')[1];

  if (!segment) {
    return null;
  }

  try {
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
    const bytes = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
    const json = decodeURIComponent(
      bytes
        .split('')
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    );

    return JSON.parse(json);
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(STORAGE_KEY, token);
  }

  clearToken(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  /** The signed-in user as the token describes them, or null if there is no usable token. */
  getUser(): SessionUser | null {
    const token = this.getToken();
    const payload = token ? decodePayload(token) : null;

    if (!payload) {
      return null;
    }

    return {
      id: String(payload['sub'] ?? ''),
      email: String(payload['email'] ?? ''),
      role: String(payload[ROLE_CLAIM] ?? ''),
    };
  }
}
