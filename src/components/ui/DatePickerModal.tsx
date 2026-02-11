"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, addMonths, subMonths, isBefore, startOfDay } from "date-fns";
import { X, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | undefined;
  onDateSelect: (date: Date) => void;
  title?: string;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: string[]; // Array of date strings in YYYY-MM-DD format
}

export function DatePickerModal({
  isOpen,
  onClose,
  selectedDate,
  onDateSelect,
  title = "Select Date",
  minDate = startOfDay(new Date()),
  maxDate,
  disabledDates = [],
}: DatePickerModalProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  const [localSelectedDate, setLocalSelectedDate] = useState(selectedDate);

  // Sync local state with prop when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalSelectedDate(selectedDate);
      setCurrentMonth(selectedDate || new Date());
    }
  }, [isOpen, selectedDate]);

  if (!isOpen) return null;

  const handleDateSelect = (date: Date) => {
    setLocalSelectedDate(date);
    onDateSelect(date);
    onClose();
  };

  // Use localSelectedDate for all visual logic
  const displayDate = localSelectedDate;

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const renderCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="w-full">
        {/* Week days header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = displayDate && isSameDay(day, displayDate);
            const isToday = isSameDay(day, new Date());
            const dayString = format(day, 'yyyy-MM-dd');
            const isDisabledByDates = disabledDates.includes(dayString);
            // Fix: Use date comparison instead of datetime for minDate check
            const isBeforeMinDate = isBefore(startOfDay(day), startOfDay(minDate));
            const isDisabled = isBeforeMinDate || (maxDate && isBefore(maxDate, day)) || isDisabledByDates;
            
            return (
              <button
                key={index}
                onClick={() => !isDisabled && handleDateSelect(day)}
                disabled={isDisabled}
                className={`
                  h-9 w-9 text-sm rounded-md transition-colors
                  ${!isCurrentMonth ? 'text-gray-400 opacity-50' : 'text-gray-900'}
                  ${isSelected ? 'bg-blue-600 text-white hover:bg-blue-600' : 'hover:bg-blue-50'}
                  ${isToday && !isSelected ? 'bg-blue-50 text-blue-900 font-semibold' : ''}
                  ${isDisabled ? 'text-gray-300 opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end justify-center">
      <div className="bg-white w-full max-w-md rounded-t-2xl shadow-xl animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Date Picker */}
        <div className="p-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePreviousMonth}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            
            <h3 className="text-lg font-semibold text-gray-900">
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
            
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Calendar Grid */}
          {renderCalendarDays()}
        </div>

        {/* Footer */}
        {/* <div className="px-4 pb-4 border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {displayDate ? `Selected: ${format(displayDate, "MMM dd, yyyy")}` : 'No date selected'}
            </span>
            <button
              onClick={handleConfirm}
              disabled={!displayDate}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                displayDate 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Confirm
            </button>
          </div>
        </div> */}
      </div>
    </div>
  );
}
