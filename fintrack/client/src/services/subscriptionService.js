import api from './api';

const subscriptionService = {
  getAll: (status) => api.get('/subscriptions', { params: status ? { status } : {} }).then((res) => res.data.data),
  getById: (id) => api.get(`/subscriptions/${id}`).then((res) => res.data.data),
  create: (data) => api.post('/subscriptions', data).then((res) => res.data.data),
  update: (id, data) => api.put(`/subscriptions/${id}`, data).then((res) => res.data.data),
  remove: (id) => api.delete(`/subscriptions/${id}`).then((res) => res.data),
};

export default subscriptionService;
