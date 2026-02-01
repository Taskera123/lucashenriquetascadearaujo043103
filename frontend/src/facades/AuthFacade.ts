import { AuthService } from '../services/AuthService';
import { auth$, clearAuth, setAuth } from '../state/auth.store';
import type { LoginRequest } from '../types/api';

export const AuthFacade = {
  async login(payload: LoginRequest) {
    const { data } = await AuthService.login(payload);
    const tokenWithType = data.tokenWithType ?? (data.type && data.token ? `${data.type} ${data.token}` : null);
    if (!tokenWithType) throw new Error('Token não retornado.');
    const expiresAt = data.expiresIn ? Date.now() + data.expiresIn : null;
    setAuth({ tokenWithType, expiresAt, username: payload.username });
    return tokenWithType;
  },
  async refresh() {
    const { data } = await AuthService.refresh();
    const tokenWithType = data.tokenWithType ?? (data.type && data.token ? `${data.type} ${data.token}` : null);
    if (!tokenWithType) throw new Error('Token não retornado.');
    const expiresAt = data.expiresIn ? Date.now() + data.expiresIn : null;
    setAuth({ tokenWithType, expiresAt, username: auth$.value.username ?? null });
    return tokenWithType;
  },
  logout() {
    clearAuth();
  }
};
