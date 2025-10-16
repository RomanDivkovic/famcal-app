/**
 * GroupCard Component
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import { useTheme } from '../../contexts/ThemeContext';
import { Group } from '../../types';
import { Ionicons } from '@expo/vector-icons';

interface GroupCardProps {
  group: Group;
  onPress?: () => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({ group, onPress }) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      marginBottom: theme.spacing.md,
      overflow: 'hidden', // Ensures color indicator respects border radius
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.sm,
    },
    colorIndicator: {
      width: 4,
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      borderTopLeftRadius: theme.borderRadius.lg,
      borderBottomLeftRadius: theme.borderRadius.lg,
    },
    content: {
      marginLeft: theme.spacing.sm,
    },
    name: {
      ...theme.typography.h6,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    description: {
      ...theme.typography.body2,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    membersContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    membersIcon: {
      marginRight: theme.spacing.xs,
    },
    membersText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
  });

  return (
    <Card style={styles.container} onPress={onPress}>
      <View
        style={[styles.colorIndicator, { backgroundColor: group.color || theme.colors.primary }]}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{group.name}</Text>
        </View>
        {group.description && (
          <Text style={styles.description} numberOfLines={2}>
            {group.description}
          </Text>
        )}
        <View style={styles.footer}>
          <View style={styles.membersContainer}>
            <Ionicons
              name="people"
              size={16}
              color={theme.colors.textSecondary}
              style={styles.membersIcon}
            />
            <Text style={styles.membersText}>
              {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
};
