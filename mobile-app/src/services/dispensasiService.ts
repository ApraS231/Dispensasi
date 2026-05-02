import api from '../utils/api';

export const dispensasiService = {
  getMyTickets: () => api.get('/dispensasi/me').then(r => r.data),
  getAll: () => api.get('/dispensasi').then(r => r.data),
  getPending: () => api.get('/dispensasi/pending').then(r => r.data),
  getById: (id: string) => api.get(`/dispensasi/${id}`).then(r => r.data),
  store: (formData: FormData) => api.post('/dispensasi', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  approve: (id: string) => api.post(`/dispensasi/${id}/approve`),
  reject: (id: string, catatan: string) => 
    api.post(`/dispensasi/${id}/reject`, { catatan_penolakan: catatan }),
  monitoringAnak: () => api.get('/monitoring/anak').then(r => r.data),
  sendChat: (id: string, pesan: string) => api.post(`/dispensasi/${id}/chats`, { pesan }),
};
