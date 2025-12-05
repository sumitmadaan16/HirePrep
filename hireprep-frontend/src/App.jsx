import './App.css'
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './utils/auth';
import Login from './components/Login';
import Register from './components/Register';
import HirePrep from './components/HirePrep';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const authenticated = isAuthenticated();
    console.log('ProtectedRoute check:', authenticated ? 'Allowing access' : 'Redirecting to login');
    return authenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
    const authenticated = isAuthenticated();
    console.log('PublicRoute check:', authenticated ? 'Redirecting to dashboard' : 'Allowing access');
    return authenticated ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public routes - redirect to dashboard if already authenticated */}
                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <PublicRoute>
                            <Register />
                        </PublicRoute>
                    }
                />

                {/* Protected routes - require authentication */}
                <Route
                    path="/*"
                    element={
                        <ProtectedRoute>
                            <HirePrep />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;