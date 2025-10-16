/**
 * Join Group Modal Component
 * Modal for joining a group using an invite code
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Input, Button } from './index';
import { Ionicons } from '@expo/vector-icons';

interface JoinGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const JoinGroupModal: React.FC<JoinGroupModalProps> = ({ visible, onClose, onSuccess }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoinGroup = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Error', 'Please enter an invite code');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'You must be logged in to join a group');
      return;
    }

    try {
      setLoading(true);

      // For now, we'll simulate joining by checking if the code format is valid
      // In a real implementation, you would call a backend API to validate the code
      // and add the user to the group

      const codeUpper = inviteCode.toUpperCase().replace(/\s/g, '');
      if (codeUpper.length !== 6) {
        Alert.alert('Invalid Code', 'Invite code must be 6 characters');
        return;
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real app, you would:
      // 1. Validate the code against Firebase
      // 2. Check if it's expired
      // 3. Add the user to the group
      // 4. Return the group information

      Alert.alert(
        'Coming Soon',
        'Group invitation system is being finalized. The invite code format is valid!',
        [
          {
            text: 'OK',
            onPress: () => {
              setInviteCode('');
              if (onSuccess) {
                onSuccess();
              }
              onClose();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error joining group:', error);
      Alert.alert('Error', 'Failed to join group. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCode = (text: string) => {
    // Format code to uppercase and remove spaces
    const formatted = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
    // Limit to 6 characters
    return formatted.substring(0, 6);
  };

  const handleCodeChange = (text: string) => {
    setInviteCode(formatCode(text));
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
      padding: theme.spacing.xl,
      maxHeight: '80%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    title: {
      ...theme.typography.h5,
      color: theme.colors.text,
      fontWeight: '600',
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    content: {
      marginBottom: theme.spacing.xl,
    },
    description: {
      ...theme.typography.body2,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xl,
      lineHeight: 22,
    },
    inputContainer: {
      marginBottom: theme.spacing.lg,
    },
    codeDisplay: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      marginTop: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    codeText: {
      ...theme.typography.h4,
      color: theme.colors.primary,
      fontWeight: '600',
      letterSpacing: 8,
      fontFamily: 'monospace',
    },
    buttonContainer: {
      gap: theme.spacing.md,
    },
    loadingContainer: {
      alignItems: 'center',
      padding: theme.spacing.lg,
    },
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>Join Group</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={28} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <Text style={styles.description}>
                Enter the 6-character invite code shared by a group member to join their group.
              </Text>

              <View style={styles.inputContainer}>
                <Input
                  label="Invite Code"
                  placeholder="Enter code (e.g., ABC123)"
                  value={inviteCode}
                  onChangeText={handleCodeChange}
                  icon="key"
                  autoCapitalize="characters"
                  maxLength={6}
                />

                {inviteCode.length > 0 && (
                  <View style={styles.codeDisplay}>
                    <Text style={styles.codeText}>{inviteCode}</Text>
                  </View>
                )}
              </View>

              {loading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
              )}
            </View>

            <View style={styles.buttonContainer}>
              <Button
                title="Join Group"
                onPress={handleJoinGroup}
                loading={loading}
                disabled={loading || inviteCode.length !== 6}
                fullWidth
                icon={
                  !loading ? <Ionicons name="person-add" size={20} color="#ffffff" /> : undefined
                }
              />
              <Button
                title="Cancel"
                onPress={onClose}
                variant="outline"
                fullWidth
                disabled={loading}
              />
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
