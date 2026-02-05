import { BehaviorSubject } from 'rxjs';

export type RateLimitState = {
  active: boolean;
  resetAt: number | null;
  message: string;
};

const initialState: RateLimitState = {
  active: false,
  resetAt: null,
  message: 'Muitas requisições ao mesmo tempo. Apenas 10 por minuto. Aguarde 1min e tente novamente.'
};

export const rateLimit$ = new BehaviorSubject<RateLimitState>(initialState);

export function setRateLimit(state: Partial<RateLimitState>) {
  rateLimit$.next({ ...rateLimit$.value, ...state, active: true });
}

export function clearRateLimit() {
  rateLimit$.next({ ...rateLimit$.value, active: false, resetAt: null });
}
