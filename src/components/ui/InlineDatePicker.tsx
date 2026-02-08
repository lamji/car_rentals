"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, addMonths, subMonths, isBefore, startOfDay, isToday } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface InlineDatePickerProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

export function InlineDatePicker({
  selectedDate,
  onDateSelect,
  minDate = startOfDay(new Date()),
  maxDate,
  className = "",
}: InlineDatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

  // Sync current month with selected date when it changes
  useEffect(() => {
    if (selectedDate) {
      setCurrentMonth(selectedDate);
    }
  }, [selectedDate]);

  const handleDateSelect = (date: Date) => {
    onDateSelect(date);
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const renderDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return days.map((day) => {
      const isSelected = selectedDate && isSameDay(day, selectedDate);
      const isCurrentMonth = isSameMonth(day, currentMonth);
      const isTodayDate = isToday(day);
      const isDisabled = isBefore(day, minDate) || (maxDate && isBefore(maxDate, day));

      return (
        <button
          key={day.toISOString()}
          onClick={() => !isDisabled && handleDateSelect(day)}
          disabled={isDisabled}
          className={`
            p-2 text-sm rounded-lg transition-all
            ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
            ${isTodayDate && !isSelected ? 'bg-blue-50 text-blue-600 font-semibold' : ''}
            ${isSelected ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
            ${!isSelected && !isDisabled && !isTodayDate ? 'hover:bg-gray-100' : ''}
            ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          `}
        >
          {format(day, 'd')}
        </button>
      );
    });
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePreviousMonth}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 p-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {renderDays()}
      </div>
    </div>
  );
}
