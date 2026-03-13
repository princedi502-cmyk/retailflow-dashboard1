import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import OwnerDashboard from './pages/OwnerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmailVerification from './pages/EmailVerification';
import ResendVerification from './pages/ResendVerification';
import PasswordResetRequest from './pages/PasswordResetRequest';
import PasswordReset from './pages/PasswordReset';

// Role validation component
function RoleGuard({ children, requiredRole }) {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== requiredRole) {
    // Redirect to correct dashboard based on user's role
    const correctPath = user.role === 'owner' ? '/owner' : '/employee';
    return <Navigate to={correctPath} replace />;
  }
  
  return children;
}

// Single authentication-aware routing component
function AppRoutes() {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Show loading only during initial auth check
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes - redirect if already authenticated */}
      <Route 
        path="/login" 
        element={
          isAuthenticated && user ? (
            <Navigate to={user.role === 'owner' ? '/owner' : '/employee'} replace />
          ) : (
            <Login />
          )
        } 
      />
      <Route 
        path="/register" 
        element={
          isAuthenticated && user ? (
            <Navigate to={user.role === 'owner' ? '/owner' : '/employee'} replace />
          ) : (
            <Register />
          )
        } 
      />
      
      {/* Email Verification Routes - Public */}
      <Route path="/verify-email" element={<EmailVerification />} />
      <Route path="/resend-verification" element={<ResendVerification />} />
      
      {/* Password Reset Routes - Public */}
      <Route path="/password-reset-request" element={<PasswordResetRequest />} />
      <Route path="/reset-password" element={<PasswordReset />} />
      
      {/* Protected Routes with role guards */}
      <Route 
        path="/owner" 
        element={
          <RoleGuard requiredRole="owner">
            <OwnerDashboard />
          </RoleGuard>
        } 
      />
      <Route 
        path="/employee" 
        element={
          <RoleGuard requiredRole="employee">
            <EmployeeDashboard />
          </RoleGuard>
        } 
      />
      
      {/* Root Route - redirect to register by default */}
      <Route 
        path="/" 
        element={
          !isAuthenticated || !user ? (
            <Navigate to="/register" replace />
          ) : (
            <Navigate to={user.role === 'owner' ? '/owner' : '/employee'} replace />
          )
        } 
      />
      
      {/* Catch all - redirect to root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
