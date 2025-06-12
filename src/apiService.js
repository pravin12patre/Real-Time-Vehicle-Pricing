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
const request = async (endpoint, method = 'GET', body = null, isProtected = false) => {
  const headers = {
    // 'Content-Type': 'application/json', // Set conditionally
  };

  if (!(body instanceof FormData)) { // Don't set Content-Type for FormData
    headers['Content-Type'] = 'application/json';
  }

  if (isProtected) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      // Handle cases where a protected route is called without a token
      // This could be throwing an error, or redirecting to login,
      // but for a service, throwing an error is often best.
      console.warn('Attempted to make a protected API call without a token.');
      // Depending on strictness, you might throw an error here:
      // throw new Error('Not authorized: No token found for protected route.');
    }
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    if (body instanceof FormData) {
      // For FormData, browser sets Content-Type to multipart/form-data with boundary
      // delete headers['Content-Type']; // So remove our default
      config.body = body;
    } else {
      config.body = JSON.stringify(body); // Existing JSON logic
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  return handleResponse(response);
};

// Exported API methods
export const apiService = {
  get: (endpoint) => request(endpoint, 'GET'),
  post: (endpoint, data) => request(endpoint, 'POST', data, true), // Protected by default
  put: (endpoint, data) => request(endpoint, 'PUT', data, true),   // Protected by default
  delete: (endpoint) => request(endpoint, 'DELETE', null, true), // Protected by default

  // Example of a public POST, if ever needed (though not common for POST)
  // publicPost: (endpoint, data) => request(endpoint, 'POST', data, false),

  // Also provide specific login/register methods that are not protected by default
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
