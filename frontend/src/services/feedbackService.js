import api from './api';

export const submitFeedback = (data) => api.post('/api/feedback', data);
export const getEventFeedback = (eventId) => api.get(`/api/feedback/event/${eventId}`);
export const getMyFeedback = (eventId) => api.get(`/api/feedback/my/${eventId}`);

export const getNotifications = (limit = 20) => api.get(`/api/notifications?limit=${limit}`);
export const markNotifRead = (id) => api.put(`/api/notifications/read/${id}`);
export const markAllRead = () => api.put('/api/notifications/read-all');

export const getDashboard = () => api.get('/api/admin/dashboard');
export const getEventAnalytics = (eventId) => api.get(`/api/admin/analytics/${eventId}`);
export const getAllUsers = () => api.get('/api/admin/users');
export const toggleBlacklist = (userId) => api.put(`/api/admin/users/${userId}/blacklist`);
export const getFraudLogs = (eventId) =>
  api.get(`/api/admin/fraud-logs${eventId ? `?event_id=${eventId}` : ''}`);
export const resolveFraud = (logId) => api.put(`/api/admin/fraud-logs/${logId}/resolve`);
