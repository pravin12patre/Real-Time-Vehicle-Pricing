// src/apiService.js

const API_BASE_URL = 'http://localhost:5000/api'; // Your backend API base URL

// Helper function to get the auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('vehicleAuthToken');
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ msg: 'An unknown error occurred and response body is not JSON.' }));
    const errorMessage = errorData.msg || `HTTP error! status: ${response.status}`;
    throw new Error(errorMessage);
  }
  // If response is OK but there's no content (e.g., for a 204 No Content on DELETE)
  if (response.status === 204) {
    return null;
  }
  return response.json();
};

// Core request function
const request = async (endpoint, method = 'GET', body = null, isProtected = false, params = null) => {
  const headers = {}; // Initialize headers
  let url = `${API_BASE_URL}${endpoint}`;

  if (isProtected) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('Protected route called without a token.');
      // Consider throwing an error or specific handling if a protected route absolutely needs a token
      // For now, let the backend handle the 401 if token is missing but was expected.
    }
  }

  if (method === 'GET' && params) {
    const queryParams = new URLSearchParams();
    for (const key in params) {
      if (params[key] !== undefined && params[key] !== null && String(params[key]).length > 0) {
        queryParams.append(key, params[key]);
      }
    }
    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    if (body instanceof FormData) {
      // For FormData, browser sets Content-Type automatically with boundary
      // So, no 'Content-Type' header is set from our side.
      config.body = body;
    } else {
      headers['Content-Type'] = 'application/json'; // Set for JSON body
      config.body = JSON.stringify(body);
    }
  }

  const response = await fetch(url, config);
  return handleResponse(response);
};

// Exported API methods
export const apiService = {
  get: (endpoint, params) => request(endpoint, 'GET', null, false, params),
  getProtected: (endpoint, params) => request(endpoint, 'GET', null, true, params),
  post: (endpoint, data) => request(endpoint, 'POST', data, true),
  put: (endpoint, data) => request(endpoint, 'PUT', data, true),
  delete: (endpoint) => request(endpoint, 'DELETE', null, true),

  login: (credentials) => request('/auth/login', 'POST', credentials, false),
  register: (userData) => request('/auth/register', 'POST', userData, false),
};

// Example usage (for testing or in components):
// import { apiService } from './apiService';
//
// async function fetchVehicles() {
//   try {
//     const vehicles = await apiService.get('/vehicles');
//     console.log(vehicles);
//   } catch (error) {
//     console.error('Failed to fetch vehicles:', error.message);
//   }
// }
//
// async function createNewVehicle(vehicleData) {
//   try {
//     const newVehicle = await apiService.post('/vehicles', vehicleData);
//     console.log('Vehicle created:', newVehicle);
//   } catch (error) {
//     console.error('Failed to create vehicle:', error.message);
//   }
// }
