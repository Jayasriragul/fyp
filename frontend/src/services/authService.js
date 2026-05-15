import api from './api';

export const registerUser = (data) => api.post('/api/auth/register', data);
export const loginUser = (data) => api.post('/api/auth/login', data);
export const loginAdmin = (data) => api.post('/api/auth/admin/login', data);
export const getMe = () => api.get('/api/auth/me');
export const forgotPassword = (data) => api.post('/api/auth/forgot-password', data);
export const updateProfile = (data) => api.put('/api/auth/update-profile', data);
