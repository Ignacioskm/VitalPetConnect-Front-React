import axios from 'axios';
import { getValidToken, notifyUnauthorized } from './authStorage';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8083',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

axiosClient.interceptors.request.use((config) => {
  const token = getValidToken();
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('vp_authToken')) {
      notifyUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
