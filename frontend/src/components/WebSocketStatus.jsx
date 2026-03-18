import React from 'react';

const WebSocketStatus = ({ connected, userRole }) => {
  const getStatusColor = () => {
    return connected ? 'text-green-600' : 'text-red-600';
  };

  const getStatusText = () => {
    return connected ? 'Connected' : 'Disconnected';
  };

  const getStatusIcon = () => {
    return connected ? '🟢' : '🔴';
  };

  return (
    <div className="fixed bottom-4 left-4 z-40 bg-white rounded-lg shadow-md border border-gray-200 p-3">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-lg">{getStatusIcon()}</span>
        <div>
          <p className={`font-medium ${getStatusColor()}`}>
            {userRole} Dashboard
          </p>
          <p className={`text-xs ${getStatusColor()}`}>
            {getStatusText()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WebSocketStatus;
