import api from './api';

const budgetService = {
  getAll: (month, year) => api.get('/budgets', { params: { month, year } }).then((res) => res.data.data),
  getAlerts: (month, year) => api.get('/budgets/alerts', { params: { month, year } }).then((res) => res.data.data),
  getById: (id) => api.get(`/budgets/${id}`).then((res) => res.data.data),
  create: (data) => api.post('/budgets', data).then((res) => res.data.data),
  update: (id, data) => api.put(`/budgets/${id}`, data).then((res) => res.data.data),
  remove: (id) => api.delete(`/budgets/${id}`).then((res) => res.data),
};

export default budgetService;
