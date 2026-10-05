import api from './api';

const analyticsService = {
  getDashboard: (month, year) => api.get('/analytics/dashboard', { params: { month, year } }).then((res) => res.data.data),
  getMonthly: (month, year) => api.get('/analytics/monthly', { params: { month, year } }).then((res) => res.data.data),
};

export default analyticsService;
