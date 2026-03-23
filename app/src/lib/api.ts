import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
      // Don't redirect if already on login/signup/admin page
      if (!path.includes('/login') && !path.includes('/signup') && !path.includes('/admin')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    if (error.response?.status === 403 && path.startsWith('/admin')) {
      // Admin access denied — redirect to admin login
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
  checkDelivery: (id: string, data: { countryCode: string; zipCode?: string }) =>
    api.post(`/products/${id}/check-delivery`, data),
  trackClick: (id: string) => api.post(`/products/${id}/click`),
};

// Cart APIs
export const cartApi = {
  get: () => api.get('/cart'),
  add: (data: { productId: string; quantity?: number; variant?: any }) =>
    api.post('/cart/add', data),
  update: (data: { productId: string; quantity: number; variant?: any }) =>
    api.put('/cart/update', data),
  remove: (data: { productId: string; variant?: any }) =>
    api.delete('/cart/remove', { data }),
  clear: () => api.delete('/cart/clear'),
};

// Order APIs
export const ordersApi = {
  getMyOrders: () => api.get('/orders/my'),
  checkout: (data: any) => api.post('/orders/checkout', data),
};

// Tracking APIs
export const trackingApi = {
  trackOrder: (trackingNumber: string) =>
    api.get(`/orders/track/${trackingNumber}`),
};

// Admin APIs
export const adminApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/admin/login', data),
  getDashboard: () => api.get('/admin/dashboard'),
  getAnalytics: () => api.get('/admin/analytics'),
  // Products
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
  // Orders
  getOrders: (params?: any) => api.get('/admin/orders', { params }),
  updateOrderStatus: (id: string, data: any) => api.put(`/admin/orders/${id}/status`, data),
  updateOrderTracking: (id: string, data: any) => api.put(`/admin/orders/${id}/tracking`, data),
  // Customers
  getCustomers: (params?: any) => api.get('/admin/customers', { params }),
  flagCustomer: (id: string, data: { isFlagged: boolean; flagReason?: string }) =>
    api.put(`/admin/customers/${id}/flag`, data),
  // Settings
  getSettings: () => api.get('/admin/settings'),
};

// Analytics tracking (for frontend to send page visits)
export const analyticsTrackingApi = {
  track: (data: any) => api.post('/analytics/track', data),
  update: (data: any) => api.post('/analytics/update', data),
};
