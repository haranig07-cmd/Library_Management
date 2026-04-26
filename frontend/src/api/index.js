// Dynamically determine the API URL based on the environment
export const API_BASE_URL = 
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://library-managements-oli3.onrender.com/api';

// Helper to construct URLs
export const getApiUrl = (path) => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
