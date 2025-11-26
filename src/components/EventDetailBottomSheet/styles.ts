/**
 * Styles for EventDetailBottomSheet component
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
    title: {
      ...theme.typography.h5,
      color: theme.colors.text,
      fontWeight: '600',
      flex: 1,
      marginRight: theme.spacing.md,
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
    infoRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.lg,
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
    durationText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
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
