/**
 * Styles for TodoItem component
 */

import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export const styles = (theme: Theme, todo: { completed: boolean }) =>
  StyleSheet.create({
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
