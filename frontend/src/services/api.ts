import axios, { AxiosError } from 'axios';
import { auth$, clearAuth, setAuth } from '../state/auth.store';
import { setRateLimit } from '../state/rateLimit.store';
import type { LoginResponse } from '../types/api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/albumartistaapi';

export const api = axios.create({ baseURL: BASE_URL, timeout: 30_000 });

api.interceptors.request.use((config) => {
  const token = auth$.value.tokenWithType;
  if (token) config.headers.Authorization = token;
  return config;
});

let refreshing: Promise<string | null> | null = null;

async function refreshToken(): Promise<string | null> {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    const token = auth$.value.tokenWithType;
    if (!token) return null;

    try {
      const { data } = await axios.post<LoginResponse>(`${BASE_URL}/auth/refresh`, null, { headers: { Authorization: token } });
      const tokenWithType = data.tokenWithType ?? (data.type && data.token ? `${data.type} ${data.token}` : null);
      if (!tokenWithType) return null;
      const expiresAt = data.expiresIn ? Date.now() + data.expiresIn : null;
      setAuth({ tokenWithType, expiresAt });
      return tokenWithType;
    } catch {
      clearAuth();
      return null;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original: any = error.config;
    if (error.response?.status === 401 && !original?._retry) {
      original._retry = true;
      const newToken = await refreshToken();
      if (newToken) {
        original.headers = original.headers ?? {};
        original.headers.Authorization = newToken;
        return api.request(original);
      }
    }
    if (error.response?.status === 429) {
      const message = 'Muitas requisições ao mesmo tempo. Apenas 10 por minuto. Aguarde 1min e tente novamente.';
      const retryAfter = error.response?.headers?.['retry-after'];
      let resetAt: number | null = null;
      if (retryAfter) {
        const retryAsNumber = Number(retryAfter);
        if (!Number.isNaN(retryAsNumber)) {
          resetAt = Date.now() + retryAsNumber * 1000;
        } else {
          const retryAsDate = new Date(retryAfter);
          if (!Number.isNaN(retryAsDate.getTime())) {
            resetAt = retryAsDate.getTime();
          }
        }
      }
      setRateLimit({ message, resetAt });
      return Promise.reject(new Error(message));
    }
    return Promise.reject(error);
  }
);
