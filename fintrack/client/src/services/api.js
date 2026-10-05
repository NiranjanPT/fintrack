// Experiment 9 & 10 - Central Axios instance used for every request to the Express API
import axios from 'axios';

export const TOKEN_KEY = 'fintrack_token';

// Local: "/api" is proxied by Vite to http://localhost:5000
// Production: VITE_API_URL points to the Render backend.
// "/api" is added automatically if the URL was configured without it.
const getBaseURL = () => {
  const url = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
  if (!url) return '/api';
  return url.endsWith('/api') ? url : `${url}/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
});

// Attach the JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Turn errors into a readable message and log out when the token is invalid/expired
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isAuthRequest = error.config?.url?.startsWith('/auth/login') || error.config?.url?.startsWith('/auth/register');

    if (status === 401 && !isAuthRequest) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event('auth:logout'));
    }

    let message = error.response?.data?.message;
    if (!message) {
      message = error.code === 'ECONNABORTED'
        ? 'The server took too long to respond'
        : error.response
          ? `Request failed (${status})`
          : 'Cannot reach the server. Is the backend running?';
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
