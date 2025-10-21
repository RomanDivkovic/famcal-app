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
  Modal,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Header, EventCard, Button, JoinGroupModal } from '../../components';
import { dataService } from '../../services';
import { Event, MainTabParamList } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import * as Calendar from 'expo-calendar';
import { format } from 'date-fns';
import { useEvents, useGroups } from '../../hooks';
import { Calendar as RNCalendar, DateData } from 'react-native-calendars';

type CalendarScreenNavigationProp = NativeStackNavigationProp<MainTabParamList, 'Calendar'>;

interface Props {
  navigation: CalendarScreenNavigationProp;
}

export const CalendarScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { events, loading, refresh } = useEvents(user?.id);
  const { groups, loading: groupsLoading, refresh: refreshGroups } = useGroups(user?.id);

  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [calendarPermission, setCalendarPermission] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showUpcomingModal, setShowUpcomingModal] = useState(false);

  // Check calendar permission on mount
  useEffect(() => {
    checkCalendarPermission();
  }, []);

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
  const markedDates = React.useMemo(() => {
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
        color: theme.colors.primary,
      });
    });

    // Mark selected date
    marked[selectedDate] = {
      ...(marked[selectedDate] || {}),
      selected: true,
      selectedColor: theme.colors.primary,
    };

    return marked;
  }, [events, selectedDate, theme.colors.primary]);

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

  const handleCreateEvent = (date?: Date) => {
    // @ts-expect-error - CreateEvent is in RootStack but not in MainTab
    navigation.navigate('CreateEvent', { date });
  };

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  const handleDayLongPress = (day: DateData) => {
    const date = new Date(day.dateString);
    Alert.alert(
      'Create Event',
      `Would you like to create an event for ${format(date, 'MMMM d, yyyy')}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Create Event', onPress: () => handleCreateEvent(date) },
      ]
    );
  };

  // Get upcoming events (from today forward)
  const upcomingEvents = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return events
      .filter((event) => new Date(event.startDate) >= today)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [events]);

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
    selectedDateHeader: {
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    selectedDateText: {
      ...theme.typography.h6,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    eventCountText: {
      ...theme.typography.body2,
      color: theme.colors.textSecondary,
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
    upcomingButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      marginHorizontal: theme.spacing.md,
      marginVertical: theme.spacing.sm,
      paddingVertical: 12,
      paddingHorizontal: theme.spacing.md,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      gap: 8,
    },
    upcomingButtonText: {
      color: theme.colors.primary,
      fontSize: 14,
      fontWeight: '600',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '80%',
      paddingBottom: 20,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    upcomingEventsList: {
      padding: theme.spacing.md,
    },
    upcomingEventItem: {
      marginBottom: theme.spacing.md,
    },
    upcomingEventDate: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
      textTransform: 'uppercase',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    emptyStateText: {
      ...theme.typography.body1,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.md,
      textAlign: 'center',
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

  // Show join/create group screen if user has no groups
  if (!groupsLoading && groups.length === 0) {
    return (
      <View style={styles.container}>
        <Header title="Calendar" rightIcon="calendar" onRightPress={openNativeCalendar} />
        <View style={[styles.content, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
          <Ionicons
            name="people-outline"
            size={80}
            color={theme.colors.textSecondary}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyTitle}>No Group Yet</Text>
          <Text style={styles.emptyText}>
            You need to create or join a group to see events and manage tasks
          </Text>
          <View
            style={{ flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.lg }}
          >
            <Button
              title="Create Group"
              onPress={() => {
                navigation.navigate('CreateGroup' as never);
              }}
              style={{ flex: 1 }}
            />
            <Button
              title="Join Group"
              variant="outline"
              onPress={() => setShowJoinModal(true)}
              style={{ flex: 1 }}
            />
          </View>
        </View>
        <JoinGroupModal
          visible={showJoinModal}
          onClose={() => setShowJoinModal(false)}
          onSuccess={() => {
            refreshGroups();
            setShowJoinModal(false);
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Calendar" rightIcon="calendar" onRightPress={openNativeCalendar} />

      {/* Upcoming Events Button */}
      <TouchableOpacity style={styles.upcomingButton} onPress={() => setShowUpcomingModal(true)}>
        <Ionicons name="list-outline" size={20} color={theme.colors.primary} />
        <Text style={styles.upcomingButtonText}>
          View Upcoming Events ({upcomingEvents.length})
        </Text>
      </TouchableOpacity>

      {/* Calendar View */}
      <RNCalendar
        current={selectedDate}
        onDayPress={handleDayPress}
        onDayLongPress={handleDayLongPress}
        markedDates={markedDates}
        markingType="multi-dot"
        theme={{
          backgroundColor: theme.colors.background,
          calendarBackground: theme.colors.surface,
          textSectionTitleColor: theme.colors.textSecondary,
          selectedDayBackgroundColor: theme.colors.primary,
          selectedDayTextColor: '#ffffff',
          todayTextColor: theme.colors.primary,
          dayTextColor: theme.colors.text,
          textDisabledColor: theme.colors.border,
          dotColor: theme.colors.primary,
          selectedDotColor: '#ffffff',
          arrowColor: theme.colors.primary,
          monthTextColor: theme.colors.text,
          indicatorColor: theme.colors.primary,
          textDayFontFamily: 'Inter',
          textMonthFontFamily: 'Inter',
          textDayHeaderFontFamily: 'Inter',
          textDayFontWeight: '400',
          textMonthFontWeight: '600',
          textDayHeaderFontWeight: '500',
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 12,
        }}
      />

      {!calendarPermission && (
        <Button
          title="Enable Calendar Sync"
          onPress={requestCalendarPermission}
          variant="outline"
          style={styles.syncButton}
        />
      )}

      {/* Events for Selected Day */}
      <View style={styles.selectedDateHeader}>
        <Text style={styles.selectedDateText}>
          {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
        </Text>
        <Text style={styles.eventCountText}>
          {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
        </Text>
      </View>

      <FlatList
        data={filteredEvents}
        renderItem={({ item }) => <EventCard event={item} onPress={() => handleEventPress(item)} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.content, filteredEvents.length === 0 && { flex: 1 }]}
        ListEmptyComponent={renderEmpty}
        refreshing={loading}
        onRefresh={refresh}
      />

      <TouchableOpacity style={styles.fab} onPress={() => handleCreateEvent(undefined)}>
        <Ionicons name="add" size={32} color="#ffffff" />
      </TouchableOpacity>

      {/* Upcoming Events Modal */}
      <Modal
        visible={showUpcomingModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowUpcomingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upcoming Events</Text>
              <TouchableOpacity onPress={() => setShowUpcomingModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {upcomingEvents.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color={theme.colors.textSecondary} />
                <Text style={styles.emptyStateText}>No upcoming events</Text>
              </View>
            ) : (
              <FlatList
                data={upcomingEvents}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.upcomingEventItem}>
                    <Text style={styles.upcomingEventDate}>
                      {format(new Date(item.startDate), 'MMM d, yyyy')}
                    </Text>
                    <EventCard
                      event={item}
                      onPress={() => {
                        setShowUpcomingModal(false);
                        // @ts-expect-error - EventDetail is in RootStack
                        navigation.navigate('EventDetail', { eventId: item.id });
                      }}
                    />
                  </View>
                )}
                contentContainerStyle={styles.upcomingEventsList}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};
