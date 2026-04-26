import React from 'react';
import { useApp } from '../context/AppContext';

const Table = ({ columns, data, emptyMessage = 'No data found', loading = false, renderSubRow }) => {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  return (
    <div className={`w-full rounded-xl overflow-hidden border ${isDark ? 'border-dark-border' : 'border-light-border'}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className={isDark ? 'bg-dark-muted' : 'bg-gray-50'}>
              {columns.map((col, i) => (
                <th
                  key={i}
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-dark-border' : 'divide-light-border'}`}>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <div className="flex justify-center">
                    <div className={`w-8 h-8 rounded-full border-2 border-t-transparent animate-spin ${isDark ? 'border-yellow-400' : 'border-primary-blue'}`} />
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={`px-4 py-12 text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <React.Fragment key={row.id ?? i}>
                  <tr
                    className={`table-row-hover transition-colors ${isDark ? 'bg-dark-card' : 'bg-white'}`}
                  >
                    {columns.map((col, j) => (
                      <td key={j} className={`px-4 py-3 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {col.render ? col.render(row, col, i) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                  {renderSubRow && (
                    <tr className={isDark ? 'bg-dark-card' : 'bg-white'}>
                      <td colSpan={columns.length} className="px-4 pb-4 pt-0">
                        {renderSubRow(row)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
