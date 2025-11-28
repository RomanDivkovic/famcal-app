/**
 * Header Component
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  onBack,
  rightIcon,
  onRightPress,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const styles = StyleSheet.create({
    header: {
      backgroundColor: theme.colors.headerBackground,
      paddingTop: insets.top,
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      ...theme.shadows.small,
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: 40,
    },
    backButton: {
      padding: theme.spacing.xs,
    },
    centerSection: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      ...theme.typography.h5,
      color: theme.colors.headerText,
    },
    titleLeft: {
      ...theme.typography.h5,
      color: theme.colors.headerText,
      flex: 1,
    },
    rightSection: {
      minWidth: 40,
      alignItems: 'flex-end',
    },
    rightButton: {
      padding: theme.spacing.xs,
    },
  });

  // Simple header without back button - title on left
  if (!showBack) {
    return (
      <View style={styles.header}>
        <Text style={styles.titleLeft} numberOfLines={1}>
          {title}
        </Text>
        {rightIcon && onRightPress && (
          <TouchableOpacity style={styles.rightButton} onPress={onRightPress}>
            <Ionicons name={rightIcon} size={24} color={theme.colors.headerText} />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Header with back button - title centered (optional)
  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        {onBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.headerText} />
          </TouchableOpacity>
        )}
      </View>
      {title && (
        <View style={styles.centerSection}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>
      )}
      <View style={styles.rightSection}>
        {rightIcon && onRightPress && (
          <TouchableOpacity style={styles.rightButton} onPress={onRightPress}>
            <Ionicons name={rightIcon} size={24} color={theme.colors.headerText} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
