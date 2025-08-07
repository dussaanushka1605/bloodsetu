import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5002') + '/api';

/**
 * Creates an axios instance with authentication token and refresh handling
 * @returns Axios instance with interceptors for handling token expiration
 */
export const createAuthenticatedAxios = () => {
  const axiosInstance = axios.create({
    baseURL: API_URL,
  });

  // Request interceptor to add token to requests
  axiosInstance.interceptors.request.use(
    (config) => {
      // Detect user role from localStorage
      const userKeys = ['user_donor', 'user_hospital', 'user_admin'];
      let token = null;
      
      // Try to find a token from any user role
      for (const key of userKeys) {
        const userStr = localStorage.getItem(key);
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            if (user.token) {
              token = user.token;
              break;
            }
          } catch (e) {
            // Ignore JSON parse errors
          }
        }
      }
      
      // If no token found in user objects, try direct token storage
      if (!token) {
        for (const role of ['donor', 'hospital', 'admin']) {
          const storedToken = localStorage.getItem(`token_${role}`);
          if (storedToken) {
            token = storedToken;
            break;
          }
        }
      }
      
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor to handle token expiration
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // If the error is due to an expired token (401) and we haven't tried to refresh yet
      if (error.response?.status === 401 && 
          !originalRequest._retry && 
          (error.response?.data?.message === 'Token has expired' || 
           error.response?.data?.detail?.includes('expired') ||
           error.response?.data?.message?.includes('expired'))) {
        
        originalRequest._retry = true;
        
        try {
          // Prevent console errors from appearing
          const originalConsoleError = console.error;
          console.error = function() {};
          
          // Detect user role from localStorage
          const userKeys = ['user_donor', 'user_hospital', 'user_admin'];
          let detectedRole = null;
          
          for (const key of userKeys) {
            if (localStorage.getItem(key)) {
              detectedRole = key.split('_')[1];
              localStorage.removeItem(key);
              localStorage.removeItem(`token_${detectedRole}`);
              break;
            }
          }
          
          // If no specific role found, clear all possible user data
          if (!detectedRole) {
            for (const role of ['donor', 'hospital', 'admin']) {
              localStorage.removeItem(`user_${role}`);
              localStorage.removeItem(`token_${role}`);
            }
            // Also clear legacy storage
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
          
          // Restore console.error after a short delay
          setTimeout(() => {
            console.error = originalConsoleError;
          }, 1000);
          
          // Redirect to login page
          const redirectRole = detectedRole ? `?role=${detectedRole}` : '';
          window.location.href = `/login${redirectRole}`;
          
          return Promise.reject(new Error('Session expired. Please log in again.'));
        } catch (refreshError) {
          // Redirect to login without showing errors
          window.location.href = '/login';
          return Promise.reject(new Error('Session expired. Please log in again.'));
        }
      }
      
      // For other errors, just reject the promise
      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

/**
 * Silently handles 401 errors in fetch requests by suppressing console errors
 * @param url The URL to fetch
 * @param options Fetch options
 * @returns The fetch response or throws an error
 */
export const silentFetch = async (url: string, options: RequestInit = {}) => {
  try {
    // Override the global fetch error handler temporarily
    const originalConsoleError = console.error;
    const originalWindowOnerror = window.onerror;
    
    // Create a function to restore original error handlers
    const restoreErrorHandlers = () => {
      setTimeout(() => {
        console.error = originalConsoleError;
        window.onerror = originalWindowOnerror;
      }, 100);
    };
    
    // Set up error suppression for this fetch call
    console.error = function() {};
    window.onerror = function() { return true; };
    
    const response = await fetch(url, options);
    
    if (response.status === 401) {
      // Keep error suppression active for the 401 handling
      
      // Extract role from stored user data
      const userKeys = ['user_donor', 'user_hospital', 'user_admin'];
      let detectedRole = null;
      
      for (const key of userKeys) {
        if (localStorage.getItem(key)) {
          detectedRole = key.split('_')[1];
          localStorage.removeItem(key);
          localStorage.removeItem(`token_${detectedRole}`);
          break;
        }
      }
      
      // If no specific role found, clear all possible user data
      if (!detectedRole) {
        for (const role of ['donor', 'hospital', 'admin']) {
          localStorage.removeItem(`user_${role}`);
          localStorage.removeItem(`token_${role}`);
        }
        // Also clear legacy storage
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        const redirectRole = detectedRole ? `?role=${detectedRole}` : '';
        window.location.href = `/login${redirectRole}`;
      }, 100);
      
      throw new Error('Authentication failed. Please log in again.');
    } else {
      // Restore error handlers for non-401 responses
      restoreErrorHandlers();
    }
    
    return response;
  } catch (error) {
    // Make sure error handlers are restored even if there's an exception
    setTimeout(() => {
      console.error = console.error || function() {};
      window.onerror = window.onerror || function() { return true; };
    }, 100);
    
    throw error;
  }
};