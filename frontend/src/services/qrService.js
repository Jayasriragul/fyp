import api from './api';

export const getMyQR = (eventId) => api.get(`/api/qr/my-qr/${eventId}`);
export const validateQR = (data) => api.post('/api/qr/validate', data);
export const resetQR = (registrationId) => api.post(`/api/qr/reset/${registrationId}`);
export const deactivateQR = (registrationId) => api.post(`/api/qr/deactivate/${registrationId}`);
