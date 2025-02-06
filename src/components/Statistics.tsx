import React from 'react';
import { useJiraStore } from '../store';

export const Statistics: React.FC = () => {
  const tickets = useJiraStore((state) => state.tickets);

  const tegTickets = tickets.length;
  const linkedToNonTeg = tickets.filter(ticket => 
    ticket.links.some(link => !link.key.startsWith('TEG-'))
  ).length;

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Total TEG Issues</h3>
        <p className="text-3xl font-bold text-blue-600">{tegTickets}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Linked to Non-TEG</h3>
        <p className="text-3xl font-bold text-green-600">{linkedToNonTeg}</p>
      </div>
    </div>
  );
};