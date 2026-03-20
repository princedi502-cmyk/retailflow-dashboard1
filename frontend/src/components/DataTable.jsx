import React from 'react';

const DataTable = ({ title, columns, data, showImage = false }) => {
  return (
    <div className="card card-gradient p-4 sm:p-6 hover:shadow-xl transition-all duration-300 animate-fade-in">
      {title && (
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-gradient">{title}</h3>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 ring-1 ring-primary-500/20">
              {data.length} {data.length === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>
      )}
      
      {/* Desktop Table View */}
      <div className="overflow-x-auto -mx-4 sm:-mx-6 hidden sm:block">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className="px-4 sm:px-6 py-3 sm:py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200"
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                      </svg>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {data.map((row, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  className="hover:bg-gradient-to-r hover:from-primary-50 hover:to-blue-50 transition-all duration-200 hover:scale-[1.01] animate-slide-up"
                  style={{ animationDelay: `${rowIndex * 0.05}s` }}
                >
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 font-medium">
                      <div className="truncate">
                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          
          {data.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">No data available</p>
              <p className="text-gray-400 text-sm mt-1">Items will appear here once available</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Card View */}
      <div className="sm:hidden mt-4 space-y-3">
        {data.map((row, rowIndex) => (
          <div 
            key={rowIndex} 
            className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-200 animate-slide-up"
            style={{ animationDelay: `${rowIndex * 0.05}s` }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                #{rowIndex + 1}
              </span>
              {showImage && row.image && (
                <img src={row.image} alt={row.name} className="w-10 h-10 rounded-lg object-cover" />
              )}
            </div>
            {columns.map((column, colIndex) => (
              <div key={colIndex} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-xs font-semibold text-gray-600 truncate mr-2 uppercase tracking-wide">
                  {column.label}
                </span>
                <span className="text-xs text-gray-900 text-right truncate font-medium">
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
        
        {data.length === 0 && (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium text-sm">No data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataTable;
