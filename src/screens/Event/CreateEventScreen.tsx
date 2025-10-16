/**
 * Create Event Screen
 * Form for creating a new calendar event
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Header, Button, Input, LoadingOverlay } from '../../components';
import { RootStackParamList } from '../../types';
import { dataService } from '../../services';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import * as Calendar from 'expo-calendar';

type CreateEventScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateEvent'>;
type CreateEventScreenRouteProp = RouteProp<RootStackParamList, 'CreateEvent'>;

interface Props {
  navigation: CreateEventScreenNavigationProp;
  route: CreateEventScreenRouteProp;
}

export const CreateEventScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { groupId, date } = route.params || {};

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(date || new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 60 * 60 * 1000)); // 1 hour later
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreateEvent = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'You must be logged in to create events');
      return;
    }

    try {
      setLoading(true);

      // Ensure dates are proper Date objects
      const startDateTime = new Date(startDate);
      const endDateTime = new Date(endDate);

      // Create event in app database
      const eventData = {
        title: title.trim(),
        description: description.trim(),
        startDate: startDateTime,
        endDate: endDateTime,
        groupId: groupId || undefined,
        createdBy: user.id,
      };

      console.info('Creating event with data:', {
        ...eventData,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
      });

      const createdEvent = await dataService.createEvent(eventData);
      console.info('Event created successfully:', createdEvent);

      // Try to sync to native calendar
      try {
        const { status } = await Calendar.getCalendarPermissionsAsync();
        console.info('Calendar permission status:', status);

        if (status === 'granted') {
          const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
          const defaultCalendar = calendars.find((cal) => cal.allowsModifications) || calendars[0];

          if (defaultCalendar) {
            await Calendar.createEventAsync(defaultCalendar.id, {
              title: eventData.title,
              notes: eventData.description,
              startDate: new Date(eventData.startDate),
              endDate: new Date(eventData.endDate),
              timeZone: 'GMT',
            });
            console.info('Event synced to native calendar');
          }
        }
      } catch (calError) {
        console.error('Calendar sync error:', calError);
        // Don't fail if calendar sync fails
      }

      Alert.alert('Success', 'Event created successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error creating event:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create event';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateObj: Date) => {
    return (
      dateObj.toLocaleDateString() +
      ' ' +
      dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.md,
    },
    dateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.md,
    },
    dateLabel: {
      ...theme.typography.body2,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    dateText: {
      ...theme.typography.body1,
      color: theme.colors.text,
      flex: 1,
    },
    buttonContainer: {
      marginTop: theme.spacing.xl,
      gap: theme.spacing.md,
    },
  });

  return (
    <View style={styles.container}>
      <Header title="Create Event" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Input
          label="Event Title"
          placeholder="Enter event title"
          value={title}
          onChangeText={setTitle}
          icon="calendar"
        />

        <Input
          label="Description"
          placeholder="Enter event description"
          value={description}
          onChangeText={setDescription}
          icon="document-text"
          multiline
          numberOfLines={3}
        />

        <View>
          <Text style={styles.dateLabel}>Start Date & Time</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowStartPicker(true)}>
            <Text style={styles.dateText}>{formatDate(startDate)}</Text>
            <Ionicons name="calendar-outline" size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <View>
          <Text style={styles.dateLabel}>End Date & Time</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowEndPicker(true)}>
            <Text style={styles.dateText}>{formatDate(endDate)}</Text>
            <Ionicons name="calendar-outline" size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {groupId && (
          <Text style={[styles.dateLabel, { marginTop: theme.spacing.md }]}>
            Creating for Group
          </Text>
        )}

        <View style={styles.buttonContainer}>
          <Button
            title="Create Event"
            onPress={handleCreateEvent}
            loading={loading}
            disabled={loading || !title.trim()}
            fullWidth
          />
          <Button
            title="Cancel"
            onPress={() => navigation.goBack()}
            variant="outline"
            fullWidth
            disabled={loading}
          />
        </View>
      </ScrollView>

      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="datetime"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          themeVariant={theme.isDark ? 'dark' : 'light'}
          onChange={(event, selectedDate) => {
            // On Android, close immediately after selection
            if (Platform.OS === 'android') {
              setShowStartPicker(false);
            }
            if (event.type === 'set' && selectedDate) {
              setStartDate(selectedDate);
              // Auto-adjust end date if it's before start date
              if (selectedDate > endDate) {
                setEndDate(new Date(selectedDate.getTime() + 60 * 60 * 1000));
              }
              // Close picker on iOS after selection
              if (Platform.OS === 'ios') {
                setShowStartPicker(false);
              }
            } else if (event.type === 'dismissed') {
              setShowStartPicker(false);
            }
          }}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="datetime"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          themeVariant={theme.isDark ? 'dark' : 'light'}
          minimumDate={startDate}
          onChange={(event, selectedDate) => {
            // On Android, close immediately after selection
            if (Platform.OS === 'android') {
              setShowEndPicker(false);
            }
            if (event.type === 'set' && selectedDate) {
              setEndDate(selectedDate);
              // Close picker on iOS after selection
              if (Platform.OS === 'ios') {
                setShowEndPicker(false);
              }
            } else if (event.type === 'dismissed') {
              setShowEndPicker(false);
            }
          }}
        />
      )}

      <LoadingOverlay visible={loading} />
    </View>
  );
};
