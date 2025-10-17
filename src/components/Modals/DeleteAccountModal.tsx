/**
 * Delete Account Modal
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Input, Button } from '../';
import { Ionicons } from '@expo/vector-icons';

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ visible, onClose }) => {
  const { theme } = useTheme();
  const { deleteAccount } = useAuth();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = async () => {
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password to confirm deletion');
      return;
    }

    Alert.alert(
      'Delete Account',
      'Are you absolutely sure? This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteAccount(password);
              Alert.alert('Success', 'Your account has been deleted');
              onClose();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete account');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleClose = () => {
    setPassword('');
    onClose();
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: '90%',
      maxWidth: 400,
      backgroundColor: theme.colors.cardBackground,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.xl,
      ...theme.shadows.large,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    warningIcon: {
      marginRight: theme.spacing.md,
    },
    title: {
      ...theme.typography.h5,
      color: theme.colors.error,
      flex: 1,
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    warning: {
      backgroundColor: theme.colors.error + '15',
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.lg,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.error,
    },
    warningText: {
      ...theme.typography.body2,
      color: theme.colors.error,
      lineHeight: 20,
    },
    description: {
      ...theme.typography.body1,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.lg,
      lineHeight: 22,
    },
    inputContainer: {
      marginBottom: theme.spacing.lg,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    button: {
      flex: 1,
    },
    deleteButton: {
      flex: 1,
      backgroundColor: theme.colors.error,
    },
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <Card style={styles.modalContent}>
          <View style={styles.header}>
            <Ionicons
              name="warning"
              size={28}
              color={theme.colors.error}
              style={styles.warningIcon}
            />
            <Text style={styles.title}>Delete Account</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.warning}>
            <Text style={styles.warningText}>
              ⚠️ This action is permanent and cannot be undone. All your data, including events,
              todos, and group memberships, will be permanently deleted.
            </Text>
          </View>

          <Text style={styles.description}>
            To confirm deletion, please enter your password below:
          </Text>

          <View style={styles.inputContainer}>
            <Input
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Cancel"
              onPress={handleClose}
              variant="outline"
              disabled={loading}
              style={styles.button}
            />
            <Button
              title={loading ? 'Deleting...' : 'Delete Account'}
              onPress={handleDeleteAccount}
              disabled={loading}
              style={styles.deleteButton}
            />
          </View>

          {loading && (
            <View style={{ marginTop: theme.spacing.md, alignItems: 'center' }}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          )}
        </Card>
      </View>
    </Modal>
  );
};
