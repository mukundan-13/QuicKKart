import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api/v1', 
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken'); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log("Unauthorized request. Redirecting to login...");
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('userRoles'); 
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 