import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resendVerificationEmail } from '../services/api';

const ResendVerification = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (successMessage) setSuccessMessage('');
  };

  const validateForm = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    } else if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const result = await resendVerificationEmail(formData.email.trim());

      if (result.success) {
        setSuccessMessage(result.data.message || 'Verification email sent successfully!');
        
        // Show the development token if present
        if (result.data.note) {
          setSuccessMessage(prev => prev + '\n\n' + result.data.note);
        }
      } else {
        setError(result.error || 'Failed to resend verification email');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">RetailFlow</h1>
          <p className="text-gray-600">Resend Verification Email</p>
        </div>

        <div className="card p-8 shadow-xl">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Didn't receive the verification email?
          </h2>
          
          <p className="text-gray-600 mb-6 text-center">
            Enter your email address and we'll send you a new verification link.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="label block mb-2">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`input ${error ? 'border-red-300 focus:border-red-500' : ''}`}
                placeholder="Enter your email"
                autoComplete="email"
                autoFocus
              />
              {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
              )}
            </div>

            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded whitespace-pre-line">
                {successMessage}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Resend Verification Email'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <button 
                onClick={() => navigate('/login')}
                className="font-medium text-primary-600 hover:text-primary-500 underline bg-transparent border-none cursor-pointer"
              >
                Back to Login
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

export default ResendVerification;
