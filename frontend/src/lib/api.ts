import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API methods
export const apiClient = {
  // Health check
  health: () => api.get('/health'),
  
  // Auth
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  register: (userData: { email: string; password: string; name: string }) =>
    api.post('/auth/register', userData),
  
  // Assets
  getAssets: (params?: any) => api.get('/assets', { params }),
  
  createAsset: (assetData: any) => api.post('/assets', assetData),
  
  getAsset: (id: string) => api.get(`/assets/${id}`),
  
  // Blockchain
  getBlockchainStatus: () => api.get('/blockchain/status'),
  
  getTotalAssets: () => api.get('/blockchain/assets/total'),
  
  // Bulk operations
  bulkRegister: (data: any) => api.post('/bulk/register', data),
  
  exportCSV: (params?: any) => api.get('/bulk/export-csv', { params }),
};

export default api;