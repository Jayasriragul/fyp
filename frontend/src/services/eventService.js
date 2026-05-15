import api from './api';

export const getEvents = () => api.get('/api/events');
export const getAllEvents = () => api.get('/api/events/all');
export const getEvent = (id) => api.get(`/api/events/${id}`);
export const createEvent = (data) => api.post('/api/events', data, {
  headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
});
export const updateEvent = (id, data) => api.put(`/api/events/${id}`, data, {
  headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
});
export const deleteEvent = (id) => api.delete(`/api/events/${id}`);
export const registerForEvent = (eventId) => api.post(`/api/events/${eventId}/register`);
export const getMyEvents = () => api.get('/api/events/my-events');
