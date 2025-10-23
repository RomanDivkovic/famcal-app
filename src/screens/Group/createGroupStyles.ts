/**
 * CreateGroupScreen Styles
 */

import { StyleSheet } from 'react-native';
import { Theme } from '../../theme';

export const createCreateGroupStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: theme.spacing.lg,
    },
    title: {
      fontSize: 24,
      fontWeight: '700' as const,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xl,
      lineHeight: 22,
    },
    inputContainer: {
      marginBottom: theme.spacing.lg,
    },
    label: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    buttonContainer: {
      marginTop: theme.spacing.xl,
    },
    cancelButton: {
      marginTop: theme.spacing.md,
    },
  });
