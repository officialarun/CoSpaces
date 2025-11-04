import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
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
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// Admin User Management APIs
export const adminUserAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deactivateUser: (id) => api.delete(`/admin/users/${id}`),
  getOnboardingStatus: (id) => api.get(`/admin/users/${id}/onboarding-status`),
};

// Admin Project Management APIs
export const adminProjectAPI = {
  getProjects: (params) => api.get('/admin/projects', { params }),
  recalcFunding: () => api.post('/admin/projects/recalculate-funding'),
  createProject: (formData) => api.post('/admin/projects', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateProject: (id, formData) => api.put(`/admin/projects/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  publishProject: (id) => api.put(`/admin/projects/${id}/publish`),
  unpublishProject: (id) => api.put(`/admin/projects/${id}/unpublish`),
  deleteProject: (id) => api.delete(`/admin/projects/${id}`),
  assignSPV: (projectId, spvId) => api.post(`/admin/projects/${projectId}/assign-spv`, { spvId }),
  assignAssetManager: (projectId, assetManagerId) => api.post(`/admin/projects/${projectId}/assign-asset-manager`, { assetManagerId }),
};

// Trust APIs
export const adminTrustAPI = {
  getTrusts: () => api.get('/admin/trusts'),
  createTrust: (data) => api.post('/admin/trusts', data),
  updateTrust: (id, data) => api.put(`/admin/trusts/${id}`, data),
  deleteTrust: (id) => api.delete(`/admin/trusts/${id}`),
};

// SPV APIs
export const adminSPVAPI = {
  getSPVs: (params) => api.get('/admin/spvs', { params }),
  createSPV: (data) => api.post('/admin/spvs', data),
  updateSPV: (id, data) => api.put(`/admin/spvs/${id}`, data),
  deleteSPV: (id) => api.delete(`/admin/spvs/${id}`),
};

// Admin KYC Management APIs
export const adminKYCAPI = {
  getPendingKYC: () => api.get('/admin/kyc/pending'),
  getAllKYC: (params) => api.get('/admin/kyc/all', { params }),
  approveKYC: (userId) => api.put(`/admin/kyc/${userId}/approve`),
  rejectKYC: (userId, reason) => api.put(`/admin/kyc/${userId}/reject`, { reason }),
};

// Admin Stats APIs
export const adminStatsAPI = {
  getStats: () => api.get('/admin/stats'),
  getActivity: () => api.get('/admin/activity'),
};

// Admin Staff Management APIs
export const adminStaffAPI = {
  getStaff: (params) => api.get('/admin/staff', { params }),
  createStaff: (data) => api.post('/admin/staff/create', data),
};

// Admin Distribution APIs
export const adminDistributionAPI = {
  getAllDistributions: (params) => api.get('/distributions', { params }),
  getDistributionById: (id) => api.get(`/distributions/${id}`),
  createDistribution: (data) => api.post('/distributions/calculate', data),
  updateDistribution: (id, data) => api.put(`/distributions/${id}`, data),
  cancelDistribution: (id, reason) => api.put(`/distributions/${id}/cancel`, { reason }),
  approveAsAssetManager: (id, comments) => api.put(`/distributions/${id}/approve/asset-manager`, { comments }),
  approveAsCompliance: (id, comments) => api.put(`/distributions/${id}/approve/compliance`, { comments }),
  approveAsAdmin: (id, comments) => api.put(`/distributions/${id}/approve/admin`, { comments }),
  processPayments: (id) => api.post(`/distributions/${id}/process-payments`),
  markInvestorPaid: (id, investorId, data) => api.put(`/distributions/${id}/investor/${investorId}/mark-paid`, data),
};

export default api;

