import api from './api';

// Removes empty filter values so they are not sent as query parameters
const cleanParams = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined));

const transactionService = {
  getAll: (params) => api.get('/transactions', { params: cleanParams(params) }).then((res) => res.data.data),
  getById: (id) => api.get(`/transactions/${id}`).then((res) => res.data.data),
  getRecurring: () => api.get('/transactions/recurring').then((res) => res.data.data),
  create: (data) => api.post('/transactions', data).then((res) => res.data.data),
  update: (id, data) => api.put(`/transactions/${id}`, data).then((res) => res.data.data),
  remove: (id) => api.delete(`/transactions/${id}`).then((res) => res.data),
};

export default transactionService;
