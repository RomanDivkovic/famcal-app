import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface ErrorModalProps {
  visible: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  visible,
  title = 'Error',
  message,
  onClose,
}) => {
  const { theme } = useTheme();

  // Don't render if not visible
  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
            <Text style={[styles.message, { color: theme.colors.textSecondary }]}>{message}</Text>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 9999,
  },
  container: {
    borderRadius: 20,
    padding: 28,
    width: '90%',
    maxWidth: 380,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 14,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 28,
    textAlign: 'center',
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
