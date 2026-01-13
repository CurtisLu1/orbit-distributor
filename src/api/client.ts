import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://orbit-api.makeliving.fun';

export const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 添加请求拦截器，自动添加 token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('distributor_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
