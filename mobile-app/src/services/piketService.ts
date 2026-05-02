import api from '../utils/api';

export const piketService = {
  getStatus: () => api.get('/piket/status').then(r => r.data),
  setStatus: (is_ready: boolean) => api.post('/piket/status', { is_ready }).then(r => r.data),
  getDailyLog: () => api.get('/piket/daily-log').then(r => r.data),
  validateQR: (qr_token: string) => api.post('/piket/validate-qr', { qr_token }).then(r => r.data),
};
