/**
 * TodoItem Component
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from './Card';
import { useTheme } from '../contexts/ThemeContext';
import { Todo } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { format, isPast, isToday } from 'date-fns';

interface TodoItemProps {
  todo: Todo;
  onPress?: () => void;
  onToggle?: () => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onPress, onToggle }) => {
  const { theme } = useTheme();
  
  const getDueDateColor = () => {
    if (!todo.dueDate || todo.completed) return theme.colors.textSecondary;
    
    const dueDate = new Date(todo.dueDate);
    if (isPast(dueDate) && !isToday(dueDate)) return theme.colors.error;
    if (isToday(dueDate)) return theme.colors.warning;
    return theme.colors.textSecondary;
  };
  
  const getPriorityColor = () => {
    switch (todo.priority) {
      case 'high':
        return theme.colors.error;
      case 'medium':
        return theme.colors.warning;
      case 'low':
        return theme.colors.info;
      default:
        return theme.colors.textSecondary;
    }
  };
  
  const styles = StyleSheet.create({
    container: {
      marginBottom: theme.spacing.md,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    checkbox: {
      marginRight: theme.spacing.md,
      marginTop: 2,
    },
    textContainer: {
      flex: 1,
    },
    text: {
      ...theme.typography.body1,
      color: theme.colors.text,
      textDecorationLine: todo.completed ? 'line-through' : 'none',
      opacity: todo.completed ? 0.6 : 1,
      marginBottom: theme.spacing.xs,
    },
    description: {
      ...theme.typography.body2,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      marginTop: theme.spacing.xs,
    },
    dueDateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    dueDateIcon: {
      marginRight: theme.spacing.xs,
    },
    dueDateText: {
      ...theme.typography.caption,
    },
    priorityBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
      marginRight: theme.spacing.sm,
    },
    priorityText: {
      ...theme.typography.caption,
      color: '#ffffff',
      fontWeight: '600',
      textTransform: 'uppercase',
    },
  });
  
  return (
    <Card style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        <TouchableOpacity onPress={onToggle} style={styles.checkbox}>
          <Ionicons
            name={todo.completed ? 'checkmark-circle' : 'ellipse-outline'}
            size={24}
            color={todo.completed ? theme.colors.success : theme.colors.border}
          />
        </TouchableOpacity>
        <View style={styles.textContainer}>
          <Text style={styles.text}>{todo.text}</Text>
          {todo.description && (
            <Text style={styles.description} numberOfLines={2}>
              {todo.description}
            </Text>
          )}
          <View style={styles.footer}>
            {todo.priority && (
              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: getPriorityColor() },
                ]}
              >
                <Text style={styles.priorityText}>{todo.priority}</Text>
              </View>
            )}
            {todo.dueDate && (
              <View style={styles.dueDateContainer}>
                <Ionicons
                  name="calendar"
                  size={14}
                  color={getDueDateColor()}
                  style={styles.dueDateIcon}
                />
                <Text style={[styles.dueDateText, { color: getDueDateColor() }]}>
                  {format(new Date(todo.dueDate), 'MMM d, yyyy')}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Card>
  );
};
