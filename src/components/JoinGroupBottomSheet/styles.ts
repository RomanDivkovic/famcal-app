/**
 * Styles for JoinGroupBottomSheet component
 */

import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export const styles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.xl,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    title: {
      ...theme.typography.h5,
      color: theme.colors.text,
      fontWeight: '600',
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    content: {
      flex: 1,
      marginBottom: theme.spacing.xl,
    },
    description: {
      ...theme.typography.body2,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xl,
      lineHeight: 22,
    },
    inputContainer: {
      marginBottom: theme.spacing.lg,
    },
    label: {
      ...theme.typography.body2,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
      fontWeight: '600',
    },
    input: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      fontSize: 18,
      fontWeight: '600',
      letterSpacing: 4,
      textTransform: 'uppercase',
      color: theme.colors.text,
    },
    loadingContainer: {
      alignItems: 'center',
      padding: theme.spacing.lg,
    },
    buttonContainer: {
      gap: theme.spacing.md,
      paddingTop: theme.spacing.md,
    },
  });
