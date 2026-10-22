// client/src/services/api.js
import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Appointment-related API calls
export const createAppointment = (appointmentData) => {
  return api.post('/appointments', appointmentData).then(response => response.data);
};

export const getAppointments = () => {
  return api.get('/appointments').then(response => response.data);
};

export const getDoctors = () => {
  return api.get('/users/doctors').then(response => response.data);
};

export const getMeetingToken = (appointmentId) => {
  return api.get(`/appointments/${appointmentId}/token`).then(response => response.data);
};

export default api;