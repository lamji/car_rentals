"use client";

import { useState, useEffect, useRef } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, addMonths, subMonths, isBefore, startOfDay, isToday } from 'date-fns'
import { LucideIcon } from 'lucide-react'

interface InlineDatePickerFieldProps {
  label?: string
  selectedDate?: Date
  onDateSelect: (date: Date) => void
  disabled?: boolean
  minDate?: Date
  disabledDates?: Date[]
  icon?: LucideIcon
  className?: string
  id?: string
  'data-testid'?: string
  onOpen?: (openCalendar: () => void) => void
}

export function InlineDatePickerField({ 
  label, 
  selectedDate, 
  onDateSelect, 
  disabled = false,
  minDate,
  disabledDates = [],
  icon: Icon = Calendar,
  className = "",
  id,
  'data-testid': dataTestId,
  onOpen
}: InlineDatePickerFieldProps) {
  const [showCalendar, setShowCalendar] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date())
  const containerRef = useRef<HTMLDivElement>(null)

  // Sync current month with selected date
  useEffect(() => {
    if (selectedDate) {
      setCurrentMonth(selectedDate)
    }
  }, [selectedDate])

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowCalendar(false)
      }
    }

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCalendar])

  const renderDays = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const days = eachDayOfInterval({ start: startDate, end: endDate })

    return days.map((day) => {
      const isSelected = selectedDate && isSameDay(day, selectedDate)
      const isCurrentMonth = isSameMonth(day, currentMonth)
      const isTodayDate = isToday(day)
      const isDateBlocked = disabledDates.some((d) => isSameDay(day, d))
      const normalizedMinDate = minDate ? startOfDay(minDate) : startOfDay(new Date())
      const isDisabled = isBefore(day, normalizedMinDate) || isDateBlocked

      return (
        <button
          key={day.toISOString()}
          onClick={() => {
            if (!isDisabled) {
              onDateSelect(day)
              setShowCalendar(false)
            }
          }}
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
      )
    })
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const getDisplayDateText = (date?: Date) => {
    if (!date) return 'Select date'
    return format(date, 'MMM dd, yyyy')
  }

  return (
    <div 
      className={`relative ${className}`} 
      ref={containerRef}
      id={id}
      data-testid={dataTestId}
    >
      {label && (
        <label 
          className="block text-sm font-medium text-gray-700 mb-2"
          id={id ? `${id}-label` : undefined}
          data-testid={dataTestId ? `${dataTestId}-label` : undefined}
        >
          {Icon && <Icon className="h-4 w-4 inline mr-1" />}
          {label}
        </label>
      )}
      <button
        onClick={() => {
          if (disabled) return;
          if (showCalendar) {
            setShowCalendar(false);
            return;
          }
          if (onOpen) {
            onOpen(() => setShowCalendar(true));
          } else {
            setShowCalendar(true);
          }
        }}
        disabled={disabled}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        id={id ? `${id}-button` : undefined}
        data-testid={dataTestId ? `${dataTestId}-button` : undefined}
      >
        <span 
          className={selectedDate ? 'text-gray-900' : 'text-gray-500'}
          id={id ? `${id}-button-text` : undefined}
          data-testid={dataTestId ? `${dataTestId}-button-text` : undefined}
        >
          {getDisplayDateText(selectedDate)}
        </span>
        {Icon && <Icon className="h-4 w-4 text-gray-400" />}
      </button>
      {showCalendar && !disabled && (
        <div 
          className="absolute z-50 mt-1 top-full"
          id={id ? `${id}-calendar-container` : undefined}
          data-testid={dataTestId ? `${dataTestId}-calendar-container` : undefined}
        >
          <div 
            className="bg-white border-0 rounded-lg p-4 shadow-lg"
            id={id ? `${id}-calendar` : undefined}
            data-testid={dataTestId ? `${dataTestId}-calendar` : undefined}
          >
            <div 
              className="flex items-center justify-center mb-4"
              id={id ? `${id}-calendar-header` : undefined}
              data-testid={dataTestId ? `${dataTestId}-calendar-header` : undefined}
            >
              <div 
                className="flex items-center gap-2"
                id={id ? `${id}-calendar-nav` : undefined}
                data-testid={dataTestId ? `${dataTestId}-calendar-nav` : undefined}
              >
                <button
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  id={id ? `${id}-prev-month` : undefined}
                  data-testid={dataTestId ? `${dataTestId}-prev-month` : undefined}
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600" />
                </button>
                <span 
                  className="text-sm font-medium text-gray-700 min-w-[120px] text-center"
                  id={id ? `${id}-current-month` : undefined}
                  data-testid={dataTestId ? `${dataTestId}-current-month` : undefined}
                >
                  {format(currentMonth, 'MMMM yyyy')}
                </span>
                <button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  id={id ? `${id}-next-month` : undefined}
                  data-testid={dataTestId ? `${dataTestId}-next-month` : undefined}
                >
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>

            <div 
              className="grid grid-cols-7 gap-1 mb-2"
              id={id ? `${id}-weekdays` : undefined}
              data-testid={dataTestId ? `${dataTestId}-weekdays` : undefined}
            >
              {weekDays.map((day) => (
                <div 
                  key={day} 
                  className="text-center text-xs font-medium text-gray-500 p-2"
                  id={id ? `${id}-weekday-${day.toLowerCase()}` : undefined}
                  data-testid={dataTestId ? `${dataTestId}-weekday-${day.toLowerCase()}` : undefined}
                >
                  {day}
                </div>
              ))}
            </div>

            <div 
              className="grid grid-cols-7 gap-1"
              id={id ? `${id}-days` : undefined}
              data-testid={dataTestId ? `${dataTestId}-days` : undefined}
            >
              {renderDays()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
