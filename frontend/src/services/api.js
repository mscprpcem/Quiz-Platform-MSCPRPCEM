import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '', // Handled by Vite proxy in development or custom env URL
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000 // 15-second cap prevents indefinite freezing on cold-starts/stalls
});

// Request interceptor to append authorization token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('msc_quiz_token') || localStorage.getItem('msc_student_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to normalize timeout errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      error.message = 'The server is taking longer than expected to respond. Please try again in a moment.';
    }
    return Promise.reject(error);
  }
);

export default api;
