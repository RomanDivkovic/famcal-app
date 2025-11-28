/**
 * Styles for UpcomingEventsBottomSheet component
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
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    title: {
      ...theme.typography.h5,
      color: theme.colors.text,
      fontWeight: '600',
    },
    subtitle: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    swipeHint: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.xs,
      backgroundColor: theme.colors.surface,
      marginHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.md,
      borderRadius: theme.borderRadius.sm,
    },
    swipeHintText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
    listContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xxl,
    },
    swipeableContainer: {
      position: 'relative',
      borderRadius: theme.borderRadius.md,
      overflow: 'hidden',
    },
    deleteBackground: {
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      width: 120,
      backgroundColor: theme.colors.error,
      borderRadius: theme.borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    deleteButtonTouchable: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
    },
    deleteText: {
      ...theme.typography.caption,
      color: '#ffffff',
      fontWeight: '700',
      marginTop: 4,
    },
    eventItemContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
      minHeight: 80,
    },
    eventDateBadge: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.sm,
      minWidth: 54,
      alignItems: 'center',
    },
    eventMonth: {
      ...theme.typography.caption,
      color: '#ffffff',
      fontWeight: '600',
      textTransform: 'uppercase',
      fontSize: 10,
    },
    eventDay: {
      ...theme.typography.h6,
      color: '#ffffff',
      fontWeight: '700',
      fontSize: 20,
    },
    eventInfo: {
      flex: 1,
    },
    eventTitle: {
      ...theme.typography.body1,
      color: theme.colors.text,
      fontWeight: '600',
      marginBottom: theme.spacing.xs,
    },
    eventTime: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    eventLocation: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      flex: 1,
    },
    chevronContainer: {
      paddingLeft: theme.spacing.sm,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.xxl * 2,
    },
    emptyStateTitle: {
      ...theme.typography.h6,
      color: theme.colors.text,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
    },
    emptyStateText: {
      ...theme.typography.body2,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  });
