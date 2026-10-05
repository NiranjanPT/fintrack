import api from './api';

const categoryService = {
  getAll: (type) => api.get('/categories', { params: { type } }).then((res) => res.data.data),
  create: (data) => api.post('/categories', data).then((res) => res.data.data),
  remove: (id) => api.delete(`/categories/${id}`).then((res) => res.data),
  // Rule-based automatic categorization preview
  suggest: (text, type) => api.get('/categories/suggest', { params: { text, type } }).then((res) => res.data.data),
};

export default categoryService;
