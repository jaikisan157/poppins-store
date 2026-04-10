import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SERVER_URL = API_URL.replace(/\/api\/?$/, '');

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Resolve image URLs — if it's a relative /uploads path, prepend server URL
export function getImageUrl(url: string | undefined): string {
  if (!url) return 'https://placehold.co/600x400?text=No+Image';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads')) return `${SERVER_URL}${url}`;
  return url;
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const path = window.location.pathname;
    if (error.response?.status === 401) {
      if (!path.includes('/login') && !path.includes('/signup') && !path.includes('/admin')) {
        localStorage.removeItem('token');
        window.location.href = '/';
      }
    }
    if (error.response?.status === 403 && path.startsWith('/admin')) {
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Product APIs
export const productsApi = {
  getAll: (params?: any) => api.get('/products', { params }),
  getFeatured: () => api.get('/products/featured'),
  getById: (id: string) => api.get(`/products/${id}`),
  trackClick: (id: string) => api.post(`/products/${id}/click`),
};

// Admin APIs
export const adminApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/admin/login', data),
  getDashboard: () => api.get('/admin/dashboard'),
  getAnalytics: () => api.get('/admin/analytics'),
  // Projects
  getProducts: (params?: any) => api.get('/admin/products', { params }),
  createProduct: (data: FormData) => api.post('/admin/products', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateProduct: (id: string, data: FormData) => api.put(`/admin/products/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteProduct: (id: string) => api.delete(`/admin/products/${id}`),
  uploadImages: (data: FormData) => api.post('/admin/upload', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  // Settings
  getSettings: () => api.get('/admin/settings'),
};

// Analytics tracking (for frontend to send page visits)
export const analyticsTrackingApi = {
  track: (data: any) => api.post('/analytics/track', data),
  update: (data: any) => api.post('/analytics/update', data),
};
