import React from 'react';

const DataTable = ({ title, columns, data, showImage = false }) => {
  return (
    <div className="card p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-5">{title}</h3>
      <div className="overflow-x-auto -mx-4 sm:-mx-6 hidden sm:block">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className="px-4 sm:px-6 py-3 sm:py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {data.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50 transition-colors duration-150">
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">
                      <div className="truncate">
                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Mobile card view for small screens */}
      <div className="sm:hidden mt-4 space-y-3">
        {data.map((row, rowIndex) => (
          <div key={rowIndex} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            {columns.map((column, colIndex) => (
              <div key={colIndex} className="flex justify-between py-1">
                <span className="text-xs font-medium text-gray-600 truncate mr-2">
                  {column.label}:
                </span>
                <span className="text-xs text-gray-900 text-right truncate">
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataTable;
