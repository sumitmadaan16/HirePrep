import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setAuthToken } from '../utils/auth';
import { API_BASE_URL } from '../utils/api';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        console.log('=== LOGIN ATTEMPT ===');
        console.log('Username:', username);
        console.log('API URL:', `${API_BASE_URL}/api/auth/login`);

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Login failed:', errorData);
                throw new Error(errorData.error || 'Login failed');
            }

            const data = await response.json();
            console.log('Login response data:', data);

            // Validate response data
            if (!data.token) {
                console.error('No token in response');
                throw new Error('Invalid response: No token received');
            }

            console.log('Token received:', data.token.substring(0, 20) + '...');
            console.log('User info:', {
                username: data.username,
                role: data.role,
                firstName: data.firstName,
                lastName: data.lastName
            });

            // Store JWT token
            setAuthToken(data.token);
            console.log('Token stored in localStorage');

            // Verify token was stored
            const storedToken = localStorage.getItem('accessToken');
            console.log('Token verification:', storedToken ? 'SUCCESS' : 'FAILED');

            // Clear form
            setUsername('');
            setPassword('');

            console.log('Navigating to dashboard...');

            // Use window.location for guaranteed navigation
            window.location.href = '/';

        } catch (err) {
            console.error('Login error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1 className="login-logo">HirePrep</h1>
                    <p className="login-subtitle">Placement Portal</p>
                </div>

                <h2 className="login-title">Welcome Back</h2>

                {error && (
                    <div className="login-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="form-input"
                            placeholder="Enter your username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-input"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className={`login-button ${loading ? 'button-disabled' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p className="login-hint">
                    Don't have an account? <a href="/register" style={{ color: '#2563eb', fontWeight: '500' }}>Register here</a>
                </p>
            </div>
        </div>
    );
};

export default Login;