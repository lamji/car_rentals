'use client'

import { Button } from '../../../components/ui/button';

/**
 * Bookings filter tabs component
 * @param filter - Current active filter
 * @param setFilter - Function to update filter
 * @returns {JSX.Element} Filter tabs component
 */
export function BookingsFilters({ 
  filter, 
  setFilter 
}: { 
  filter: 'all' | 'upcoming' | 'active' | 'completed' | 'cancelled'; 
  setFilter: React.Dispatch<React.SetStateAction<'all' | 'upcoming' | 'active' | 'completed' | 'cancelled'>>; 
}) {
  const statuses = ['all', 'upcoming', 'active', 'completed', 'cancelled']
  
  return (
    <div data-id="bookings-filters" className="bg-white border-b">
      <div data-id="bookings-filters-container" className="px-4 sm:px-6">
        <div data-id="bookings-filters-list" className="flex space-x-1 sm:space-x-2 overflow-x-auto py-3">
          {statuses.map((status) => (
            <Button
              key={status}
              data-id={`bookings-filter-${status}-button`}
              variant={filter === status ? 'default' : 'secondary'}
              onClick={() => setFilter(status as 'all' | 'upcoming' | 'active' | 'completed' | 'cancelled')}
              className="px-3 sm:px-4 py-2 text-sm sm:text-base font-medium whitespace-nowrap"
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
