/**
 * TodoItem Component
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Card } from '../Cards/Card';
import { useTheme } from '../../contexts/ThemeContext';
import { Todo } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useTodoItem } from './useTodoItem';
import { styles as getStyles } from './styles';

interface TodoItemProps {
  todo: Todo;
  onPress?: () => void;
  onToggle?: () => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onPress, onToggle }) => {
  const { theme } = useTheme();
  const { getDueDateColor, getPriorityColor } = useTodoItem(todo);
  const styles = getStyles(theme, todo);

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
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor() }]}>
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
