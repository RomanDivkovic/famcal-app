/**
 * Calendar Screen - Display personal and group events
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Header, EventCard, Button } from '../../components';
import { dataService } from '../../services';
import { Event, MainTabParamList } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import * as Calendar from 'expo-calendar';
import { startOfMonth, endOfMonth, addMonths, subMonths, format } from 'date-fns';
import { useEvents } from '../../hooks';

type CalendarScreenNavigationProp = NativeStackNavigationProp<MainTabParamList, 'Calendar'>;

interface Props {
  navigation: CalendarScreenNavigationProp;
}

export const CalendarScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { events, loading, refresh } = useEvents(user?.id);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarPermission, setCalendarPermission] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);

  // Check calendar permission on mount
  useEffect(() => {
    checkCalendarPermission();
  }, []);

  // Filter events by current month
  useEffect(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);

    const monthEvents = events.filter((event) => {
      const eventDate = new Date(event.startDate);
      return eventDate >= start && eventDate <= end;
    });

    setFilteredEvents(
      monthEvents.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    );
  }, [events, currentMonth]);

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

  const syncEventToNativeCalendar = useCallback(
    async (event: Event) => {
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
        refresh();
      } catch (error) {
        console.error('Error syncing event:', error);
        Alert.alert('Error', 'Failed to sync event to calendar');
      }
    },
    [calendarPermission, refresh]
  );

  const handleEventPress = useCallback(
    (event: Event) => {
      if (!event.syncedToNativeCalendar && calendarPermission) {
        Alert.alert('Sync Event', 'Would you like to sync this event to your device calendar?', [
          { text: 'Not Now', style: 'cancel' },
          { text: 'Sync', onPress: () => syncEventToNativeCalendar(event) },
        ]);
      }
    },
    [calendarPermission, syncEventToNativeCalendar]
  );

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleCreateEvent = () => {
    // @ts-expect-error - CreateEvent is in RootStack but not in MainTab
    navigation.navigate('CreateEvent');
  };

  const openNativeCalendar = async () => {
    try {
      const url = Platform.select({
        ios: 'calshow://',
        android: 'content://com.android.calendar/time/',
        default: '',
      });

      if (!url) {
        Alert.alert('Not Supported', 'Opening native calendar is not supported on this platform');
        return;
      }

      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open native calendar app');
      }
    } catch (error) {
      console.error('Error opening calendar:', error);
      Alert.alert('Error', 'Failed to open native calendar');
    }
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
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
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
      <Header title="Calendar" rightIcon="calendar" onRightPress={openNativeCalendar} />

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
        data={filteredEvents}
        renderItem={({ item }) => <EventCard event={item} onPress={() => handleEventPress(item)} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.content, filteredEvents.length === 0 && { flex: 1 }]}
        ListEmptyComponent={renderEmpty}
        refreshing={loading}
        onRefresh={refresh}
      />

      <TouchableOpacity style={styles.fab} onPress={handleCreateEvent}>
        <Ionicons name="add" size={32} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
};
