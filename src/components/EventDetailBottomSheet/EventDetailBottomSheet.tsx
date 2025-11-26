/**
 * Event Detail Bottom Sheet Component
 * Shows detailed information about an event
 */

import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../Button/Button';
import { styles as getStyles } from './styles';
import type { Event } from '../../types';

interface EventDetailBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  event: Event | null;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const EventDetailBottomSheet: React.FC<EventDetailBottomSheetProps> = ({
  isVisible,
  onClose,
  event,
  onEdit,
  onDelete,
}) => {
  const { theme } = useTheme();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const styles = getStyles(theme);

  const snapPoints = useMemo(() => ['65%', '90%'], []);

  useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isVisible]);

  const handleClose = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  const handleEdit = () => {
    handleClose();
    setTimeout(() => {
      onEdit?.();
    }, 300);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event? This will remove it from all calendars.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            handleClose();
            setTimeout(() => {
              onDelete?.();
            }, 300);
          },
        },
      ]
    );
  };

  if (!event) return null;

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: theme.colors.background }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.textSecondary }}
    >
      <BottomSheetView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {event.title}
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={28} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <BottomSheetScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          {/* Date & Time */}
          <View style={styles.section}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={24} color={theme.colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoValue}>{format(startDate, 'EEEE, MMMM d, yyyy')}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={24} color={theme.colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Time</Text>
                <Text style={styles.infoValue}>
                  {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
                </Text>
                <Text style={styles.durationText}>
                  {duration} hour{duration !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
          </View>

          {/* Location */}
          {event.location && (
            <View style={styles.section}>
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={24} color={theme.colors.primary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Location</Text>
                  <Text style={styles.infoValue}>{event.location}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Description */}
          {event.description && (
            <View style={styles.section}>
              <View style={styles.infoRow}>
                <Ionicons name="document-text-outline" size={24} color={theme.colors.primary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Description</Text>
                  <Text style={styles.descriptionText}>{event.description}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Group */}
          {event.groupId && (
            <View style={styles.section}>
              <View style={styles.infoRow}>
                <Ionicons name="people-outline" size={24} color={theme.colors.primary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Group</Text>
                  <Text style={styles.infoValue}>Group Event</Text>
                </View>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionsSection}>
            {onEdit && (
              <Button
                title="Edit Event"
                onPress={handleEdit}
                variant="outline"
                fullWidth
                icon={<Ionicons name="create-outline" size={20} color={theme.colors.primary} />}
              />
            )}
            {onDelete && (
              <Button
                title="Delete Event"
                onPress={handleDelete}
                variant="outline"
                fullWidth
                icon={<Ionicons name="trash-outline" size={20} color={theme.colors.error} />}
                style={styles.deleteButton}
              />
            )}
          </View>
        </BottomSheetScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
};
