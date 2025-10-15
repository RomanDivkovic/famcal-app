/**
 * Custom Input Component
 */

import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  secureTextEntry?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  secureTextEntry = false,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  const styles = StyleSheet.create({
    container: {
      marginBottom: theme.spacing.md,
    },
    label: {
      ...theme.typography.subtitle2,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: error ? theme.colors.error : theme.colors.border,
      paddingHorizontal: theme.spacing.md,
      minHeight: 48, // Ensure consistent height
    },
    input: {
      flex: 1,
      ...theme.typography.body1,
      color: theme.colors.text,
      paddingVertical: theme.spacing.md, // Increased padding for better centering
      minHeight: 48, // Match container height
      textAlignVertical: 'center', // Center text vertically (Android)
    },
    icon: {
      marginRight: theme.spacing.sm,
    },
    toggleSecure: {
      padding: theme.spacing.xs,
    },
    error: {
      ...theme.typography.caption,
      color: theme.colors.error,
      marginTop: theme.spacing.xs,
    },
  });

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        {icon && (
          <Ionicons name={icon} size={20} color={theme.colors.textSecondary} style={styles.icon} />
        )}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={theme.colors.placeholder}
          secureTextEntry={isSecure}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setIsSecure(!isSecure)} style={styles.toggleSecure}>
            <Ionicons
              name={isSecure ? 'eye-off' : 'eye'}
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};
