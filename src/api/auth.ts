import { request } from './http';

export type LoginResponse = {
  user: { id: string; email: string; name: string };
  accessToken: string;
  refreshToken: string;
};

export type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
};

export type MeUser = {
  id: string;
  email: string;
  name: string;
  role: 'READ_ONLY' | 'ADMIN';
};

export type MeResponse = {
  user: MeUser;
};

export function login(email: string, password: string): Promise<LoginResponse> {
  return request<LoginResponse>('/api/v1/auth/login', {
    method: 'POST',
    skipAuth: true,
    skipRefreshRetry: true,
    body: JSON.stringify({ email, password }),
  });
}

let refreshInFlight: Promise<RefreshResponse> | null = null;
let refreshInFlightToken: string | null = null;

export function refreshAuth(refreshToken: string): Promise<RefreshResponse> {
  if (refreshInFlight !== null && refreshInFlightToken === refreshToken) {
    return refreshInFlight;
  }

  refreshInFlightToken = refreshToken;
  refreshInFlight = request<RefreshResponse>('/api/v1/auth/refresh', {
    method: 'POST',
    skipAuth: true,
    skipRefreshRetry: true,
    body: JSON.stringify({ refreshToken }),
  }).finally(() => {
    refreshInFlight = null;
    refreshInFlightToken = null;
  });

  return refreshInFlight;
}

export function logout(refreshToken: string): Promise<void> {
  return request<void>('/api/v1/auth/logout', {
    method: 'POST',
    skipRefreshRetry: true,
    body: JSON.stringify({ refreshToken }),
  });
}

export function getMe(): Promise<MeResponse> {
  return request<MeResponse>('/api/v1/auth/me');
}
