import { useState, useEffect, useCallback } from 'react';
import { registerBackgroundSync, subscribeToPushNotifications } from '../utils/serviceWorkerRegistration';

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState([]);
  const [syncInProgress, setSyncInProgress] = useState(false);

  // Store actions in IndexedDB for offline support
  const storeOfflineAction = useCallback(async (action) => {
    try {
      const db = await openOfflineDB();
      const transaction = db.transaction(['actions'], 'readwrite');
      const store = transaction.objectStore('actions');
      
      const actionWithId = {
        ...action,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        synced: false
      };
      
      await store.add(actionWithId);
      setPendingActions(prev => [...prev, actionWithId]);
      
      return actionWithId.id;
    } catch (error) {
      console.error('Failed to store offline action:', error);
      throw error;
    }
  }, []);

  // Get all pending actions from IndexedDB
  const getPendingActions = useCallback(async () => {
    try {
      const db = await openOfflineDB();
      const transaction = db.transaction(['actions'], 'readonly');
      const store = transaction.objectStore('actions');
      const request = store.getAll();
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get pending actions:', error);
      return [];
    }
  }, []);

  // Sync pending actions when online
  const syncPendingActions = useCallback(async () => {
    if (!isOnline || syncInProgress) return;
    
    setSyncInProgress(true);
    
    try {
      const actions = await getPendingActions();
      const db = await openOfflineDB();
      
      for (const action of actions) {
        try {
          // Attempt to sync the action
          await syncAction(action);
          
          // Remove synced action from IndexedDB
          const transaction = db.transaction(['actions'], 'readwrite');
          const store = transaction.objectStore('actions');
          await store.delete(action.id);
          
          setPendingActions(prev => prev.filter(a => a.id !== action.id));
        } catch (error) {
          console.error(`Failed to sync action ${action.id}:`, error);
        }
      }
      
      // Register background sync for future syncs
      try {
        await registerBackgroundSync('background-sync-actions');
      } catch (error) {
        console.log('Background sync not supported:', error.message);
      }
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncInProgress(false);
    }
  }, [isOnline, syncInProgress, getPendingActions]);

  // Sync individual action
  const syncAction = async (action) => {
    const { type, data, endpoint } = action;
    
    switch (type) {
      case 'POST':
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
        
      case 'PUT':
        const putResponse = await fetch(`${endpoint}/${data.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });
        
        if (!putResponse.ok) {
          throw new Error(`HTTP error! status: ${putResponse.status}`);
        }
        
        return await putResponse.json();
        
      case 'DELETE':
        const deleteResponse = await fetch(`${endpoint}/${data.id}`, {
          method: 'DELETE'
        });
        
        if (!deleteResponse.ok) {
          throw new Error(`HTTP error! status: ${deleteResponse.status}`);
        }
        
        return true;
        
      default:
        throw new Error(`Unsupported action type: ${type}`);
    }
  };

  // Open IndexedDB
  const openOfflineDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('RetailFlowOffline', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        if (!db.objectStoreNames.contains('actions')) {
          const store = db.createObjectStore('actions', { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('synced', 'synced', { unique: false });
        }
      };
    });
  };

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingActions();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Load pending actions on mount
    getPendingActions().then(setPendingActions);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncPendingActions, getPendingActions]);

  return {
    isOnline,
    pendingActions,
    syncInProgress,
    storeOfflineAction,
    syncPendingActions,
    getPendingActions
  };
};

// Hook for push notifications
export const usePushNotifications = () => {
  const [subscription, setSubscription] = useState(null);
  const [permission, setPermission] = useState('default');

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    
    if (result === 'granted') {
      try {
        const sub = await subscribeToPushNotifications();
        setSubscription(sub);
        return true;
      } catch (error) {
        console.error('Failed to subscribe to push notifications:', error);
        return false;
      }
    }
    
    return false;
  };

  const showNotification = (title, options = {}) => {
    if (permission === 'granted') {
      return new Notification(title, {
        icon: '/vite.svg',
        badge: '/vite.svg',
        ...options
      });
    }
  };

  useEffect(() => {
    setPermission(Notification.permission);
  }, []);

  return {
    subscription,
    permission,
    requestPermission,
    showNotification
  };
};
