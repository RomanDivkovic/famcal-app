/**
 * EventCard Component
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import { useTheme } from '../../contexts/ThemeContext';
import { Event } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { format, isSameDay } from 'date-fns';

interface EventCardProps {
  event: Event;
  onPress?: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onPress }) => {
  const { theme } = useTheme();

  const formatEventDate = () => {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);

    if (event.allDay) {
      if (isSameDay(start, end)) {
        return format(start, 'MMM d, yyyy');
      }
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
    }

    if (isSameDay(start, end)) {
      return `${format(start, 'MMM d, yyyy • h:mm a')} - ${format(end, 'h:mm a')}`;
    }

    return `${format(start, 'MMM d, h:mm a')} - ${format(end, 'MMM d, h:mm a')}`;
  };

  const styles = StyleSheet.create({
    container: {
      marginBottom: theme.spacing.md,
    },
    colorBar: {
      width: 4,
      height: '100%',
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      borderTopLeftRadius: theme.borderRadius.lg,
      borderBottomLeftRadius: theme.borderRadius.lg,
    },
    content: {
      marginLeft: theme.spacing.sm,
    },
    title: {
      ...theme.typography.h6,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    dateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    dateIcon: {
      marginRight: theme.spacing.xs,
    },
    dateText: {
      ...theme.typography.body2,
      color: theme.colors.textSecondary,
    },
    description: {
      ...theme.typography.body2,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.xs,
    },
    locationIcon: {
      marginRight: theme.spacing.xs,
    },
    locationText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
  });

  return (
    <Card style={styles.container} onPress={onPress}>
      <View style={[styles.colorBar, { backgroundColor: event.color || theme.colors.primary }]} />
      <View style={styles.content}>
        <Text style={styles.title}>{event.title}</Text>
        <View style={styles.dateContainer}>
          <Ionicons
            name="time"
            size={16}
            color={theme.colors.textSecondary}
            style={styles.dateIcon}
          />
          <Text style={styles.dateText}>{formatEventDate()}</Text>
        </View>
        {event.location && (
          <View style={styles.locationContainer}>
            <Ionicons
              name="location"
              size={14}
              color={theme.colors.textSecondary}
              style={styles.locationIcon}
            />
            <Text style={styles.locationText}>{event.location}</Text>
          </View>
        )}
        {event.description && (
          <Text style={styles.description} numberOfLines={2}>
            {event.description}
          </Text>
        )}
      </View>
    </Card>
  );
};
