/**
 * Custom hook for managing calendar permissions and sync
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import * as Calendar from 'expo-calendar';
import { dataService } from '../services';

interface UseCalendarSyncOptions {
  userId?: string;
  onImportComplete?: () => void;
}

export const useCalendarSync = ({ userId, onImportComplete }: UseCalendarSyncOptions = {}) => {
  const [calendarPermission, setCalendarPermission] = useState(false);
  const [importing, setImporting] = useState(false);

  // Check calendar permission on mount
  useEffect(() => {
    checkCalendarPermission();
  }, []);

  const checkCalendarPermission = async () => {
    const { status } = await Calendar.getCalendarPermissionsAsync();
    setCalendarPermission(status === 'granted');
  };

  const importNativeCalendarEvents = useCallback(async () => {
    if (!calendarPermission || !userId) {
      Alert.alert('Error', 'Calendar permission required');
      return;
    }

    try {
      setImporting(true);

      // Get all calendars
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      console.info('Found calendars:', calendars.length);

      // Define date range: 1 year in the past to 2 years in the future
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 2);

      let importedCount = 0;
      let skippedCount = 0;

      // Import events from all calendars
      for (const calendar of calendars) {
        try {
          const nativeEvents = await Calendar.getEventsAsync([calendar.id], startDate, endDate);

          console.info(`Found ${nativeEvents.length} events in ${calendar.title}`);

          // Import each event as a personal event
          for (const nativeEvent of nativeEvents) {
            try {
              // Skip events without proper dates
              if (!nativeEvent.startDate || !nativeEvent.endDate) {
                skippedCount++;
                continue;
              }

              const eventStart = new Date(nativeEvent.startDate);
              const eventEnd = new Date(nativeEvent.endDate);

              // Skip past events older than 30 days
              const thirtyDaysAgo = new Date();
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
              if (eventEnd < thirtyDaysAgo) {
                skippedCount++;
                continue;
              }

              // Create personal event in Firebase
              await dataService.createEvent({
                title: nativeEvent.title || 'Untitled Event',
                description: nativeEvent.notes || '',
                startDate: eventStart,
                endDate: eventEnd,
                createdBy: userId,
                location: nativeEvent.location || undefined,
                nativeCalendarEventId: nativeEvent.id,
              });

              importedCount++;
            } catch (error) {
              console.error('Error importing individual event:', error);
              skippedCount++;
            }
          }
        } catch (error) {
          console.error(`Error reading calendar ${calendar.title}:`, error);
        }
      }

      setImporting(false);
      Alert.alert(
        'Import Complete',
        `Successfully imported ${importedCount} events from your device calendar.${
          skippedCount > 0 ? ` Skipped ${skippedCount} events (too old or invalid).` : ''
        }`,
        [{ text: 'OK', onPress: onImportComplete }]
      );
    } catch (error) {
      setImporting(false);
      console.error('Error importing calendar events:', error);
      Alert.alert('Import Failed', 'Failed to import calendar events. Please try again.');
    }
  }, [calendarPermission, userId, onImportComplete]);

  const requestCalendarPermission = useCallback(async () => {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    setCalendarPermission(status === 'granted');

    if (status === 'granted') {
      // Ask user if they want to import existing calendar events
      Alert.alert(
        'Calendar Sync Enabled',
        'Would you like to import your existing calendar events into the app?',
        [
          { text: 'Not Now', style: 'cancel' },
          {
            text: 'Import Events',
            onPress: () => importNativeCalendarEvents(),
          },
        ]
      );
    }
  }, [importNativeCalendarEvents]);

  const syncEventToNativeCalendar = useCallback(
    async (event: {
      id: string;
      title: string;
      description?: string;
      startDate: Date;
      endDate: Date;
      location?: string;
      reminders?: number[];
    }) => {
      if (!calendarPermission) {
        Alert.alert('Permission Required', 'Calendar permission is required to sync events.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Grant Permission', onPress: requestCalendarPermission },
        ]);
        return;
      }

      try {
        // Get default calendar
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        const defaultCalendar = calendars.find((cal) => cal.allowsModifications) || calendars[0];

        if (!defaultCalendar) {
          Alert.alert('Error', 'No calendar available for sync');
          return;
        }

        // Create event in native calendar
        const eventId = await Calendar.createEventAsync(defaultCalendar.id, {
          title: event.title,
          startDate: new Date(event.startDate),
          endDate: new Date(event.endDate),
          location: event.location,
          notes: event.description,
          alarms: event.reminders?.map((minutes) => ({ relativeOffset: -minutes })),
        });

        // Update event with native calendar ID
        await dataService.updateEvent(event.id, {
          syncedToNativeCalendar: true,
          nativeCalendarEventId: eventId,
        });

        Alert.alert('Success', 'Event synced to your device calendar');
      } catch (error) {
        console.error('Error syncing event:', error);
        Alert.alert('Error', 'Failed to sync event to calendar');
      }
    },
    [calendarPermission, requestCalendarPermission]
  );

  return {
    calendarPermission,
    importing,
    requestCalendarPermission,
    importNativeCalendarEvents,
    syncEventToNativeCalendar,
    checkCalendarPermission,
  };
};
