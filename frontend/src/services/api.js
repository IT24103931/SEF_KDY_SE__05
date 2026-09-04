import axios from 'axios';

// Keep the backend URL in one place so deployment only needs one environment change.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

// Attach the current tab's admin token to future protected API requests.
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('cleansl_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Fetch the summary used by the live statistics section on the home page.
const getSummaryStats = async () => {
  const response = await api.get('/reports/stats/summary');
  return response.data.data;
};

// Submit only user-entered fields; priority values are calculated by the backend.
const createReport = async (reportData) => {
  const response = await api.post('/reports', reportData);
  return response.data.data;
};

// Retrieve reports with the active search, filters, and sort order.
const getReports = async (params = {}) => {
  const response = await api.get('/reports', { params });
  return response.data;
};

// Authenticate an administrator without exposing credentials beyond the login request.
const adminLogin = async (credentials) => {
  const response = await api.post('/auth/admin-login', credentials);
  return response.data.data;
};

// Load administrator-only summary cards and report management data.
const getAdminStats = async () => (await api.get('/admin/stats')).data.data;
const getAdminReports = async (params = {}) => (await api.get('/admin/reports', { params })).data;
const getAuditLogs = async () => (await api.get('/admin/audit-logs')).data.data;

// Send one focused management action to the protected admin API.
const updateAdminReport = async (id, action, value) => {
  const endpoint = action === 'status' ? `/admin/reports/${id}/status` : action === 'verify' ? `/admin/reports/${id}/verify` : `/admin/reports/${id}/note`;
  const body = action === 'status' ? { status: value } : action === 'verify' ? { verified: value } : { adminNote: value };
  return (await api.patch(endpoint, body)).data.data;
};

// Archive an inappropriate or duplicate report without destroying its database record.
const archiveAdminReport = async (id) => (await api.delete(`/admin/reports/${id}`)).data;

export { adminLogin, api, archiveAdminReport, createReport, getAdminReports, getAdminStats, getAuditLogs, getReports, getSummaryStats, updateAdminReport };