// Authentication utility functions

export const setAuthToken = (token) => {
    console.log('Setting auth token:', token ? 'Token received' : 'No token');
    localStorage.setItem('accessToken', token);
    console.log('Token stored successfully');
};

export const getAuthToken = () => {
    const token = localStorage.getItem('accessToken');
    console.log('Getting auth token:', token ? 'Token exists' : 'No token found');
    return token;
};

export const removeAuthToken = () => {
    console.log('Removing auth token');
    localStorage.removeItem('accessToken');
};

export const decodeToken = (token) => {
    try {
        if (!token) {
            console.log('decodeToken: No token provided');
            return null;
        }

        const base64Url = token.split('.')[1];
        if (!base64Url) {
            console.error('decodeToken: Invalid token format');
            return null;
        }

        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        const decoded = JSON.parse(jsonPayload);
        console.log('Token decoded successfully:', {
            username: decoded.sub,
            role: decoded.role,
            exp: decoded.exp,
            expiresIn: decoded.exp ? Math.floor((decoded.exp * 1000 - Date.now()) / 1000) + 's' : 'unknown'
        });

        return decoded;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

export const getUserInfo = () => {
    const token = getAuthToken();
    if (!token) {
        console.log('getUserInfo: No token available');
        return null;
    }

    const decoded = decodeToken(token);
    if (!decoded) {
        console.log('getUserInfo: Failed to decode token');
        return null;
    }

    const userInfo = {
        username: decoded.sub,
        role: decoded.role
    };

    console.log('getUserInfo:', userInfo);
    return userInfo;
};

export const isAuthenticated = () => {
    console.log('=== Checking Authentication ===');

    const token = getAuthToken();
    if (!token) {
        console.log('isAuthenticated: No token found - NOT AUTHENTICATED');
        return false;
    }

    const decoded = decodeToken(token);
    if (!decoded) {
        console.log('isAuthenticated: Invalid token - NOT AUTHENTICATED');
        return false;
    }

    // Check if token is expired
    const currentTime = Date.now() / 1000;
    const isValid = decoded.exp > currentTime;

    console.log('isAuthenticated:', {
        hasToken: !!token,
        hasDecoded: !!decoded,
        currentTime: Math.floor(currentTime),
        expireTime: decoded.exp,
        isExpired: decoded.exp <= currentTime,
        result: isValid ? 'AUTHENTICATED' : 'NOT AUTHENTICATED (expired)'
    });

    return isValid;
};

export const logout = () => {
    console.log('Logging out user');
    removeAuthToken();
    window.location.href = '/login';
};