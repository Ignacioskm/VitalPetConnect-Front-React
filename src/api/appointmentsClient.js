import axios from 'axios';
import { getValidToken, notifyUnauthorized } from './authStorage';

const appointmentsClient = axios.create({
  baseURL: import.meta.env.VITE_APPOINTMENTS_API_URL || 'http://localhost:8084',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

appointmentsClient.interceptors.request.use((config) => {
  const token = getValidToken();
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

appointmentsClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('vp_authToken')) {
      notifyUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default appointmentsClient;
