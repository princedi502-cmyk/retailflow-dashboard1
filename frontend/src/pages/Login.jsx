import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginUser } from "../services/api"; // New API service
import { useAuth } from "../context/AuthContext"  

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  // Changed state from 'name' to 'email' to match new logic
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAccountLocked, setIsAccountLocked] = useState(false);
  const [requiresVerification, setRequiresVerification] = useState(false);

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (successMessage) setSuccessMessage('');
    if (isAccountLocked) setIsAccountLocked(false);
    if (requiresVerification) setRequiresVerification(false);
  };

  const handleSubmit = async (e) => {

  e.preventDefault()

  setError("")
  setSuccessMessage("")
  setIsAccountLocked(false)
  setRequiresVerification(false)
  setIsLoading(true)

  const result = await login(formData.email, formData.password)

  if (result.success) {

    navigate("/", { replace: true })

  } else {

    if (result.isLocked) {
      setIsAccountLocked(true)
    } else if (result.error && result.error.includes("verify your email")) {
      setRequiresVerification(true)
    }
    setError(result.error || "Login failed")
    setIsLoading(false)

  }
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">RetailFlow</h1>
          <p className="text-gray-600">Retail Management System</p>
        </div>

        <div className="card p-8 shadow-xl">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Login to Your Account
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="label block mb-2">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input"
                placeholder="Enter your email"
                autoComplete="email"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="password" className="label block mb-2">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                {successMessage}
              </div>
            )}

            {error && (
              <div className={`px-4 py-3 rounded ${
                isAccountLocked 
                  ? 'bg-amber-50 border border-amber-200 text-amber-700' 
                  : requiresVerification
                  ? 'bg-blue-50 border border-blue-200 text-blue-700'
                  : 'bg-danger-50 border border-danger-200 text-danger-700'
              }`}>
                <div className="flex items-center">
                  {isAccountLocked && (
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {requiresVerification && (
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  )}
                  <span>{error}</span>
                </div>
                {isAccountLocked && (
                  <p className="text-sm mt-2 text-amber-600">
                    Please wait for the lockout period to expire or contact support.
                  </p>
                )}
                {requiresVerification && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm text-blue-600">
                      Please check your email for verification instructions.
                    </p>
                    <button 
                      onClick={() => navigate('/resend-verification')}
                      className="text-sm font-medium text-blue-700 hover:text-blue-600 underline bg-transparent border-none cursor-pointer"
                    >
                      Didn't receive the email? Resend verification
                    </button>
                  </div>
                )}
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
            
            <div className="text-center">
              <button 
                type="button"
                onClick={() => navigate('/password-reset-request')}
                className="text-sm font-medium text-primary-600 hover:text-primary-500 underline bg-transparent border-none cursor-pointer"
              >
                Forgot your password?
              </button>
            </div>
          </form>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button 
              onClick={() => navigate('/register')}
              className="font-medium text-primary-600 hover:text-primary-500 underline bg-transparent border-none cursor-pointer"
            >
              Sign up
            </button>
          </p>
        </div>
        
        <p className="text-center text-sm text-gray-600 mt-6">
          © 2026 RetailFlow. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
