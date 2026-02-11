import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000',
});

// Add token automatically if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginUser = (data) => API.post('/login', data);
export const signupUser = (data) => API.post('/signup', data);
export const uploadPDF = (data) => API.post('/upload-pdf', data);
export const chatWithRAG = (data) => API.post('/chat', data);

export default API;
