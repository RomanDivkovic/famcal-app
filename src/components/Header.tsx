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
      flex: showBack ? 0 : 1,
    },
    backButton: {
      padding: theme.spacing.xs,
      marginRight: theme.spacing.sm,
    },
    title: {
      ...theme.typography.h5,
      color: theme.colors.headerText,
      flex: showBack ? 0 : 1,
      textAlign: showBack ? 'center' : 'left',
      position: showBack ? 'absolute' : 'relative',
      left: showBack ? 0 : undefined,
      right: showBack ? 0 : undefined,
    },
    rightButton: {
      padding: theme.spacing.xs,
    },
    rightPlaceholder: {
      width: 40,
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
        {!showBack && (
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        )}
      </View>
      {showBack && (
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      )}
      {rightIcon && onRightPress ? (
        <TouchableOpacity style={styles.rightButton} onPress={onRightPress}>
          <Ionicons name={rightIcon} size={24} color={theme.colors.headerText} />
        </TouchableOpacity>
      ) : showBack ? (
        <View style={styles.rightPlaceholder} />
      ) : null}
    </View>
  );
};
