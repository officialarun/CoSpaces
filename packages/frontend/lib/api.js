import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
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
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Auth APIs
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  verifyMFALogin: (data) => api.post('/auth/mfa/verify-login', data),
  setupMFA: () => api.post('/auth/mfa/setup'),
  verifyMFA: (token) => api.post('/auth/mfa/verify', { token }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  updateBankDetails: (data) => api.put('/users/bank-details', data),
};

// KYC APIs
export const kycAPI = {
  submitKYC: (data) => api.post('/kyc/submit', data),
  getKYCStatus: () => api.get('/kyc/status'),
  updateKYC: (data) => api.put('/kyc/update', data),
  uploadDocument: (data) => api.post('/kyc/upload-document', data),
  runAMLScreening: () => api.post('/kyc/aml-screening'),
};

// Project APIs
export const projectAPI = {
  getListedProjects: () => api.get('/projects/listed'),
  getProjects: (params) => api.get('/projects', { params }),
  getProjectById: (id) => api.get(`/projects/${id}`),
  createProject: (data) => api.post('/projects', data),
  updateProject: (id, data) => api.put(`/projects/${id}`, data),
};

// SPV APIs
export const spvAPI = {
  getAllSPVs: (params) => api.get('/spv', { params }),
  getSPVById: (id) => api.get(`/spv/${id}`),
  getCapTable: (id) => api.get(`/spv/${id}/captable`),
  createSPV: (data) => api.post('/spv', data),
};

// Subscription APIs
export const subscriptionAPI = {
  createSubscription: (data) => api.post('/subscriptions', data),
  getMySubscriptions: () => api.get('/subscriptions/my-subscriptions'),
  getSubscriptionById: (id) => api.get(`/subscriptions/${id}`),
  signDocuments: (id, data) => api.post(`/subscriptions/${id}/sign-documents`, data),
  uploadPaymentProof: (id, data) => api.post(`/subscriptions/${id}/upload-payment-proof`, data),
  cancelSubscription: (id, reason) => api.put(`/subscriptions/${id}/cancel`, { reason }),
};

// Distribution APIs
export const distributionAPI = {
  getMyDistributions: () => api.get('/distributions/my-distributions'),
  getDistributionById: (id) => api.get(`/distributions/${id}`),
};

// Report APIs
export const reportAPI = {
  getPortfolio: () => api.get('/reports/portfolio'),
  getTaxReport: (userId, params) => api.get(`/reports/tax/${userId}`, { params }),
  getCapitalAccount: (userId) => api.get(`/reports/capital-account/${userId}`),
};

// Compliance APIs
export const complianceAPI = {
  checkInvestorEligibility: (spvId) => api.post('/compliance/check-investor-eligibility', { spvId }),
  getComplianceDashboard: () => api.get('/compliance/dashboard'),
};

export default api;

