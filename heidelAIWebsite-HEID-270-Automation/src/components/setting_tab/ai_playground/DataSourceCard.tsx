import React from 'react';
import { Plus } from 'lucide-react';

interface DataSourceCardProps {
  title: string;
  description: string;
  buttonText: string;
  onAdd: () => void;
  children: React.ReactNode;
}

export function DataSourceCard({ title, description, buttonText, onAdd, children }: DataSourceCardProps) {
  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-5 w-full">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        {/* <button 
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {buttonText}
        </button> */}
      </div>
      <div className="border-t border-gray-100 border-dashed pt-2">
        {children}
      </div>
    </div>
  );
}