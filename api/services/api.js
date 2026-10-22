// client/src/services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

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