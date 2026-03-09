import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from "../services/api"; // New API service
import { useAuth } from "../context/AuthContext"  

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  // Changed state from 'name' to 'email' to match new logic
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {

  e.preventDefault()

  setError("")
  setIsLoading(true)

  const result = await login(formData.email, formData.password)

  if (result.success) {

    navigate("/", { replace: true })

  } else {

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

            {error && (
              <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-gray-600 mt-6">
          © 2026 RetailFlow. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
