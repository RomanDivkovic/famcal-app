/**
 * Header Component
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
  title: string;
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
      flex: 1,
    },
    backButton: {
      padding: theme.spacing.xs,
      marginRight: theme.spacing.sm,
    },
    title: {
      ...theme.typography.h5,
      color: theme.colors.headerText,
      flex: 1,
    },
    rightButton: {
      padding: theme.spacing.xs,
    },
  });
  
  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        {showBack && onBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.headerText} />
          </TouchableOpacity>
        )}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
      {rightIcon && onRightPress && (
        <TouchableOpacity style={styles.rightButton} onPress={onRightPress}>
          <Ionicons name={rightIcon} size={24} color={theme.colors.headerText} />
        </TouchableOpacity>
      )}
    </View>
  );
};
