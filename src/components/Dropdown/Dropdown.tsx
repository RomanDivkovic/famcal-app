/**
 * Dropdown Component
 * Simple dropdown component with modal
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

export interface DropdownOption {
  label: string;
  value: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

interface DropdownProps {
  label?: string;
  placeholder?: string;
  value?: string;
  options: DropdownOption[];
  onSelect: (value: string) => void;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  placeholder = 'Select an option',
  value,
  options,
  onSelect,
  icon,
  disabled = false,
  style,
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onSelect(optionValue);
    setIsOpen(false);
  };

  const renderOption = ({ item }: { item: DropdownOption }) => {
    const isSelected = item.value === value;

    return (
      <TouchableOpacity
        style={[
          styles.option,
          {
            borderBottomColor: theme.colors.border,
            backgroundColor: theme.colors.background,
          },
          isSelected && { backgroundColor: theme.colors.surface },
        ]}
        onPress={() => handleSelect(item.value)}
        activeOpacity={0.7}
      >
        {item.icon && (
          <Ionicons
            name={item.icon}
            size={20}
            color={isSelected ? theme.colors.primary : theme.colors.text}
            style={styles.optionIcon}
          />
        )}
        <Text
          style={[
            styles.optionText,
            { color: isSelected ? theme.colors.primary : theme.colors.text },
          ]}
        >
          {item.label}
        </Text>
        {isSelected && <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />}
      </TouchableOpacity>
    );
  };

  const internalStyles = StyleSheet.create({
    container: {
      marginBottom: theme.spacing.md,
    },
    label: {
      ...theme.typography.body2,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    trigger: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing.md,
      backgroundColor: disabled ? theme.colors.border : theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    triggerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    triggerIcon: {
      marginRight: theme.spacing.sm,
    },
    triggerText: {
      ...theme.typography.body1,
      color: theme.colors.text,
      flex: 1,
    },
    placeholderText: {
      ...theme.typography.body1,
      color: theme.colors.textSecondary,
      flex: 1,
    },
  });

  return (
    <>
      <View style={[internalStyles.container, style]}>
        {label && <Text style={internalStyles.label}>{label}</Text>}
        <TouchableOpacity
          style={internalStyles.trigger}
          onPress={() => setIsOpen(true)}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <View style={internalStyles.triggerContent}>
            {(icon || selectedOption?.icon) && (
              <Ionicons
                name={(selectedOption?.icon || icon)!}
                size={20}
                color={theme.colors.text}
                style={internalStyles.triggerIcon}
              />
            )}
            <Text
              style={selectedOption ? internalStyles.triggerText : internalStyles.placeholderText}
            >
              {selectedOption?.label || placeholder}
            </Text>
          </View>
          <Ionicons
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={theme.colors.text}
          />
        </TouchableOpacity>
      </View>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                {label || 'Select an option'}
              </Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              renderItem={renderOption}
              keyExtractor={(item) => item.value}
              style={styles.optionsList}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  optionsList: {
    maxHeight: 400,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
});
