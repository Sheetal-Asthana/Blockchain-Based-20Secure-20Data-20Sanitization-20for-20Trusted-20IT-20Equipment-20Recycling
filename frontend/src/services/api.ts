import { APIResponse, PaginatedResponse } from '../../../shared/types';

class ApiService {
  private baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return data;
  }

  async get<T>(endpoint: string): Promise<APIResponse<T>> {
    const url = `${this.baseURL}/api${endpoint}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse<APIResponse<T>>(response);
  }

  async post<T>(endpoint: string, data?: any): Promise<APIResponse<T>> {
    const url = `${this.baseURL}/api${endpoint}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined
    });
    
    return this.handleResponse<APIResponse<T>>(response);
  }

  async put<T>(endpoint: string, data?: any): Promise<APIResponse<T>> {
    const url = `${this.baseURL}/api${endpoint}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined
    });
    
    return this.handleResponse<APIResponse<T>>(response);
  }

  async delete<T>(endpoint: string): Promise<APIResponse<T>> {
    const url = `${this.baseURL}/api${endpoint}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    
    return this.handleResponse<APIResponse<T>>(response);
  }

  // Asset-specific methods
  async getAssets(page = 1, limit = 10) {
    return this.get<PaginatedResponse>(`/assets?page=${page}&limit=${limit}`);
  }

  async getAsset(id: string) {
    return this.get(`/assets/${id}`);
  }

  async createAsset(assetData: any) {
    return this.post('/assets/test', assetData);
  }

  async updateAsset(id: string, assetData: any) {
    return this.put(`/assets/${id}`, assetData);
  }

  async deleteAsset(id: string) {
    return this.delete(`/assets/${id}`);
  }

  // Blockchain-specific methods
  async getBlockchainStatus() {
    return this.get('/blockchain-status');
  }

  async getTotalAssets() {
    return this.get('/blockchain/assets/total');
  }

  async getBlockchainAsset(id: number) {
    return this.get(`/blockchain/assets/${id}`);
  }

  async checkSerialNumber(serialNumber: string) {
    return this.get(`/blockchain/check-serial/${serialNumber}`);
  }

  async getAssetsByStatus(status: number, offset = 0, limit = 10) {
    return this.get(`/blockchain/assets-by-status/${status}?offset=${offset}&limit=${limit}`);
  }

  // Bulk operations
  async bulkRegisterAssets(assets: any[]) {
    return this.post('/bulk/register', { assets });
  }

  async bulkSanitizeAssets(assets: any[]) {
    return this.post('/bulk/sanitize', { assets });
  }

  async bulkRecycleAssets(assetIds: string[]) {
    return this.post('/bulk/recycle', { assetIds });
  }

  async importAssetsFromCSV(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${this.baseURL}/api/bulk/import-csv`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: formData
    });
    
    return this.handleResponse(response);
  }

  async exportAssetsToCSV() {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${this.baseURL}/api/bulk/export-csv`, {
      method: 'GET',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    return response.blob();
  }

  // Analytics
  async getAnalytics(dateRange?: { start: Date; end: Date }) {
    const params = new URLSearchParams();
    if (dateRange) {
      params.append('start', dateRange.start.toISOString());
      params.append('end', dateRange.end.toISOString());
    }
    
    return this.get(`/analytics?${params.toString()}`);
  }

  async getESGMetrics() {
    return this.get('/analytics/esg');
  }

  async getComplianceReport() {
    return this.get('/analytics/compliance');
  }
}

export const apiService = new ApiService();