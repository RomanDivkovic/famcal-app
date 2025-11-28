/**
 * Upcoming Events Bottom Sheet Component
 * Shows list of upcoming events with smooth swipe-to-delete functionality
 */

import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, Alert, Dimensions } from 'react-native';
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
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useTheme } from '../../contexts/ThemeContext';
import { styles as getStyles } from './styles';
import type { Event } from '../../types';
import type { Theme } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

const SWIPE_THRESHOLD = -100;
const DELETE_THRESHOLD = -150;

const SwipeableEventItem: React.FC<SwipeableEventItemProps> = ({
  event,
  onPress,
  onDelete,
  theme,
  styles,
}) => {
  const translateX = useSharedValue(0);
  const itemHeight = useSharedValue(80);
  const itemOpacity = useSharedValue(1);
  const isDeleting = useSharedValue(false);

  const confirmDelete = () => {
    Alert.alert('Delete Event', `Are you sure you want to delete "${event.title}"?`, [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => {
          translateX.value = withSpring(0);
        },
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          isDeleting.value = true;
          translateX.value = withTiming(-SCREEN_WIDTH, { duration: 200 });
          itemHeight.value = withTiming(0, { duration: 300 });
          itemOpacity.value = withTiming(0, { duration: 200 }, () => {
            runOnJS(onDelete)();
          });
        },
      },
    ]);
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .failOffsetY([-10, 10])
    .onUpdate((e) => {
      if (isDeleting.value) return;
      // Only allow swiping left
      if (e.translationX < 0) {
        translateX.value = e.translationX;
      }
    })
    .onEnd((e) => {
      if (isDeleting.value) return;

      if (e.translationX < DELETE_THRESHOLD) {
        // Quick swipe - confirm delete
        runOnJS(confirmDelete)();
      } else if (e.translationX < SWIPE_THRESHOLD) {
        // Show delete button
        translateX.value = withSpring(-100, { damping: 20, stiffness: 200 });
      } else {
        // Snap back
        translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
      }
    });

  const tapGesture = Gesture.Tap()
    .onStart(() => {
      // Check if swiped - if so, snap back instead of opening
      if (translateX.value < -50) {
        translateX.value = withSpring(0);
      }
    })
    .onEnd(() => {
      // Only trigger press if not swiped
      if (translateX.value >= -50) {
        runOnJS(onPress)();
      }
    });

  // Use Simultaneous for better tap detection, with Pan taking priority
  const combinedGesture = Gesture.Exclusive(panGesture, tapGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    height: itemHeight.value,
    opacity: itemOpacity.value,
    marginBottom: interpolate(itemOpacity.value, [0, 1], [0, 12]),
    overflow: 'hidden' as const,
  }));

  const deleteButtonAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translateX.value, [-150, -50, 0], [1, 0.8, 0], Extrapolation.CLAMP);
    const scale = interpolate(translateX.value, [-150, -80, 0], [1.1, 1, 0.8], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const deleteIconAnimatedStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      translateX.value,
      [-150, -50, 0],
      [-10, 0, 10],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  return (
    <Animated.View style={[styles.swipeableContainer, containerAnimatedStyle]}>
      {/* Delete background with animated icon */}
      <Animated.View style={[styles.deleteBackground, deleteButtonAnimatedStyle]}>
        <TouchableOpacity onPress={confirmDelete} style={styles.deleteButtonTouchable}>
          <Animated.View style={deleteIconAnimatedStyle}>
            <Ionicons name="trash" size={26} color="#ffffff" />
          </Animated.View>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>

      <GestureDetector gesture={combinedGesture}>
        <Animated.View style={animatedStyle}>
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
                  <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
                  <Text style={styles.eventLocation} numberOfLines={1}>
                    {event.location}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.chevronContainer}>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </View>
          </View>
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

  const renderItem = useCallback(
    ({ item }: { item: Event }) => (
      <SwipeableEventItem
        event={item}
        onPress={() => {
          handleClose();
          setTimeout(() => onEventPress(item), 300);
        }}
        onDelete={() => onEventDelete(item.id)}
        theme={theme}
        styles={styles}
      />
    ),
    [onEventPress, onEventDelete, theme, styles, handleClose]
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
          <Text style={styles.swipeHintText}>Swipe left to delete • Tap to view details</Text>
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
