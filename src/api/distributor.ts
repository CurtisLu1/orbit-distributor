import { api } from './client';

export interface LoginResponse {
  success: boolean;
  token?: string;
  error?: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  commission_rate: number;
}

export interface CodeInfo {
  code: string;
  code_type: string;
  duration_days: number;
  created_at: string;
  redeemed_at: string | null;
  is_active: boolean;
}

export interface Stats {
  total_generated: number;
  total_redeemed: number;
  pending_settlement: number;
}

export const distributorApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const res = await api.post('/distributor/login', { email, password });
    return res.data;
  },

  getProfile: async (): Promise<{ success: boolean; data?: Profile; error?: string }> => {
    const res = await api.get('/distributor/profile');
    return res.data;
  },

  generateCodes: async (type: string, count: number) => {
    const res = await api.post('/distributor/codes/generate', { type, count });
    return res.data;
  },

  listCodes: async (): Promise<{ success: boolean; codes?: CodeInfo[]; error?: string }> => {
    const res = await api.get('/distributor/codes');
    return res.data;
  },

  getStats: async (): Promise<{ success: boolean; stats?: Stats; error?: string }> => {
    const res = await api.get('/distributor/stats');
    return res.data;
  },
};
