/**
 * DateTime Picker BottomSheet Component
 * Beautiful bottom sheet date and time picker using @gorhom/bottom-sheet
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './index';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CustomBottomSheet } from './BottomSheet';

interface DateTimePickerBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  value: Date;
  onChange: (date: Date) => void;
  mode?: 'date' | 'time' | 'datetime';
  minimumDate?: Date;
  title?: string;
}

export const DateTimePickerBottomSheet: React.FC<DateTimePickerBottomSheetProps> = ({
  visible,
  onClose,
  value,
  onChange,
  mode = 'datetime',
  minimumDate,
  title = 'Välj Datum & Tid',
}) => {
  const { theme } = useTheme();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [tempDate, setTempDate] = useState(value);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>(
    mode === 'datetime' ? 'date' : mode
  );

  // Open/close bottom sheet based on visible prop
  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.expand();
      setTempDate(value);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible, value]);

  const handleConfirm = useCallback(() => {
    onChange(tempDate);
    onClose();
  }, [tempDate, onChange, onClose]);

  const handleCancel = useCallback(() => {
    setTempDate(value); // Reset to original value
    onClose();
  }, [value, onClose]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  const styles = StyleSheet.create({
    content: {
      flex: 1,
      paddingBottom: 20,
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: 4,
      marginBottom: theme.spacing.lg,
    },
    tab: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
      borderRadius: theme.borderRadius.sm,
    },
    activeTab: {
      backgroundColor: theme.colors.primary,
    },
    tabText: {
      fontSize: 15,
      fontWeight: '500',
      color: theme.colors.textSecondary,
    },
    activeTabText: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    selectedDisplay: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.xl,
      borderRadius: theme.borderRadius.lg,
      marginBottom: theme.spacing.xl,
      alignItems: 'center',
    },
    selectedLabel: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    selectedValue: {
      fontSize: 28,
      color: theme.colors.text,
      fontWeight: '600',
    },
    pickerContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginTop: 'auto',
    },
    button: {
      flex: 1,
    },
  });

  // On Android, use native picker
  if (Platform.OS === 'android' && visible) {
    return (
      <DateTimePicker
        value={tempDate}
        mode={mode === 'datetime' ? 'date' : mode}
        display="default"
        onChange={(event, selectedDate) => {
          if (event.type === 'set' && selectedDate) {
            if (mode === 'datetime' && pickerMode === 'date') {
              // First selected date, now show time picker
              setTempDate(selectedDate);
              setPickerMode('time');
            } else {
              onChange(selectedDate);
              onClose();
            }
          } else {
            onClose();
          }
        }}
        minimumDate={minimumDate}
      />
    );
  }

  // iOS beautiful bottom sheet
  return (
    <CustomBottomSheet
      ref={bottomSheetRef}
      title={title}
      snapPoints={['65%']}
      onClose={handleCancel}
      enablePanDownToClose
    >
      <View style={styles.content}>
        {mode === 'datetime' && (
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, pickerMode === 'date' && styles.activeTab]}
              onPress={() => setPickerMode('date')}
            >
              <Text style={[styles.tabText, pickerMode === 'date' && styles.activeTabText]}>
                📅 Datum
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, pickerMode === 'time' && styles.activeTab]}
              onPress={() => setPickerMode('time')}
            >
              <Text style={[styles.tabText, pickerMode === 'time' && styles.activeTabText]}>
                🕐 Tid
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.selectedDisplay}>
          <Text style={styles.selectedLabel}>
            {pickerMode === 'date' ? 'VALT DATUM' : 'VALD TID'}
          </Text>
          <Text style={styles.selectedValue}>
            {pickerMode === 'date' ? formatDate(tempDate) : formatTime(tempDate)}
          </Text>
        </View>

        <View style={styles.pickerContainer}>
          {Platform.OS === 'ios' && (
            <DateTimePicker
              value={tempDate}
              mode={pickerMode}
              display="spinner"
              onChange={handleDateChange}
              minimumDate={minimumDate}
              locale="sv-SE"
              textColor={theme.colors.text}
            />
          )}
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Avbryt" onPress={handleCancel} variant="outline" style={styles.button} />
          <Button title="Bekräfta" onPress={handleConfirm} style={styles.button} />
        </View>
      </View>
    </CustomBottomSheet>
  );
};
