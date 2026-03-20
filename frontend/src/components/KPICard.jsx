import React from 'react';

const KPICard = ({ title, value, trend, icon, isPositive = true, prefix = '', suffix = '', subtitle = '' }) => {
  return (
    <div className="card p-4 sm:p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="label mb-2 text-sm sm:text-base truncate">{title}</p>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 tracking-tight break-words">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-600 mb-2 truncate">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center">
              <span className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 rounded-full text-xs font-medium ${
                isPositive 
                  ? 'bg-success-50 text-success-700' 
                  : 'bg-danger-50 text-danger-700'
              }`}>
                <span className="mr-1">{isPositive ? '↑' : '↓'}</span>
                <span className="truncate">{trend}</span>
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="ml-2 sm:ml-4 flex-shrink-0">
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-primary-50 rounded-lg sm:rounded-xl flex items-center justify-center text-primary-600 text-lg sm:text-2xl">
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;
