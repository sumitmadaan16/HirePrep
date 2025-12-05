import { getAuthToken } from './auth';

// Gateway base URL - ALL requests go through gateway now
export const API_BASE_URL = 'http://localhost:8080';

// Helper function to create headers with JWT
export const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

// Fetch wrapper with automatic JWT inclusion
export const fetchWithAuth = async (url, options = {}) => {
    const config = {
        ...options,
        headers: {
            ...getAuthHeaders(),
            ...options.headers
        }
    };

    const response = await fetch(url, config);

    // If unauthorized, redirect to login
    if (response.status === 401) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
    }

    return response;
};