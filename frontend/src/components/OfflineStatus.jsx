import React, { useState, useEffect } from 'react';
import { addNetworkStatusListener } from '../utils/serviceWorkerRegistration';

const OfflineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    // Listen for network status changes
    const unsubscribe = addNetworkStatusListener((online) => {
      setIsOnline(online);
      setShowOfflineMessage(!online);
      
      // Auto-hide offline message after 5 seconds when coming back online
      if (online) {
        setTimeout(() => setShowOfflineMessage(false), 5000);
      }
    });

    return unsubscribe;
  }, []);

  if (isOnline && !showOfflineMessage) {
    return null;
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isOnline 
          ? 'bg-green-500 text-white' 
          : 'bg-red-500 text-white animate-pulse'
      }`}
    >
      <div className="px-4 py-3 text-center">
        <div className="flex items-center justify-center space-x-2">
          {isOnline ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">You're back online!</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">You're offline. Some features may be unavailable.</span>
            </>
          )}
        </div>
        
        {!isOnline && (
          <div className="mt-2 text-xs opacity-90">
            <p>• View cached data and continue working</p>
            <p>• Changes will sync when you're back online</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfflineStatus;
