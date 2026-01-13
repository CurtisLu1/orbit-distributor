import { api } from './client';

export interface DistributorWithStats {
  id: string;
  name: string;
  email: string;
  code_prefix?: string;
  commission_rate: number;
  is_active: boolean;
  created_at: string;
  total_generated: number;
  total_redeemed: number;
}

export const adminApi = {
  generateCodes: async (adminKey: string, codeType: string, count: number, prefix?: string) => {
    const res = await api.post('/admin/codes/generate', {
      admin_key: adminKey,
      type: codeType,
      count,
      prefix,
    });
    return res.data;
  },

  listDistributors: async (adminKey: string) => {
    const res = await api.post('/admin/distributors/list', {
      admin_key: adminKey,
    });
    return res.data;
  },

  createDistributor: async (
    adminKey: string,
    data: { name: string; email: string; password: string; commission_rate: number; code_prefix?: string }
  ) => {
    const res = await api.post('/admin/distributors', {
      admin_key: adminKey,
      ...data,
    });
    return res.data;
  },

  updateStatus: async (adminKey: string, distributorId: string, isActive: boolean) => {
    const res = await api.post('/admin/distributors/status', {
      admin_key: adminKey,
      distributor_id: distributorId,
      is_active: isActive,
    });
    return res.data;
  },

  updateCommission: async (adminKey: string, distributorId: string, rate: number) => {
    const res = await api.post('/admin/distributors/commission', {
      admin_key: adminKey,
      distributor_id: distributorId,
      commission_rate: rate,
    });
    return res.data;
  },
};
