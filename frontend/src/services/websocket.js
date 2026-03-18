/**
 * WebSocket service for real-time updates
 */

class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 5000; // 5 seconds
    this.heartbeatInterval = null;
    this.isConnecting = false;
    this.eventListeners = new Map();
  }

  connect(token) {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      console.log('WebSocket already connecting or connected');
      return Promise.resolve();
    }

    this.isConnecting = true;
    console.log('Starting WebSocket connection...');
    console.log('Token length:', token ? token.length : 'no token');

    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `ws://127.0.0.1:8000/ws/analytics?token=${encodeURIComponent(token)}`;
        console.log('Connecting to WebSocket:', wsUrl);
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected successfully - readyState:', this.ws.readyState);
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          
          // Start heartbeat
          this.startHeartbeat();
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('WebSocket message received:', data);
            
            // Handle different message types
            switch (data.type) {
              case 'connection_established':
                console.log('WebSocket connection confirmed:', data);
                break;
              case 'sales_update':
                this.emit('sales_update', data.data);
                break;
              case 'order_created':
                this.emit('order_created', data.data);
                break;
              case 'pong':
                // Heartbeat response received
                console.log('Received pong response');
                break;
              case 'error':
                console.error('WebSocket error from server:', data.message);
                break;
              default:
                console.log('Unknown WebSocket message type:', data.type);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
            console.error('Raw message:', event.data);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected - Details:');
          console.log('  Code:', event.code);
          console.log('  Reason:', event.reason);
          console.log('  Was clean:', event.wasClean);
          console.log('  Current readyState:', this.ws?.readyState || 'WebSocket is null');
          
          this.isConnecting = false;
          this.stopHeartbeat();
          
          // Common WebSocket close codes and their meanings
          const closeCodes = {
            1000: 'Normal Closure',
            1001: 'Going Away',
            1002: 'Protocol Error',
            1003: 'Unsupported Data',
            1004: 'Reserved',
            1005: 'No Status Rcvd',
            1006: 'Abnormal Closure',
            1007: 'Invalid frame payload data',
            1008: 'Policy Violation',
            1009: 'Message Too Big',
            1010: 'Mandatory Extension',
            1011: 'Internal Server Error',
            1015: 'TLS Handshake'
          };
          
          console.log('Close code meaning:', closeCodes[event.code] || 'Unknown code');
          
          // Attempt to reconnect if not a normal closure
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            
            setTimeout(() => {
              this.connect(token);
            }, this.reconnectInterval);
          } else {
            console.log('Max reconnection attempts reached or normal closure');
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          console.error('WebSocket readyState:', this.ws?.readyState || 'WebSocket is null');
          this.isConnecting = false;
          reject(error);
        };

      } catch (error) {
        console.error('WebSocket connection error:', error);
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  disconnect() {
    this.stopHeartbeat();
    
    if (this.ws) {
      // Remove event handlers to prevent null reference errors
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close(1000, 'Client disconnect');
      }
      this.ws = null;
    }
    
    this.eventListeners.clear();
    this.isConnecting = false;
  }

  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        try {
          this.ws.send(JSON.stringify({ type: 'ping' }));
        } catch (error) {
          console.error('Failed to send ping:', error);
        }
      }
    }, 30000); // Send ping every 30 seconds
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Event listener methods
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in WebSocket event handler for ${event}:`, error);
        }
      });
    }
  }

  // Check if WebSocket is connected
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  // Get connection state
  getState() {
    if (!this.ws) return 'DISCONNECTED';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'CONNECTING';
      case WebSocket.OPEN: return 'CONNECTED';
      case WebSocket.CLOSING: return 'CLOSING';
      case WebSocket.CLOSED: return 'DISCONNECTED';
      default: return 'UNKNOWN';
    }
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;
