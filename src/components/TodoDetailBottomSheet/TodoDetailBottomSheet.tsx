/**
 * Todo Detail Bottom Sheet Component
 * Shows detailed information about a todo item
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
import type { Todo } from '../../types';

interface TodoDetailBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  todo: Todo | null;
  onToggleComplete?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const TodoDetailBottomSheet: React.FC<TodoDetailBottomSheetProps> = ({
  isVisible,
  onClose,
  todo,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  const { theme } = useTheme();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const styles = getStyles(theme);

  const snapPoints = useMemo(() => ['50%', '75%'], []);

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
    Alert.alert('Delete Todo', 'Are you sure you want to delete this todo?', [
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
    ]);
  };

  const handleToggleComplete = () => {
    onToggleComplete?.();
  };

  if (!todo) return null;

  const dueDate = todo.dueDate ? new Date(todo.dueDate) : null;
  const isOverdue = dueDate && dueDate < new Date() && !todo.completed;

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
          <View style={styles.titleRow}>
            <TouchableOpacity
              onPress={handleToggleComplete}
              style={[styles.checkbox, todo.completed && styles.checkboxCompleted]}
            >
              {todo.completed && <Ionicons name="checkmark" size={20} color="#ffffff" />}
            </TouchableOpacity>
            <Text style={[styles.title, todo.completed && styles.titleCompleted]} numberOfLines={2}>
              {todo.text}
            </Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={28} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <BottomSheetScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          {/* Status Badge */}
          <View style={styles.section}>
            <View
              style={[
                styles.statusBadge,
                todo.completed && styles.statusBadgeCompleted,
                isOverdue && styles.statusBadgeOverdue,
              ]}
            >
              <Ionicons
                name={
                  todo.completed ? 'checkmark-circle' : isOverdue ? 'alert-circle' : 'time-outline'
                }
                size={16}
                color="#ffffff"
              />
              <Text style={styles.statusText}>
                {todo.completed ? 'Completed' : isOverdue ? 'Overdue' : 'Pending'}
              </Text>
            </View>
          </View>

          {/* Due Date */}
          {dueDate && (
            <View style={styles.section}>
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={24} color={theme.colors.primary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Due Date</Text>
                  <Text style={[styles.infoValue, isOverdue && styles.overdueText]}>
                    {format(dueDate, 'EEEE, MMMM d, yyyy')}
                  </Text>
                  {isOverdue && <Text style={styles.overdueWarning}>This todo is overdue!</Text>}
                </View>
              </View>
            </View>
          )}

          {/* Description */}
          {todo.description && (
            <View style={styles.section}>
              <View style={styles.infoRow}>
                <Ionicons name="document-text-outline" size={24} color={theme.colors.primary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Description</Text>
                  <Text style={styles.descriptionText}>{todo.description}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Group */}
          {todo.groupId && (
            <View style={styles.section}>
              <View style={styles.infoRow}>
                <Ionicons name="people-outline" size={24} color={theme.colors.primary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Group</Text>
                  <Text style={styles.infoValue}>Group Todo</Text>
                </View>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionsSection}>
            {onToggleComplete && (
              <Button
                title={todo.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
                onPress={handleToggleComplete}
                variant="primary"
                fullWidth
                icon={
                  <Ionicons
                    name={todo.completed ? 'close-circle-outline' : 'checkmark-circle-outline'}
                    size={20}
                    color="#ffffff"
                  />
                }
              />
            )}
            {onEdit && (
              <Button
                title="Edit Todo"
                onPress={handleEdit}
                variant="outline"
                fullWidth
                icon={<Ionicons name="create-outline" size={20} color={theme.colors.primary} />}
              />
            )}
            {onDelete && (
              <Button
                title="Delete Todo"
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
