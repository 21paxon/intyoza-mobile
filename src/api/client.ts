import { create } from 'axios';
import * as SecureStore from 'expo-secure-store';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ??
  'https://intyoza-backend.onrender.com';

const tokenKey = 'intyoza.auth.token';
let unauthorizedHandler: (() => void) | undefined;

export const setUnauthorizedHandler = (handler?: () => void) => {
  unauthorizedHandler = handler;
};

export const tokenStorage = {
  get: () => SecureStore.getItemAsync(tokenKey),
  set: (token: string) => SecureStore.setItemAsync(tokenKey, token),
  clear: () => SecureStore.deleteItemAsync(tokenKey),
};

export const apiClient = create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await tokenStorage.clear();
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  },
);
