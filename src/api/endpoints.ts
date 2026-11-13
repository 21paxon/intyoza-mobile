import { apiClient } from './client';
import type { ProfileInput, RegistrationInput } from '@/types/api';

const api = '/api/v1';

export const authApi = {
  register: (input: RegistrationInput) => apiClient.post(`${api}/auth/register`, input),
  login: (email: string, password: string) =>
    apiClient.post(`${api}/auth/login`, { email, password }),
  me: () => apiClient.get(`${api}/auth/me`),
  updateProfile: (input: ProfileInput) => apiClient.patch(`${api}/auth/profile`, input),
};

export const learningApi = {
  categories: () => apiClient.get(`${api}/learning/categories`),
  articles: (params?: { categoryId?: string; language?: string; isLowData?: boolean }) =>
    apiClient.get(`${api}/learning/articles`, { params }),
};

export const mythsApi = {
  list: (language?: string) => apiClient.get(`${api}/myths`, { params: { language } }),
};

export const facilitiesApi = {
  list: (params?: {
    district?: string;
    province?: string;
    sector?: string;
    cell?: string;
    serviceName?: string;
    isYouthFriendly?: string;
    isIsange?: string;
  }) => apiClient.get(`${api}/facilities`, { params }),
};

export const chatApi = {
  send: (message: string, sessionId?: string, suggestion?: string) =>
    apiClient.post(`${api}/ai/chat`, { message, sessionId, suggestion }),
};

export const communityApi = {
  spaces: () => apiClient.get(`${api}/community/spaces`),
  posts: (spaceId: string) =>
    apiClient.get(`${api}/community/spaces/${encodeURIComponent(spaceId)}/posts`),
  createPost: (spaceId: string, content: string) =>
    apiClient.post(`${api}/community/spaces/${encodeURIComponent(spaceId)}/posts`, { content }),
  report: (input: { postId?: string; commentId?: string; reason: string }) =>
    apiClient.post(`${api}/community/report`, input),
};

export const referralsApi = {
  create: (contactMethod: string, topic: string) =>
    apiClient.post(`${api}/professionals/referrals`, { contactMethod, topic }),
  mine: () => apiClient.get(`${api}/professionals/referrals`),
};
