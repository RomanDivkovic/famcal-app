/**
 * DateTime Picker Modal Component
 * Bottom sheet style date and time picker
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './index';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DateTimePickerModalProps {
  visible: boolean;
  onClose: () => void;
  value: Date;
  onChange: (date: Date) => void;
  mode?: 'date' | 'time' | 'datetime';
  minimumDate?: Date;
  title?: string;
}

export const DateTimePickerModal: React.FC<DateTimePickerModalProps> = ({
  visible,
  onClose,
  value,
  onChange,
  mode = 'datetime',
  minimumDate,
  title = 'Select Date & Time',
}) => {
  const { theme } = useTheme();
  const [tempDate, setTempDate] = useState(value);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>(
    mode === 'datetime' ? 'date' : mode
  );

  const handleConfirm = () => {
    onChange(tempDate);
    onClose();
  };

  const handleCancel = () => {
    setTempDate(value); // Reset to original value
    onClose();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    container: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      paddingBottom: Platform.OS === 'ios' ? 34 : theme.spacing.xl,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    title: {
      ...theme.typography.h6,
      color: theme.colors.text,
      fontWeight: '600',
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    content: {
      padding: theme.spacing.lg,
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
      paddingVertical: theme.spacing.sm,
      alignItems: 'center',
      borderRadius: theme.borderRadius.sm,
    },
    activeTab: {
      backgroundColor: theme.colors.primary,
    },
    tabText: {
      ...theme.typography.button,
      color: theme.colors.textSecondary,
    },
    activeTabText: {
      color: '#FFFFFF',
    },
    selectedDisplay: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.lg,
      marginBottom: theme.spacing.lg,
      alignItems: 'center',
    },
    selectedLabel: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    selectedValue: {
      ...theme.typography.h5,
      color: theme.colors.text,
      fontWeight: '600',
    },
    pickerContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
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

  // iOS bottom sheet style
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleCancel}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleCancel}>
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={handleCancel}>
                <Ionicons name="close" size={28} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              {mode === 'datetime' && (
                <View style={styles.tabContainer}>
                  <TouchableOpacity
                    style={[styles.tab, pickerMode === 'date' && styles.activeTab]}
                    onPress={() => setPickerMode('date')}
                  >
                    <Text style={[styles.tabText, pickerMode === 'date' && styles.activeTabText]}>
                      Datum
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tab, pickerMode === 'time' && styles.activeTab]}
                    onPress={() => setPickerMode('time')}
                  >
                    <Text style={[styles.tabText, pickerMode === 'time' && styles.activeTabText]}>
                      Tid
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.selectedDisplay}>
                <Text style={styles.selectedLabel}>
                  {mode === 'datetime'
                    ? pickerMode === 'date'
                      ? 'Valt Datum'
                      : 'Vald Tid'
                    : mode === 'date'
                      ? 'Valt Datum'
                      : 'Vald Tid'}
                </Text>
                <Text style={styles.selectedValue}>
                  {pickerMode === 'date' ? formatDate(tempDate) : formatTime(tempDate)}
                </Text>
              </View>

              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={tempDate}
                  mode={pickerMode}
                  display="spinner"
                  themeVariant={theme.isDark ? 'dark' : 'light'}
                  onChange={(event, selectedDate) => {
                    if (selectedDate) {
                      setTempDate(selectedDate);
                    }
                  }}
                  minimumDate={minimumDate}
                  textColor={theme.colors.text}
                />
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <Button title="Avbryt" onPress={handleCancel} variant="outline" style={{ flex: 1 }} />
              <Button title="Bekräfta" onPress={handleConfirm} style={{ flex: 1 }} />
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
