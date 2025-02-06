import React, { useMemo } from 'react';
import { Filter, X } from 'lucide-react';
import { useJiraStore } from '../store';

export const Filters: React.FC = () => {
  const { tickets, filters, setFilters, resetFilters } = useJiraStore();

  const options = useMemo(() => {
    console.log('🔄 Recalculating filter options');
    const sortStrings = (arr: string[]) => {
      return [...arr].sort((a, b) => {
        if (!a && !b) return 0;
        if (!a) return 1;
        if (!b) return -1;
        return String(a).toLowerCase().localeCompare(String(b).toLowerCase());
      });
    };

    const result = {
      severity: sortStrings(
        Array.from(new Set(tickets.map(t => t.severity))).filter(Boolean)
      ),
      labels: sortStrings(
        Array.from(new Set(tickets.flatMap(t => t.labels))).filter(Boolean)
      ),
      components: sortStrings(
        Array.from(new Set(tickets.flatMap(t => t.components))).filter(Boolean)
      ),
      supplier: sortStrings(
        Array.from(new Set(tickets.flatMap(t => t.supplier || []))).filter(Boolean)
      )
    };

    console.log('📊 Available filter options:', {
      severityCount: result.severity.length,
      labelsCount: result.labels.length,
      componentsCount: result.components.length,
      supplierCount: result.supplier.length
    });

    return result;
  }, [tickets]);

  const handleFilterChange = (type: keyof typeof filters, value: string) => {
    console.log('🔍 Filter change:', { type, value });
    const currentFilters = filters[type];
    const newFilters = currentFilters.includes(value)
      ? currentFilters.filter(v => v !== value)
      : [...currentFilters, value];
    console.log('🔄 New filter state:', { type, filters: newFilters });
    setFilters({ [type]: newFilters });
  };

  if (tickets.length === 0) {
    console.log('ℹ️ No tickets available for filtering');
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>
        {(filters.severity.length > 0 || filters.labels.length > 0 || filters.components.length > 0 || filters.supplier.length > 0) && (
          <button
            onClick={() => {
              console.log('🔄 Resetting all filters');
              resetFilters();
            }}
            className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center space-x-1"
          >
            <X className="w-4 h-4" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Severity Filters */}
        {options.severity.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2">Severity</h3>
            <div className="flex flex-wrap gap-2">
              {options.severity.map(severity => (
                <button
                  key={severity}
                  onClick={() => handleFilterChange('severity', severity)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filters.severity.includes(severity)
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  } hover:opacity-80 transition-opacity`}
                >
                  {severity}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Supplier Filters */}
        {options.supplier.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2">Supplier</h3>
            <div className="flex flex-wrap gap-2">
              {options.supplier.map(supplier => (
                <button
                  key={supplier}
                  onClick={() => handleFilterChange('supplier', supplier)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filters.supplier.includes(supplier)
                      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  } hover:opacity-80 transition-opacity`}
                >
                  {supplier}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Labels Filters */}
        {options.labels.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2">Labels</h3>
            <div className="flex flex-wrap gap-2">
              {options.labels.map(label => (
                <button
                  key={label}
                  onClick={() => handleFilterChange('labels', label)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filters.labels.includes(label)
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  } hover:opacity-80 transition-opacity`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Components Filters */}
        {options.components.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2">Components</h3>
            <div className="flex flex-wrap gap-2">
              {options.components.map(component => (
                <button
                  key={component}
                  onClick={() => handleFilterChange('components', component)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filters.components.includes(component)
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  } hover:opacity-80 transition-opacity`}
                >
                  {component}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};