import api from './api';

const BASE = '/api/export';

export const exportUsers = () =>
  api.get(`${BASE}/users`, { responseType: 'blob' });

export const exportAttendance = (eventId) =>
  api.get(`${BASE}/attendance/${eventId}`, { responseType: 'blob' });

export const exportMeals = (eventId) =>
  api.get(`${BASE}/meals/${eventId}`, { responseType: 'blob' });

export const exportFeedback = (eventId) =>
  api.get(`${BASE}/feedback/${eventId}`, { responseType: 'blob' });

export const downloadBadge = (registrationId) =>
  api.get(`${BASE}/badge/${registrationId}`, { responseType: 'blob' });

export const downloadEntryPass = (registrationId) =>
  api.get(`${BASE}/entry-pass/${registrationId}`, { responseType: 'blob' });

export const downloadCertificate = (registrationId) =>
  api.get(`${BASE}/certificate/${registrationId}`, { responseType: 'blob' });

/** Helper to trigger browser download from a blob response */
export const downloadBlob = (response, filename) => {
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
