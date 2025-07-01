import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'http://localhost:6240' 
    : '/api', // Use proxy in development
  timeout: 5000,
});

// Add request interceptor for logging
api.interceptors.request.use(
  config => {
    console.log(`➡️ ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  error => Promise.reject(error)
);

api.interceptors.response.use(
  response => response,     
  error => {
    console.error('❌', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export default api;