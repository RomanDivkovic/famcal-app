/**
 * Styles for InviteBottomSheet component
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
      marginBottom: theme.spacing.xl,
    },
    description: {
      ...theme.typography.body2,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.lg,
      lineHeight: 22,
    },
    codeContainer: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.xl,
      borderRadius: theme.borderRadius.lg,
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderStyle: 'dashed',
    },
    codeLabel: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    code: {
      ...theme.typography.h3,
      color: theme.colors.primary,
      fontWeight: '700',
      letterSpacing: 4,
      fontFamily: 'monospace',
    },
    copyButton: {
      marginTop: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    copyButtonText: {
      ...theme.typography.button,
      color: theme.colors.primary,
      marginLeft: theme.spacing.xs,
    },
    instructionsTitle: {
      ...theme.typography.h6,
      color: theme.colors.text,
      fontWeight: '600',
      marginBottom: theme.spacing.md,
    },
    instructionsList: {
      marginBottom: theme.spacing.lg,
    },
    instructionItem: {
      flexDirection: 'row',
      marginBottom: theme.spacing.sm,
    },
    instructionNumber: {
      ...theme.typography.body2,
      color: theme.colors.primary,
      fontWeight: '600',
      width: 24,
    },
    instructionText: {
      ...theme.typography.body2,
      color: theme.colors.text,
      flex: 1,
    },
    buttonContainer: {
      gap: theme.spacing.md,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: theme.spacing.xl,
    },
  });
