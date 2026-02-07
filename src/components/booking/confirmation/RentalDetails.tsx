import { Calendar, Clock } from 'lucide-react'

interface RentalDetailsProps {
  rentalDuration?: string | null
  startDate?: string
  startTime?: string
  endDate?: string
  endTime?: string
}

export function RentalDetails({
  rentalDuration,
  startDate,
  startTime,
  endDate,
  endTime
}: RentalDetailsProps) {
  const formatTimeDisplay = (time24: string): string => {
    const [hours] = time24.split(':').map(Number);
    const hour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const period = hours < 12 ? 'AM' : 'PM';
    return `${hour}:00 ${period}`;
  };

  return (
    <>
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200" data-testid="rental-duration">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-blue-900">Rental Duration</span>
        </div>
        <p className="text-sm text-blue-800 font-semibold" data-testid="rental-duration-value">
          {rentalDuration || 'Not calculated'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2" data-testid="start-datetime">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="font-medium">Start Date & Time</span>
          </div>
          <p className="text-sm text-gray-600" data-testid="start-datetime-value">
            {startDate} at {startTime ? formatTimeDisplay(startTime) : ''}
          </p>
        </div>
        <div className="space-y-2" data-testid="end-datetime">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="font-medium">End Date & Time</span>
          </div>
          <p className="text-sm text-gray-600" data-testid="end-datetime-value">
            {endDate} at {endTime ? formatTimeDisplay(endTime) : ''}
          </p>
        </div>
      </div>
    </>
  )
}
