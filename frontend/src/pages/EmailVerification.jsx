import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyEmail } from '../services/api';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setError('Verification token is missing. Please check your email link or request a new verification email.');
      setIsLoading(false);
      return;
    }

    handleVerification(token);
  }, [searchParams]);

  const handleVerification = async (token) => {
    try {
      const result = await verifyEmail(token);
      
      if (result.success) {
        setVerificationStatus('success');
        setMessage(result.data.message || 'Email verified successfully!');
      } else {
        setVerificationStatus('error');
        setError(result.error || 'Email verification failed');
      }
    } catch (error) {
      setVerificationStatus('error');
      setError('An unexpected error occurred during verification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigate('/login', { 
      state: { message: verificationStatus === 'success' ? 'Email verified! Please log in.' : undefined }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900">Verifying your email...</h2>
            <p className="text-gray-600 mt-2">Please wait while we verify your email address.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">RetailFlow</h1>
          <p className="text-gray-600">Email Verification</p>
        </div>

        <div className="card p-8 shadow-xl">
          <div className="text-center">
            {verificationStatus === 'success' ? (
              <>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Email Verified!</h2>
                <p className="text-gray-600 mb-6">{message}</p>
              </>
            ) : (
              <>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                  <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Verification Failed</h2>
                <p className="text-red-600 mb-6">{error}</p>
              </>
            )}

            <div className="space-y-3">
              <button
                onClick={handleGoToLogin}
                className="btn btn-primary w-full"
              >
                Go to Login
              </button>
              
              {verificationStatus === 'error' && (
                <button
                  onClick={() => navigate('/resend-verification')}
                  className="btn btn-secondary w-full"
                >
                  Resend Verification Email
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          © 2026 RetailFlow. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default EmailVerification;
