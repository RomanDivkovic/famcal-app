/**
 * Upcoming Events Bottom Sheet Component
 * Shows list of upcoming events with swipe-to-delete functionality
 */

import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useTheme } from '../../contexts/ThemeContext';
import { styles as getStyles } from './styles';
import type { Event } from '../../types';
import type { Theme } from '../../theme';

interface UpcomingEventsBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  events: Event[];
  onEventPress: (event: Event) => void;
  onEventDelete: (eventId: string) => void;
}

interface SwipeableEventItemProps {
  event: Event;
  onPress: () => void;
  onDelete: () => void;
  theme: Theme;
  styles: ReturnType<typeof getStyles>;
}

const SWIPE_THRESHOLD = -80;

const SwipeableEventItem: React.FC<SwipeableEventItemProps> = ({
  event,
  onPress,
  onDelete,
  theme,
  styles,
}) => {
  const translateX = useSharedValue(0);
  const itemHeight = useSharedValue(1);

  const handleDelete = () => {
    'worklet';
    runOnJS(onDelete)();
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      // Only allow swiping left
      if (e.translationX < 0) {
        translateX.value = e.translationX;
      }
    })
    .onEnd((e) => {
      if (e.translationX < SWIPE_THRESHOLD) {
        // Swipe far enough - delete
        translateX.value = withSpring(-300, {}, () => {
          itemHeight.value = withSpring(0);
          handleDelete();
        });
      } else {
        // Snap back
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: 1 + translateX.value / 300,
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    height: itemHeight.value === 1 ? undefined : itemHeight.value,
    opacity: itemHeight.value,
    overflow: 'hidden',
  }));

  const deleteButtonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: translateX.value < -20 ? 1 : 0,
  }));

  return (
    <Animated.View style={[styles.swipeableContainer, containerAnimatedStyle]}>
      <Animated.View style={[styles.deleteBackground, deleteButtonAnimatedStyle]}>
        <Ionicons name="trash" size={24} color="#ffffff" />
        <Text style={styles.deleteText}>Delete</Text>
      </Animated.View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={animatedStyle}>
          <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <View style={styles.eventItemContainer}>
              <View style={styles.eventDateBadge}>
                <Text style={styles.eventMonth}>{format(new Date(event.startDate), 'MMM')}</Text>
                <Text style={styles.eventDay}>{format(new Date(event.startDate), 'd')}</Text>
              </View>
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle} numberOfLines={2}>
                  {event.title}
                </Text>
                <Text style={styles.eventTime}>
                  {format(new Date(event.startDate), 'h:mm a')} -{' '}
                  {format(new Date(event.endDate), 'h:mm a')}
                </Text>
                {event.location && (
                  <View style={styles.locationRow}>
                    <Ionicons
                      name="location-outline"
                      size={14}
                      color={theme.colors.textSecondary}
                    />
                    <Text style={styles.eventLocation} numberOfLines={1}>
                      {event.location}
                    </Text>
                  </View>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
};

export const UpcomingEventsBottomSheet: React.FC<UpcomingEventsBottomSheetProps> = ({
  isVisible,
  onClose,
  events,
  onEventPress,
  onEventDelete,
}) => {
  const { theme } = useTheme();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const styles = getStyles(theme);

  const snapPoints = useMemo(() => ['70%', '95%'], []);

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

  const handleEventDelete = useCallback(
    (eventId: string, eventTitle: string) => {
      Alert.alert('Delete Event', `Are you sure you want to delete "${eventTitle}"?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onEventDelete(eventId),
        },
      ]);
    },
    [onEventDelete]
  );

  const renderItem = useCallback(
    ({ item }: { item: Event }) => (
      <SwipeableEventItem
        event={item}
        onPress={() => onEventPress(item)}
        onDelete={() => handleEventDelete(item.id, item.title)}
        theme={theme}
        styles={styles}
      />
    ),
    [onEventPress, handleEventDelete, theme, styles]
  );

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyState}>
        <Ionicons name="calendar-outline" size={64} color={theme.colors.textSecondary} />
        <Text style={styles.emptyStateTitle}>No Upcoming Events</Text>
        <Text style={styles.emptyStateText}>Your upcoming events will appear here</Text>
      </View>
    ),
    [theme, styles]
  );

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
          <View>
            <Text style={styles.title}>Upcoming Events</Text>
            <Text style={styles.subtitle}>
              {events.length} event{events.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={28} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.swipeHint}>
          <Ionicons name="arrow-back" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.swipeHintText}>Swipe left to delete</Text>
        </View>

        <BottomSheetFlatList
          data={events}
          renderItem={renderItem}
          keyExtractor={(item: Event) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={true}
        />
      </BottomSheetView>
    </BottomSheet>
  );
};
