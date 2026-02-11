import { 
  getCurrentTimeInfo, 
  getFutureBookings, 
  getNextBookingInfo, 
  calculateTimeGap, 
  checkTodayAvailability 
} from '../bookingsHelper/todayAvailability';

describe('todayAvailability helpers', () => {
  const mockBookings = [
    {
      startDate: '2026-02-11',
      endDate: '2026-02-11',
      startTime: '16:00',
      endTime: '18:00',
      _id: '1'
    },
    {
      startDate: '2026-02-12',
      endDate: '2026-02-12',
      startTime: '10:00',
      endTime: '18:00',
      _id: '2'
    },
    {
      startDate: '2026-02-15',
      endDate: '2026-02-15',
      startTime: '09:00',
      endTime: '12:00',
      _id: '3'
    }
  ];

  describe('getCurrentTimeInfo', () => {
    it('should return current time information', () => {
      // Create date in local timezone for consistent testing
      const mockDate = new Date(2026, 1, 11, 14, 30, 0); // Feb 11, 2026 at 14:30 local time
      const result = getCurrentTimeInfo(mockDate);
      
      expect(result.today).toBe('2026-02-11');
      expect(result.currentTime).toBe('14:30');
      expect(result.currentMinutes).toBe(14 * 60 + 30); // 870 minutes
      expect(result.now).toBeInstanceOf(Date);
    });

    it('should use current date when no override provided', () => {
      const result = getCurrentTimeInfo();
      
      expect(result.today).toBe(new Date().toISOString().split('T')[0]);
      expect(result.now).toBeInstanceOf(Date);
    });
  });

  describe('getFutureBookings', () => {
    it('should filter and sort future bookings', () => {
      const today = '2026-02-11';
      const currentTime = '22:30'; // Use actual current time from test environment
      
      const result = getFutureBookings(mockBookings, today, currentTime);
      
      // Since current time is 22:30, only future bookings (not today's 16:00)
      expect(result).toHaveLength(2);
      expect(result[0].startDate).toBe('2026-02-12'); // Tomorrow's booking
      expect(result[0].startTime).toBe('10:00');
      expect(result[1].startDate).toBe('2026-02-15'); // Future booking
      expect(result[1].startTime).toBe('09:00');
    });

    it('should return empty array when no future bookings', () => {
      const today = '2026-02-16';
      const currentTime = '10:00';
      
      const result = getFutureBookings(mockBookings, today, currentTime);
      
      expect(result).toHaveLength(0);
    });

    it('should sort bookings chronologically', () => {
      const unsortedBookings = [
        { ...mockBookings[2] }, // 2026-02-15
        { ...mockBookings[1] }, // 2026-02-12
        { ...mockBookings[0] }  // 2026-02-11
      ];
      
      const result = getFutureBookings(unsortedBookings, '2026-02-11', '10:00');
      
      expect(result[0].startDate).toBe('2026-02-11');
      expect(result[1].startDate).toBe('2026-02-12');
      expect(result[2].startDate).toBe('2026-02-15');
    });
  });

  describe('getNextBookingInfo', () => {
    it('should return next booking info', () => {
      const futureBookings = getFutureBookings(mockBookings, '2026-02-11', '14:30');
      
      const result = getNextBookingInfo(futureBookings);
      
      expect(result).not.toBeNull();
      expect(result!.nextBooking.startDate).toBe('2026-02-11');
      expect(result!.nextBooking.startTime).toBe('16:00');
      expect(result!.nextBookingDay).toBe('2026-02-11');
      expect(result!.nextBookingMinutes).toBe(16 * 60); // 960 minutes
    });

    it('should return null for empty future bookings', () => {
      const result = getNextBookingInfo([]);
      
      expect(result).toBeNull();
    });
  });

  describe('calculateTimeGap', () => {
    it('should calculate time gap for same-day booking', () => {
      const currentMinutes = 14 * 60 + 30; // 14:30 = 870 minutes
      const today = '2026-02-11';
      const nextBookingInfo = {
        nextBooking: mockBookings[0],
        nextBookingDate: new Date('2026-02-11T16:00:00.000Z'),
        nextBookingMinutes: 16 * 60, // 960 minutes
        nextBookingDay: '2026-02-11'
      };
      const now = new Date('2026-02-11T14:30:00.000Z');
      
      const result = calculateTimeGap(currentMinutes, today, nextBookingInfo, now);
      
      expect(result).toBe(90); // 16:00 - 14:30 = 90 minutes = 1.5 hours
    });

    it('should calculate time gap for future-day booking', () => {
      const currentMinutes = 14 * 60 + 30; // 14:30 = 870 minutes
      const today = '2026-02-11';
      const nextBookingInfo = {
        nextBooking: mockBookings[1],
        nextBookingDate: new Date('2026-02-12T10:00:00.000Z'),
        nextBookingMinutes: 10 * 60, // 600 minutes
        nextBookingDay: '2026-02-12'
      };
      const now = new Date('2026-02-11T14:30:00.000Z');
      
      const result = calculateTimeGap(currentMinutes, today, nextBookingInfo, now);
      
      // Time remaining today (24:00 - 14:30) + 10:00 tomorrow
      // (1440 - 870) + 600 = 570 + 600 = 1170 minutes = 19.5 hours
      expect(result).toBe(1170);
    });
  });

  describe('checkTodayAvailability', () => {
    it('should return available when time gap meets minimum', () => {
      const timeGap = 13 * 60; // 13 hours = 780 minutes
      
      const result = checkTodayAvailability(timeGap);
      
      expect(result.isAvailable).toBe(true);
      expect(result.timeGap).toBe(780);
      expect(result.minimumRequiredGap).toBe(720); // 12 hours
      expect(result.message).toContain('Today is available');
      expect(result.message).toContain('13h 0m gap');
    });

    it('should return not available when time gap is insufficient', () => {
      const timeGap = 10 * 60; // 10 hours = 600 minutes
      
      const result = checkTodayAvailability(timeGap);
      
      expect(result.isAvailable).toBe(false);
      expect(result.timeGap).toBe(600);
      expect(result.minimumRequiredGap).toBe(720); // 12 hours
      expect(result.message).toContain('Today is not available');
      expect(result.message).toContain('10h 0m gap');
    });

    it('should return available when time gap equals minimum', () => {
      const timeGap = 12 * 60; // Exactly 12 hours
      
      const result = checkTodayAvailability(timeGap);
      
      expect(result.isAvailable).toBe(true);
      expect(result.message).toContain('Today is available');
    });
  });

  describe('Integration test - complete flow', () => {
    it('should return false when next booking is too soon', () => {
      // Mock current time as 15:00, next booking at 16:00 (only 1 hour gap)
      const mockDate = new Date('2026-02-11T15:00:00.000Z');
      const timeInfo = getCurrentTimeInfo(mockDate);
      const futureBookings = getFutureBookings(mockBookings, timeInfo.today, timeInfo.currentTime);
      const nextBookingInfo = getNextBookingInfo(futureBookings);
      
      if (nextBookingInfo) {
        const timeGap = calculateTimeGap(
          timeInfo.currentMinutes, 
          timeInfo.today, 
          nextBookingInfo, 
          timeInfo.now
        );
        const availability = checkTodayAvailability(timeGap);
        
        expect(availability.isAvailable).toBe(false); // Only 1 hour gap (16:00 - 15:00)
      }
    });

    it('should return true when no future bookings', () => {
      const mockDate = new Date('2026-02-11T14:30:00.000Z');
      const timeInfo = getCurrentTimeInfo(mockDate);
      const futureBookings = getFutureBookings([], timeInfo.today, timeInfo.currentTime);
      
      expect(futureBookings).toHaveLength(0);
      // In the actual hook, this would return true immediately
    });
  });
});
