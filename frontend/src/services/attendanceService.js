import api from './api';

export const scanEntry = (data) => api.post('/api/attendance/scan', data);
export const getEventAttendance = (eventId, day) =>
  api.get(`/api/attendance/event/${eventId}${day ? `?day=${day}` : ''}`);
export const getAttendanceStats = (eventId) => api.get(`/api/attendance/event/${eventId}/stats`);
export const getScanLogs = (eventId, limit = 50) => api.get(`/api/attendance/logs/${eventId}?limit=${limit}`);

export const scanMeal = (data) => api.post('/api/meals/scan', data);
export const getEventMeals = (eventId, day, mealType) => {
  const params = new URLSearchParams();
  if (day) params.append('day', day);
  if (mealType) params.append('meal_type', mealType);
  return api.get(`/api/meals/event/${eventId}?${params}`);
};
export const getMealStats = (eventId) => api.get(`/api/meals/event/${eventId}/stats`);

export const scanWelcomeKit = (data) => api.post('/api/welcome-kits/scan', data);
export const getEventKits = (eventId) => api.get(`/api/welcome-kits/event/${eventId}`);
