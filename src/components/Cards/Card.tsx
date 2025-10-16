/**
 * Custom Card Component
 */

import React from 'react';
import { View, ViewStyle, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  elevation?: 'small' | 'medium' | 'large';
}

export const Card: React.FC<CardProps> = ({ children, style, onPress, elevation = 'medium' }) => {
  const { theme } = useTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows[elevation],
  };

  if (onPress) {
    return (
      <TouchableOpacity style={[cardStyle, style]} onPress={onPress} activeOpacity={0.7}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
};
