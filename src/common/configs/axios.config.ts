import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Optional: Add request interceptor for authentication or logging
axiosInstance.interceptors.request.use(
  (config) => {
    // Add any authorization headers or request modifications here
    // Example: const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('API response', response);
    return response;
  },
  (error) => {
    // Handle errors globally
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
