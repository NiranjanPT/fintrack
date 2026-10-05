import api from './api';

const savingsGoalService = {
  getAll: () => api.get('/savings-goals').then((res) => res.data.data),
  getById: (id) => api.get(`/savings-goals/${id}`).then((res) => res.data.data),
  create: (data) => api.post('/savings-goals', data).then((res) => res.data.data),
  update: (id, data) => api.put(`/savings-goals/${id}`, data).then((res) => res.data.data),
  addMoney: (id, amount) => api.post(`/savings-goals/${id}/add`, { amount }).then((res) => res.data.data),
  remove: (id) => api.delete(`/savings-goals/${id}`).then((res) => res.data),
};

export default savingsGoalService;
