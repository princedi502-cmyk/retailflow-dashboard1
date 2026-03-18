import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { validatePasswordStrength } from '../utils/passwordValidation';
import { registerUser } from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee'
  });
  const [errors, setErrors] = useState({});
  const [passwordValidation, setPasswordValidation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (formData.password) {
      const validation = validatePasswordStrength(formData.password);
      setPasswordValidation(validation);
    } else {
      setPasswordValidation(null);
    }
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    if (name === 'password' || name === 'confirmPassword') {
      if (errors.passwordMismatch) {
        setErrors(prev => ({ ...prev, passwordMismatch: '' }));
      }
    }
    
    if (name === 'role') {
      if (errors.role) {
        setErrors(prev => ({ ...prev, role: '' }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters long';
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (passwordValidation && !passwordValidation.isValid) {
      newErrors.password = 'Password does not meet requirements';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.passwordMismatch = 'Passwords do not match';
    }

    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const result = await registerUser({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role
      });

      if (result.success) {
        navigate('/login', { 
          state: { 
            message: result.data.message || 'Registration successful! Please check your email for verification instructions.',
            requiresVerification: result.data.requires_email_verification 
          }
        });
      } else {
        setErrors({ submit: result.error || 'Registration failed' });
      }
    } catch (error) {
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">RetailFlow</h1>
          <p className="text-gray-600">Create Your Account</p>
        </div>

        <div className="card p-8 shadow-xl">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Sign Up
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="label block mb-2">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`input ${errors.username ? 'border-red-300 focus:border-red-500' : ''}`}
                placeholder="Choose a username"
                autoComplete="username"
                autoFocus
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
              )}
            </div>

            <div>
              <label htmlFor="role" className="label block mb-2">Role</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`input ${errors.role ? 'border-red-300 focus:border-red-500' : ''}`}
              >
                <option value="">Select a role</option>
                <option value="employee">Employee</option>
                <option value="owner">Owner</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="label block mb-2">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`input ${errors.email ? 'border-red-300 focus:border-red-500' : ''}`}
                placeholder="Enter your email"
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="label block mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input pr-10 ${errors.password ? 'border-red-300 focus:border-red-500' : ''}`}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
              
              {passwordValidation && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Password Strength:</span>
                    <span className={`text-sm font-semibold ${
                      passwordValidation.score >= 4 ? 'text-green-600' :
                      passwordValidation.score >= 3 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {passwordValidation.strength}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordValidation.score >= 4 ? 'bg-green-500' :
                        passwordValidation.score >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(passwordValidation.score / 5) * 100}%` }}
                    />
                  </div>
                  
                  {passwordValidation.errors.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {passwordValidation.errors.map((error, index) => (
                        <div key={index} className="text-xs text-red-600">
                          • {error}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label block mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input pr-10 ${errors.confirmPassword || errors.passwordMismatch ? 'border-red-300 focus:border-red-500' : ''}`}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
              {errors.passwordMismatch && (
                <p className="mt-1 text-sm text-red-600">{errors.passwordMismatch}</p>
              )}
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {errors.submit}
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary w-full" 
              disabled={isLoading || (passwordValidation && !passwordValidation.isValid)}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button 
                onClick={() => navigate('/login')}
                className="font-medium text-primary-600 hover:text-primary-500 underline bg-transparent border-none cursor-pointer"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          © 2026 RetailFlow. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Register;
