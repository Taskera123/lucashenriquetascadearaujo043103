import { BehaviorSubject } from 'rxjs';

export type AuthState = { tokenWithType: string | null; expiresAt: number | null; username?: string | null; };
const KEY = 'auth.state';

function load(): AuthState {
  try { return JSON.parse(localStorage.getItem(KEY) ?? 'null') ?? { tokenWithType: null, expiresAt: null, username: null }; }
  catch { return { tokenWithType: null, expiresAt: null, username: null }; }
}

export const auth$ = new BehaviorSubject<AuthState>(load());

export function setAuth(s: AuthState) { auth$.next(s); localStorage.setItem(KEY, JSON.stringify(s)); }
export function clearAuth() { setAuth({ tokenWithType: null, expiresAt: null, username: null }); }
export function isAuthenticated(s: AuthState) { return !!s.tokenWithType; }
