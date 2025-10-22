/**
 * Custom hook for TodoItem logic
 */

import { useTheme } from '../../contexts/ThemeContext';
import { isPast, isToday } from 'date-fns';
import type { Todo } from '../../types';

export const useTodoItem = (todo: Todo) => {
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

  return {
    getDueDateColor,
    getPriorityColor,
  };
};
