import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';
import { useJiraStore } from '../store';
import { JiraTicket } from '../types';

export const FileUpload: React.FC = () => {
  const setTickets = useJiraStore((state) => state.setTickets);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string) as JiraTicket[];
        setTickets(json);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        alert('Error parsing JSON file. Please ensure it\'s a valid JIRA export.');
      }
    };
    reader.readAsText(file);
  }, [setTickets]);

  return (
    <div className="flex items-center justify-center w-full">
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <Upload className="w-8 h-8 mb-3 text-gray-500" />
          <p className="mb-2 text-sm text-gray-500">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">JSON file containing JIRA tickets</p>
        </div>
        <input
          type="file"
          className="hidden"
          accept="application/json"
          onChange={handleFileUpload}
        />
      </label>
    </div>
  );
};