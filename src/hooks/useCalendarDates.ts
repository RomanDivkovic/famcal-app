/**
 * Custom hook for managing calendar date selection and filtering
 */

import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { Event } from '../types';

export const useCalendarDates = (events: Event[]) => {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);

  // Filter events by selected date
  useEffect(() => {
    const dayEvents = events.filter((event) => {
      const eventDate = format(new Date(event.startDate), 'yyyy-MM-dd');
      return eventDate === selectedDate;
    });

    setFilteredEvents(
      dayEvents.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    );
  }, [events, selectedDate]);

  // Create marked dates object for calendar
  const markedDates = useMemo(() => {
    const marked: {
      [key: string]: {
        marked?: boolean;
        dots?: Array<{ color: string }>;
        selected?: boolean;
        selectedColor?: string;
      };
    } = {};

    events.forEach((event) => {
      const dateKey = format(new Date(event.startDate), 'yyyy-MM-dd');
      if (!marked[dateKey]) {
        marked[dateKey] = { marked: true, dots: [] };
      }
      marked[dateKey].dots!.push({
        color: '#4A90E2', // This will be replaced with theme color in component
      });
    });

    // Mark selected date
    marked[selectedDate] = {
      ...(marked[selectedDate] || {}),
      selected: true,
      selectedColor: '#4A90E2', // This will be replaced with theme color in component
    };

    return marked;
  }, [events, selectedDate]);

  // Get upcoming events (from today forward)
  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return events
      .filter((event) => new Date(event.startDate) >= today)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [events]);

  return {
    selectedDate,
    setSelectedDate,
    filteredEvents,
    markedDates,
    upcomingEvents,
  };
};
