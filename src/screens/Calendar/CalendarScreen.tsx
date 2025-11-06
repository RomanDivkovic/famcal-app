/**
 * Calendar Screen - Display personal and group events (Refactored)
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
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
import { Header, EventCard, Button, JoinGroupBottomSheet } from '../../components';
import { Event, MainTabParamList } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useEvents, useGroups, useCalendarSync, useCalendarDates } from '../../hooks';
import { Calendar as RNCalendar, DateData } from 'react-native-calendars';
import { createCalendarStyles } from './CalendarScreen.styles';

type CalendarScreenNavigationProp = NativeStackNavigationProp<MainTabParamList, 'Calendar'>;

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
    requestCalendarPermission,
    importNativeCalendarEvents,
    syncEventToNativeCalendar,
  } = useCalendarSync({ userId: user?.id, onImportComplete: refresh });

  // UI state
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showUpcomingModal, setShowUpcomingModal] = useState(false);

  const styles = createCalendarStyles(theme);

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

      {/* Calendar Sync Buttons */}
      {!calendarPermission && (
        <Button
          title="Enable Calendar Sync"
          onPress={requestCalendarPermission}
          variant="outline"
          style={styles.syncButton}
        />
      )}

      {calendarPermission && (
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
                        // @ts-expect-error - EventDetail is in RootStack but not in MainTab
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
