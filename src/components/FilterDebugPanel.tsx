import React from 'react';
import { useJiraStore } from '../store';

export const FilterDebugPanel: React.FC = () => {
  const filters = useJiraStore((state) => state.filters);
  const tickets = useJiraStore((state) => state.tickets);
  const filteredTickets = useJiraStore((state) => state.filteredTickets);
  const hasActiveFilters = useJiraStore((state) => state.hasActiveFilters);

  if (!hasActiveFilters) return null;

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4 font-mono text-sm">
      <h3 className="font-bold mb-2">Filter Debug Info</h3>
      <div className="space-y-2">
        <div>
          <span className="text-blue-600 dark:text-blue-400">Total Tickets:</span> {tickets.length}
        </div>
        <div>
          <span className="text-blue-600 dark:text-blue-400">Filtered Tickets:</span> {filteredTickets.length}
        </div>
        <div>
          <span className="text-blue-600 dark:text-blue-400">Active Filters:</span>
          <pre className="mt-1 p-2 bg-white dark:bg-gray-900 rounded overflow-auto">
            {JSON.stringify(filters, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};