"use client";

import { useState, useEffect, useRef } from 'react'
import { Clock } from 'lucide-react'
import { LucideIcon } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TimeOption {
  displayTime: string
  value: string
  hour: number
}

interface TimePickerFieldProps {
  label?: string
  selectedTime?: string
  onTimeSelect: (time: string) => void
  disabled?: boolean
  icon?: LucideIcon
  className?: string
  id?: string
  'data-testid'?: string
  timeOptions: TimeOption[]
  isTimeInPast: (time: string) => boolean
  isEndTimeInPast?: (time: string) => boolean
  isEndTimeDisabled?: (endTime: string, startTime: string | undefined, startDate: string | undefined, endDate: string | undefined) => boolean
  startTime?: string
  startDate?: string
  endDate?: string
}

export function TimePickerField({ 
  label, 
  selectedTime, 
  onTimeSelect, 
  disabled = false,
  icon: Icon = Clock,
  className = "",
  id,
  'data-testid': dataTestId,
  timeOptions,
  isTimeInPast,
  isEndTimeInPast,
  isEndTimeDisabled,
  startTime,
  startDate,
  endDate
}: TimePickerFieldProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  console.log("tets:label", label)

  // Helper function to convert 24-hour time to 12-hour format
  const formatTime12Hour = (time24: string) => {
    if (!time24) return '';

    const [hours] = time24.split(':').map(Number)
    const hour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    const period = hours < 12 ? 'AM' : 'PM'

    return `${hour}:00 ${period}`
  }

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

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
      <Select
        value={selectedTime || ''}
        onValueChange={(value) => {
          onTimeSelect(value)
          setShowDropdown(false)
        }}
        onOpenChange={setShowDropdown}
        disabled={disabled}
      >
        <SelectTrigger
          id={id ? `${id}-trigger` : undefined}
          data-testid={dataTestId ? `${dataTestId}-trigger` : undefined}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <SelectValue placeholder="Select time">
          {selectedTime ? formatTime12Hour(selectedTime) : null}
        </SelectValue>
        </SelectTrigger>
        <SelectContent
          id={id ? `${id}-content` : undefined}
          data-testid={dataTestId ? `${dataTestId}-content` : undefined}
          position="popper"
          align="start"
          className="max-h-48 overflow-y-auto"
        >
          {timeOptions.map(({ displayTime, value }) => {
            const isPast = isTimeInPast(value);
            const isEndPast = isEndTimeInPast && isEndTimeInPast(value);
            const isEndDisabled = isEndTimeDisabled && isEndTimeDisabled(value, startTime, startDate, endDate);
            // Use different validation logic based on whether this is start time or end time picker
            const isDisabled = label?.toLowerCase().includes('end') 
              ? (isEndPast || isEndDisabled) 
              : isPast;
            const disabledReason = isPast ? '' : isEndPast ? '' : isEndDisabled ? '' : '';
            
            return (
              <SelectItem
                key={value}
                value={value}
                disabled={isDisabled}
                id={id ? `${id}-option-${value.replace(':', '-')}` : undefined}
                data-testid={dataTestId ? `${dataTestId}-option-${value.replace(':', '-')}` : undefined}
              >
                {displayTime} {disabledReason}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  )
}
