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
import { useNotifications } from '../hooks';
import { Input, Button } from './index';
import { Ionicons } from '@expo/vector-icons';
import { dataService } from '../services';

interface JoinGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const JoinGroupModal: React.FC<JoinGroupModalProps> = ({ visible, onClose, onSuccess }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { sendGroupInviteNotification, notifyMemberJoined } = useNotifications();
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

      // Format the code
      const codeUpper = inviteCode.toUpperCase().replace(/\s/g, '');
      if (codeUpper.length !== 8) {
        Alert.alert('Invalid Code', 'Invite code must be 8 characters');
        return;
      }

      // Find the group by invite code
      const group = await dataService.findGroupByInviteCode(codeUpper);

      if (!group) {
        Alert.alert(
          'Invalid Code',
          'No group found with this invite code. Please check the code and try again.'
        );
        return;
      }

      // Check if user is already a member (members is now an object)
      if (group.members && group.members[user.id]) {
        Alert.alert('Already a Member', `You are already a member of ${group.name}`);
        setInviteCode('');
        onClose();
        return;
      }

      // Join the group
      await dataService.joinGroup(group.id, user.id, codeUpper);

      // Send notification to user who joined
      try {
        await sendGroupInviteNotification(
          group.name,
          'You' // Since it's the user joining, we say "You"
        );
        console.info('Group join notification sent to new member');
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
        // Don't fail join if notification fails
      }

      // Notify existing group members that someone joined
      try {
        await notifyMemberJoined(
          user.displayName || user.email?.split('@')[0] || 'Someone',
          group.name
        );
        console.info('Existing members notified of new join');
      } catch (notifError) {
        console.error('Failed to notify existing members:', notifError);
        // Don't fail join if notification fails
      }

      Alert.alert('Success!', `You have joined ${group.name}`, [
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
      ]);
    } catch (error) {
      console.error('Error joining group:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to join group. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatCode = (text: string) => {
    // Format code to uppercase and remove spaces
    const formatted = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
    // Limit to 8 characters
    return formatted.substring(0, 8);
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
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      padding: theme.spacing.xl,
      paddingBottom: theme.spacing.xxl,
      minHeight: '50%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    title: {
      ...theme.typography.h5,
      color: '#000000',
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
      color: '#666666',
      marginBottom: theme.spacing.xl,
      lineHeight: 22,
    },
    inputContainer: {
      marginBottom: theme.spacing.lg,
    },
    codeInput: {
      fontSize: 18,
      fontWeight: '600',
      letterSpacing: 4,
      textTransform: 'uppercase',
    },
    codeDisplay: {
      backgroundColor: '#F5F5F5',
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      marginTop: theme.spacing.md,
      borderWidth: 1,
      borderColor: '#E0E0E0',
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
                <Ionicons name="close" size={28} color="#000000" />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <Text style={styles.description}>
                Enter the 8-character invite code shared by a group member to join their group.
              </Text>

              <View style={styles.inputContainer}>
                <Input
                  label="Invite Code"
                  placeholder="ABC12345"
                  value={inviteCode}
                  onChangeText={handleCodeChange}
                  icon="key"
                  autoCapitalize="characters"
                  maxLength={8}
                  style={styles.codeInput}
                />
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
                disabled={loading || inviteCode.length !== 8}
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
