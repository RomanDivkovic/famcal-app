/**
 * Event Detail Screen
 * Display full details of an event with edit and delete options
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Header, Button, LoadingOverlay } from '../../components';
import { RootStackParamList, Event } from '../../types';
import { dataService } from '../../services';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

type EventDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EventDetail'>;
type EventDetailScreenRouteProp = RouteProp<RootStackParamList, 'EventDetail'>;

interface Props {
  navigation: EventDetailScreenNavigationProp;
  route: EventDetailScreenRouteProp;
}

export const EventDetailScreen = ({ navigation, route }: Props) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { eventId } = route.params;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const eventData = await dataService.getEventById(eventId);
      setEvent(eventData);
    } catch (error) {
      console.error('Error loading event:', error);
      Alert.alert('Error', 'Failed to load event');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const handleDelete = async () => {
    Alert.alert('Delete Event', 'Are you sure you want to delete this event?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setDeleting(true);
            await dataService.deleteEvent(eventId);
            Alert.alert('Success', 'Event deleted successfully');
            navigation.goBack();
          } catch (error) {
            console.error('Error deleting event:', error);
            Alert.alert('Error', 'Failed to delete event');
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  const formatDateTime = (date: Date) => {
    return format(date, "EEEE, MMMM d, yyyy 'at' h:mm a");
  };

  const canEdit = event && user?.id === event.createdBy;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.md,
    },
    section: {
      marginBottom: theme.spacing.lg,
    },
    title: {
      ...theme.typography.h2,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.md,
    },
    icon: {
      marginRight: theme.spacing.sm,
      marginTop: 2,
    },
    infoText: {
      ...theme.typography.body1,
      color: theme.colors.text,
      flex: 1,
    },
    label: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    description: {
      ...theme.typography.body1,
      color: theme.colors.text,
      lineHeight: 24,
    },
    buttonContainer: {
      gap: theme.spacing.md,
      marginTop: theme.spacing.xl,
    },
    dateContainer: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.md,
    },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Event Details" showBack onBack={() => navigation.goBack()} />
        <LoadingOverlay visible={true} />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.container}>
        <Header title="Event Details" showBack onBack={() => navigation.goBack()} />
        <View style={styles.content}>
          <Text style={styles.infoText}>Event not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Event Details" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.title}>{event.title}</Text>

          <View style={styles.dateContainer}>
            <View style={styles.infoRow}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={theme.colors.primary}
                style={styles.icon}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Start</Text>
                <Text style={styles.infoText}>{formatDateTime(event.startDate)}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons
                name="time-outline"
                size={20}
                color={theme.colors.primary}
                style={styles.icon}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>End</Text>
                <Text style={styles.infoText}>{formatDateTime(event.endDate)}</Text>
              </View>
            </View>
          </View>

          {event.description && (
            <>
              <Text style={styles.label}>Description</Text>
              <Text style={styles.description}>{event.description}</Text>
            </>
          )}

          {event.location && (
            <View style={styles.infoRow}>
              <Ionicons
                name="location-outline"
                size={20}
                color={theme.colors.primary}
                style={styles.icon}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Location</Text>
                <Text style={styles.infoText}>{event.location}</Text>
              </View>
            </View>
          )}

          <View style={styles.infoRow}>
            <Ionicons
              name={event.groupId ? 'people-outline' : 'person-outline'}
              size={20}
              color={theme.colors.primary}
              style={styles.icon}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Type</Text>
              <Text style={styles.infoText}>
                {event.groupId ? 'Group Event' : 'Personal Event'}
              </Text>
            </View>
          </View>
        </View>

        {canEdit && (
          <View style={styles.buttonContainer}>
            <Button
              title="Delete Event"
              onPress={handleDelete}
              variant="outline"
              fullWidth
              loading={deleting}
              disabled={deleting}
              icon="trash-outline"
            />
          </View>
        )}
      </ScrollView>

      <LoadingOverlay visible={deleting} />
    </View>
  );
};
