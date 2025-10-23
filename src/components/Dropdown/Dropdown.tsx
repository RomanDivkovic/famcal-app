/**
 * Dropdown Component
 * Custom dropdown/picker component with bottom sheet
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, type ViewStyle } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetFlatList,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
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
  const bottomSheetRef = React.useRef<BottomSheet>(null);

  // Find the selected option
  const selectedOption = options.find((opt) => opt.value === value);

  // Calculate snap points based on number of options
  const snapPoints = useMemo(() => {
    const itemHeight = 60;
    const headerHeight = 60;
    const maxHeight = 500;
    const calculatedHeight = Math.min(headerHeight + options.length * itemHeight, maxHeight);
    return [calculatedHeight];
  }, [options.length]);

  const handleOpen = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
    bottomSheetRef.current?.expand();
  }, [disabled]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    bottomSheetRef.current?.close();
  }, []);

  const handleSelect = useCallback(
    (optionValue: string) => {
      onSelect(optionValue);
      handleClose();
    },
    [onSelect, handleClose]
  );

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    []
  );

  const renderOption = ({ item }: { item: DropdownOption }) => {
    const isSelected = item.value === value;

    return (
      <TouchableOpacity
        style={[
          styles.option,
          { borderBottomColor: theme.colors.border },
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
    sheetContainer: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: theme.borderRadius.lg,
      borderTopRightRadius: theme.borderRadius.lg,
    },
    sheetHeader: {
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    sheetTitle: {
      ...theme.typography.h3,
      color: theme.colors.text,
    },
  });

  return (
    <>
      <View style={[internalStyles.container, style]}>
        {label && <Text style={internalStyles.label}>{label}</Text>}
        <TouchableOpacity
          style={internalStyles.trigger}
          onPress={handleOpen}
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

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={handleClose}
        backdropComponent={renderBackdrop}
        backgroundStyle={internalStyles.sheetContainer}
      >
        <BottomSheetView style={internalStyles.sheetHeader}>
          <Text style={internalStyles.sheetTitle}>{label || 'Select an option'}</Text>
        </BottomSheetView>
        <BottomSheetFlatList
          data={options}
          renderItem={renderOption}
          keyExtractor={(item: DropdownOption) => item.value}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </BottomSheet>
    </>
  );
};

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
});
