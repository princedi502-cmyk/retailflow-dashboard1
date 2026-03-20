import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = ({ role, pageTitle, onMenuClick }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login', { replace: true });
    }
  };

  // Use actual logged-in user data
  const displayName = user?.name || 'User';
  const displayRole = user?.role === 'owner' ? 'Owner' : 'Employee';
  
  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 tracking-tight truncate">{pageTitle}</h2>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* User Info */}
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-900">
              {displayName} ({displayRole})
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{displayRole} Portal</p>
          </div>
          
          {/* Mobile user info */}
          <div className="sm:hidden">
            <p className="text-xs font-medium text-gray-600">{displayName}</p>
          </div>
          
          {/* User Avatar */}
          <div className="w-8 h-8 sm:w-11 sm:h-11 bg-primary-100 rounded-lg sm:rounded-xl flex items-center justify-center text-primary-700 font-semibold text-sm sm:text-base">
            {displayName.charAt(0).toUpperCase()}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="btn btn-outline text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2"
            title="Logout"
          >
            <span className="hidden sm:inline">Logout</span>
            <span className="sm:hidden">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
