import api from './api';

const reportService = {
  // month can be a number (1-12) or "all" for a full-year report
  getReport: (month, year) => api.get('/reports', { params: { month, year } }).then((res) => res.data.data),

  // Downloads the CSV through Axios (so the JWT header is included) and saves it as a file
  exportCSV: async (month, year) => {
    const res = await api.get('/reports/export', { params: { month, year }, responseType: 'blob' });
    const disposition = res.headers['content-disposition'] || '';
    const fileName = disposition.match(/filename="(.+)"/)?.[1] || `fintrack-report-${year}.csv`;

    const url = URL.createObjectURL(res.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    return fileName;
  },
};

export default reportService;
