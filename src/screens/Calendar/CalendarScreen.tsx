/**
 * Calendar Screen - Display personal and group events (Refactored)
 * Features: Month/Week/Day views, Event details, Calendar sync
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
  Pressable,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  Header,
  EventCard,
  Button,
  JoinGroupBottomSheet,
  EventDetailBottomSheet,
  UpcomingEventsBottomSheet,
} from '../../components';
import { Event, MainTabParamList } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { format, addDays, startOfWeek, isSameDay, isToday } from 'date-fns';
import { useEvents, useGroups, useCalendarSync, useCalendarDates } from '../../hooks';
import { Calendar as RNCalendar, DateData } from 'react-native-calendars';
import { createCalendarStyles } from './CalendarScreen.styles';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
  FadeOut,
  Layout,
} from 'react-native-reanimated';
import { dataService } from '../../services';

type CalendarScreenNavigationProp = NativeStackNavigationProp<MainTabParamList, 'Calendar'>;
type ViewMode = 'month' | 'week' | 'day';

interface Props {
  navigation: CalendarScreenNavigationProp;
}

export const CalendarScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { events, loading, refresh } = useEvents(user?.id);
  const { groups, loading: groupsLoading, refresh: refreshGroups } = useGroups(user?.id);

  // Calendar date management
  const { selectedDate, setSelectedDate, filteredEvents, markedDates, upcomingEvents } =
    useCalendarDates(events);

  // Calendar sync functionality
  const {
    calendarPermission,
    importing,
    hasImportedEvents,
    requestCalendarPermission,
    importNativeCalendarEvents,
    syncEventToNativeCalendar,
  } = useCalendarSync({ userId: user?.id, onImportComplete: refresh });

  // UI state
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showUpcomingModal, setShowUpcomingModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  const styles = createCalendarStyles(theme);

  // Get week days for week view
  const weekDays = useMemo(() => {
    const start = startOfWeek(new Date(selectedDate), { weekStartsOn: 1 }); // Monday start
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [selectedDate]);

  // Check if a date has events
  const dateHasEvents = useCallback(
    (date: Date) => {
      const dateString = format(date, 'yyyy-MM-dd');
      return events.some((event) => {
        const eventDate = format(new Date(event.startDate), 'yyyy-MM-dd');
        return eventDate === dateString;
      });
    },
    [events]
  );

  // Update marked dates with theme color
  const themedMarkedDates = React.useMemo(() => {
    const themed = { ...markedDates };
    Object.keys(themed).forEach((key) => {
      if (themed[key].dots) {
        themed[key].dots = themed[key].dots!.map(() => ({
          color: theme.colors.primary,
        }));
      }
      if (themed[key].selectedColor) {
        themed[key].selectedColor = theme.colors.primary;
      }
    });
    return themed;
  }, [markedDates, theme.colors.primary]);

  const handleEventPress = useCallback((event: Event) => {
    setSelectedEvent(event);
    setShowEventDetail(true);
  }, []);

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

  const handleWeekDayPress = (date: Date) => {
    setSelectedDate(format(date, 'yyyy-MM-dd'));
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    const current = new Date(selectedDate);
    const newDate = direction === 'next' ? addDays(current, 1) : addDays(current, -1);
    setSelectedDate(format(newDate, 'yyyy-MM-dd'));
  };

  const handleEditEvent = useCallback(() => {
    if (selectedEvent) {
      setShowEventDetail(false);
      // For now, show alert - Edit screen to be implemented
      setTimeout(() => {
        Alert.alert(
          'Edit Event',
          'Event editing will navigate to a dedicated edit screen in a future update.',
          [{ text: 'OK' }]
        );
      }, 300);
    }
  }, [selectedEvent]);

  const handleDeleteEvent = useCallback(async () => {
    if (selectedEvent) {
      try {
        await dataService.deleteEvent(selectedEvent.id);
        setShowEventDetail(false);
        refresh();
      } catch (error) {
        console.error('Error deleting event:', error);
        Alert.alert('Error', 'Failed to delete event');
      }
    }
  }, [selectedEvent, refresh]);

  const handleEventDeleteFromList = useCallback(
    async (eventId: string) => {
      try {
        await dataService.deleteEvent(eventId);
        refresh();
      } catch (error) {
        console.error('Error deleting event:', error);
        Alert.alert('Error', 'Failed to delete event');
      }
    },
    [refresh]
  );

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
        <JoinGroupBottomSheet
          isVisible={showJoinModal}
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

      {/* View Mode Switcher */}
      <View style={styles.viewModeSwitcher}>
        {(['month', 'week', 'day'] as ViewMode[]).map((mode) => (
          <Pressable
            key={mode}
            style={[styles.viewModeButton, viewMode === mode && styles.viewModeButtonActive]}
            onPress={() => setViewMode(mode)}
          >
            <Text style={[styles.viewModeText, viewMode === mode && styles.viewModeTextActive]}>
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Upcoming Events Button */}
      <TouchableOpacity style={styles.upcomingButton} onPress={() => setShowUpcomingModal(true)}>
        <Ionicons name="list-outline" size={20} color={theme.colors.primary} />
        <Text style={styles.upcomingButtonText}>
          View Upcoming Events ({upcomingEvents.length})
        </Text>
      </TouchableOpacity>

      {/* Month View */}
      {viewMode === 'month' && (
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)}>
          <RNCalendar
            current={selectedDate}
            onDayPress={handleDayPress}
            onDayLongPress={handleDayLongPress}
            markedDates={themedMarkedDates}
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
        </Animated.View>
      )}

      {/* Week View */}
      {viewMode === 'week' && (
        <Animated.View
          style={styles.weekViewContainer}
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
        >
          <View style={styles.weekDayHeader}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <Text key={day} style={styles.weekDayLabel}>
                {day}
              </Text>
            ))}
          </View>
          <View style={styles.weekDayRow}>
            {weekDays.map((date) => {
              const isSelected = isSameDay(date, new Date(selectedDate));
              const isTodayDate = isToday(date);
              const hasEvents = dateHasEvents(date);

              return (
                <TouchableOpacity
                  key={date.toISOString()}
                  style={[
                    styles.weekDayButton,
                    isSelected && styles.weekDayButtonSelected,
                    !isSelected && isTodayDate && styles.weekDayButtonToday,
                  ]}
                  onPress={() => handleWeekDayPress(date)}
                  onLongPress={() =>
                    handleDayLongPress({
                      dateString: format(date, 'yyyy-MM-dd'),
                      day: date.getDate(),
                      month: date.getMonth() + 1,
                      year: date.getFullYear(),
                      timestamp: date.getTime(),
                    })
                  }
                >
                  <Text
                    style={[
                      styles.weekDayNumber,
                      isSelected && styles.weekDayNumberSelected,
                      !isSelected && isTodayDate && styles.weekDayNumberToday,
                    ]}
                  >
                    {format(date, 'd')}
                  </Text>
                  {hasEvents && (
                    <View style={[styles.weekDayDot, isSelected && styles.weekDayDotSelected]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      )}

      {/* Day View Navigation */}
      {viewMode === 'day' && (
        <Animated.View
          style={styles.dayViewHeader}
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
        >
          <TouchableOpacity style={styles.dayViewNavButton} onPress={() => navigateDay('prev')}>
            <Ionicons name="chevron-back" size={28} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.dayViewTitle}>{format(new Date(selectedDate), 'EEE, MMM d')}</Text>
          <TouchableOpacity style={styles.dayViewNavButton} onPress={() => navigateDay('next')}>
            <Ionicons name="chevron-forward" size={28} color={theme.colors.primary} />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Calendar Sync Button - Only show if not already imported */}
      {!calendarPermission && (
        <Button
          title="Enable Calendar Sync"
          onPress={requestCalendarPermission}
          variant="outline"
          style={styles.syncButton}
        />
      )}

      {calendarPermission && !hasImportedEvents && (
        <Button
          title="Import Device Calendar Events"
          onPress={importNativeCalendarEvents}
          variant="outline"
          style={styles.syncButton}
          loading={importing}
          disabled={importing}
          icon="download-outline"
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

      {/* FAB - Create Event */}
      <TouchableOpacity style={styles.fab} onPress={() => handleCreateEvent(undefined)}>
        <Ionicons name="add" size={32} color="#ffffff" />
      </TouchableOpacity>

      {/* Upcoming Events Bottom Sheet */}
      <UpcomingEventsBottomSheet
        isVisible={showUpcomingModal}
        onClose={() => setShowUpcomingModal(false)}
        events={upcomingEvents}
        onEventPress={handleEventPress}
        onEventDelete={handleEventDeleteFromList}
      />

      {/* Event Detail Bottom Sheet */}
      <EventDetailBottomSheet
        isVisible={showEventDetail}
        onClose={() => setShowEventDetail(false)}
        event={selectedEvent}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
      />
    </View>
  );
};
