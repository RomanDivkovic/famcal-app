/**
 * Calendar Screen - Display personal and group events
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Header, EventCard, Button } from '../../components';
import { dataService } from '../../services';
import { Event } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import * as Calendar from 'expo-calendar';
import { startOfMonth, endOfMonth, addMonths, subMonths, format } from 'date-fns';

export const CalendarScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarPermission, setCalendarPermission] = useState(false);

  useEffect(() => {
    loadEvents();
    checkCalendarPermission();
  }, [currentMonth]);

  const checkCalendarPermission = async () => {
    const { status } = await Calendar.getCalendarPermissionsAsync();
    setCalendarPermission(status === 'granted');
  };

  const requestCalendarPermission = async () => {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    setCalendarPermission(status === 'granted');

    if (status === 'granted') {
      Alert.alert(
        'Success',
        'Calendar permission granted. You can now sync events to your device calendar.'
      );
    }
  };

  const loadEvents = async () => {
    if (!user) return;

    try {
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);

      const monthEvents = await dataService.getEventsInDateRange(start, end, user.id);
      setEvents(
        monthEvents.sort(
          (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        )
      );
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncEventToNativeCalendar = async (event: Event) => {
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
      loadEvents();
    } catch (error) {
      console.error('Error syncing event:', error);
      Alert.alert('Error', 'Failed to sync event to calendar');
    }
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleCreateEvent = () => {
    navigation.navigate('CreateEvent');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    monthSelector: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    monthButton: {
      padding: theme.spacing.sm,
    },
    monthText: {
      ...theme.typography.h6,
      color: theme.colors.text,
    },
    content: {
      flex: 1,
      padding: theme.spacing.md,
    },
    syncButton: {
      margin: theme.spacing.md,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    emptyIcon: {
      marginBottom: theme.spacing.lg,
    },
    emptyTitle: {
      ...theme.typography.h5,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
    },
    emptyText: {
      ...theme.typography.body1,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    fab: {
      position: 'absolute',
      right: theme.spacing.lg,
      bottom: theme.spacing.lg,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.large,
    },
  });

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="calendar-outline"
        size={80}
        color={theme.colors.textSecondary}
        style={styles.emptyIcon}
      />
      <Text style={styles.emptyTitle}>No Events This Month</Text>
      <Text style={styles.emptyText}>Create an event to get started</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Calendar" />

      <View style={styles.monthSelector}>
        <TouchableOpacity style={styles.monthButton} onPress={handlePreviousMonth}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <Text style={styles.monthText}>{format(currentMonth, 'MMMM yyyy')}</Text>

        <TouchableOpacity style={styles.monthButton} onPress={handleNextMonth}>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {!calendarPermission && (
        <Button
          title="Enable Calendar Sync"
          onPress={requestCalendarPermission}
          variant="outline"
          style={styles.syncButton}
        />
      )}

      <FlatList
        data={events}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            onPress={() => {
              if (!item.syncedToNativeCalendar && calendarPermission) {
                Alert.alert(
                  'Sync Event',
                  'Would you like to sync this event to your device calendar?',
                  [
                    { text: 'Not Now', style: 'cancel' },
                    { text: 'Sync', onPress: () => syncEventToNativeCalendar(item) },
                  ]
                );
              }
            }}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.content, events.length === 0 && { flex: 1 }]}
        ListEmptyComponent={renderEmpty}
      />

      <TouchableOpacity style={styles.fab} onPress={handleCreateEvent}>
        <Ionicons name="add" size={32} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
};
