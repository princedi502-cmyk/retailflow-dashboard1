import React from 'react';
import { getPasswordStrengthColor, getPasswordStrengthTextColor } from '../utils/passwordValidation';

const PasswordStrengthIndicator = ({ validation }) => {
  if (!validation || validation.score === 0) {
    return null;
  }

  const { score, strength, errors, warnings } = validation;

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bar */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Password Strength:</span>
        <span className={`text-sm font-semibold ${getPasswordStrengthTextColor(score)}`}>
          {strength}
        </span>
      </div>
      
      {/* Visual strength indicator */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(score)}`}
          style={{ width: `${(score / 5) * 100}%` }}
        />
      </div>

      {/* Requirements checklist */}
      <div className="mt-3 space-y-1">
        <div className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</div>
        <div className="grid grid-cols-1 gap-1 text-xs">
          <RequirementItem 
            met={validation.errors.filter(e => e.includes("8 characters")).length === 0}
            text="At least 8 characters long"
          />
          <RequirementItem 
            met={validation.errors.filter(e => e.includes("uppercase")).length === 0}
            text="Contains uppercase letter (A-Z)"
          />
          <RequirementItem 
            met={validation.errors.filter(e => e.includes("lowercase")).length === 0}
            text="Contains lowercase letter (a-z)"
          />
          <RequirementItem 
            met={validation.errors.filter(e => e.includes("digit")).length === 0}
            text="Contains number (0-9)"
          />
          <RequirementItem 
            met={validation.errors.filter(e => e.includes("special character")).length === 0}
            text="Contains special character (!@#$%^&*)"
          />
          <RequirementItem 
            met={validation.errors.filter(e => e.includes("common")).length === 0}
            text="Not a common password"
          />
          <RequirementItem 
            met={validation.errors.filter(e => e.includes("sequential")).length === 0}
            text="No sequential characters"
          />
          <RequirementItem 
            met={validation.errors.filter(e => e.includes("repeated")).length === 0}
            text="No repeated characters"
          />
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="mt-2">
          {warnings.map((warning, index) => (
            <div key={index} className="text-xs text-yellow-600 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {warning}
            </div>
          ))}
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mt-2">
          {errors.map((error, index) => (
            <div key={index} className="text-xs text-red-600 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const RequirementItem = ({ met, text }) => (
  <div className={`flex items-center ${met ? 'text-green-600' : 'text-gray-400'}`}>
    {met ? (
      <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    ) : (
      <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    )}
    {text}
  </div>
);

export default PasswordStrengthIndicator;
