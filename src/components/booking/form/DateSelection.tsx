"use client";

import { Calendar } from 'lucide-react';

interface DateSelectionProps {
  bookingDetails: {
    startDate?: string;
    endDate?: string;
  };
  onStartDateClick: () => void;
  onEndDateClick: () => void;
  getDisplayDate: (date: string | undefined) => string;
}

export function DateSelection({ 
  bookingDetails, 
  onStartDateClick, 
  onEndDateClick, 
  getDisplayDate 
}: DateSelectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Calendar className="h-4 w-4 inline mr-1" />
          Start Date
        </label>
        <button
          onClick={onStartDateClick}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-blue-300 transition-colors"
        >
          <span className={bookingDetails.startDate ? 'text-gray-900' : 'text-gray-500'}>
            {getDisplayDate(bookingDetails.startDate)}
          </span>
          <Calendar className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Calendar className="h-4 w-4 inline mr-1" />
          End Date
        </label>
        <button
          onClick={onEndDateClick}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-blue-300 transition-colors"
          disabled={!bookingDetails.startDate}
        >
          <span className={bookingDetails.endDate ? 'text-gray-900' : 'text-gray-500'}>
            {getDisplayDate(bookingDetails.endDate)}
          </span>
          <Calendar className="h-4 w-4 text-gray-400" />
        </button>
      </div>
    </div>
  );
}
