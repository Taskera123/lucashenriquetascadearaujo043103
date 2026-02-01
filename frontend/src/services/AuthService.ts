import { publicApi } from './publicApi';
import { api } from './api';
import type { LoginRequest, LoginResponse } from '../types/api';

export const AuthService = {
  login(payload: LoginRequest) {
    return publicApi.post<LoginResponse>('/auth/login', payload);
  },
  refresh() {
    return api.post<LoginResponse>('/auth/refresh', null);
  }
};
