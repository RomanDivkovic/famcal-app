/**
 * Styles for TodoDetailBottomSheet component
 */

import { StyleSheet } from 'react-native';
import type { Theme } from '../../theme';

export const styles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingHorizontal: theme.spacing.xl,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      flex: 1,
      marginRight: theme.spacing.md,
    },
    checkbox: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
      marginTop: 2,
    },
    checkboxCompleted: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    title: {
      ...theme.typography.h6,
      color: theme.colors.text,
      fontWeight: '600',
      flex: 1,
    },
    titleCompleted: {
      textDecorationLine: 'line-through',
      color: theme.colors.textSecondary,
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.xl,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.round,
      gap: theme.spacing.xs,
    },
    statusBadgeCompleted: {
      backgroundColor: '#22c55e',
    },
    statusBadgeOverdue: {
      backgroundColor: theme.colors.error,
    },
    statusText: {
      ...theme.typography.caption,
      color: '#ffffff',
      fontWeight: '600',
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    infoContent: {
      flex: 1,
      marginLeft: theme.spacing.md,
    },
    infoLabel: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: theme.spacing.xs,
    },
    infoValue: {
      ...theme.typography.body1,
      color: theme.colors.text,
      fontWeight: '500',
    },
    overdueText: {
      color: theme.colors.error,
    },
    overdueWarning: {
      ...theme.typography.caption,
      color: theme.colors.error,
      marginTop: theme.spacing.xs,
      fontWeight: '500',
    },
    descriptionText: {
      ...theme.typography.body2,
      color: theme.colors.text,
      lineHeight: 22,
    },
    actionsSection: {
      marginTop: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    deleteButton: {
      borderColor: theme.colors.error,
    },
  });
