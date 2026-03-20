import React from 'react';

const KPICard = ({ title, value, trend, icon, isPositive = true, prefix = '', suffix = '', subtitle = '' }) => {
  return (
    <div className="card card-gradient p-4 sm:p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in group">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="label mb-2 text-sm sm:text-base truncate text-gray-600 group-hover:text-primary-700 transition-colors duration-200">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gradient mb-2 sm:mb-3 tracking-tight break-words animate-slide-up">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
          {subtitle && (
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                subtitle.includes('Live') ? 'status-online' : 'status-offline'
              }`}>
                <span className={`w-2 h-2 rounded-full mr-1.5 ${subtitle.includes('Live') ? 'bg-success-500 animate-pulse' : 'bg-danger-500'}`}></span>
                {subtitle}
              </span>
            </div>
          )}
          {trend && (
            <div className="flex items-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 hover:scale-105 ${
                isPositive 
                  ? 'bg-gradient-to-r from-success-50 to-success-100 text-success-700 ring-1 ring-success-500/20' 
                  : 'bg-gradient-to-r from-danger-50 to-danger-100 text-danger-700 ring-1 ring-danger-500/20'
              }`}>
                <span className="mr-1 text-lg">{isPositive ? '↑' : '↓'}</span>
                <span className="truncate">{trend}</span>
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="ml-2 sm:ml-4 flex-shrink-0">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl sm:rounded-2xl flex items-center justify-center text-primary-600 text-xl sm:text-2xl shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300 border border-primary-100">
              <span className="transform group-hover:rotate-12 transition-transform duration-300">{icon}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;
