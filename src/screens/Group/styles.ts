/**
 * GroupDetailScreen Styles
 */

import { StyleSheet } from 'react-native';
import { Theme } from '../../theme';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.md,
    },
    section: {
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      ...theme.typography.h6,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    groupHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    colorIndicator: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: theme.spacing.md,
    },
    groupInfo: {
      flex: 1,
    },
    groupName: {
      ...theme.typography.h5,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    groupDescription: {
      ...theme.typography.body2,
      color: theme.colors.textSecondary,
    },
    memberCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    memberAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    memberAvatarText: {
      ...theme.typography.button,
      color: '#ffffff',
      fontWeight: '600' as const,
    },
    memberInfo: {
      flex: 1,
    },
    memberName: {
      ...theme.typography.body1,
      color: theme.colors.text,
      fontWeight: '500' as const,
    },
    memberRole: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      textTransform: 'capitalize' as const,
    },
    button: {
      marginTop: theme.spacing.md,
    },
    emptyText: {
      ...theme.typography.body2,
      color: theme.colors.textSecondary,
      textAlign: 'center' as const,
      fontStyle: 'italic' as const,
    },
  });
