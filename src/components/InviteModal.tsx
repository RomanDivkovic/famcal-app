/**
 * Invite Modal Component
 * Modal for inviting members to a group via invite code
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Share, Alert } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './index';
import { Ionicons } from '@expo/vector-icons';

interface InviteModalProps {
  visible: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  onInviteCreated?: (inviteCode: string) => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  visible,
  onClose,
  groupId: _groupId,
  groupName,
  onInviteCreated,
}) => {
  const { theme } = useTheme();
  const [inviteCode, setInviteCode] = useState('');

  const generateInviteCode = useCallback(() => {
    // Generate a 6-character alphanumeric code
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars like 0, O, 1, I
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setInviteCode(code);
    if (onInviteCreated) {
      onInviteCreated(code);
    }
  }, [onInviteCreated]);

  useEffect(() => {
    if (visible) {
      generateInviteCode();
    }
  }, [visible, generateInviteCode]);

  const handleShare = async () => {
    try {
      const message = `Join "${groupName}" on Family Calendar!\n\nInvite Code: ${inviteCode}\n\n1. Open the Family Calendar app\n2. Go to Home screen\n3. Tap "Join Group" button\n4. Enter this code`;

      await Share.share({
        message,
        title: `Join ${groupName}`,
      });
    } catch (error) {
      console.error('Error sharing invite:', error);
      Alert.alert('Error', 'Failed to share invite code');
    }
  };

  const handleCopyCode = () => {
    // In a real app, you'd use Clipboard.setString()
    Alert.alert('Copied!', `Invite code ${inviteCode} copied to clipboard`);
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
      marginBottom: theme.spacing.lg,
      lineHeight: 22,
    },
    codeContainer: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.xl,
      borderRadius: theme.borderRadius.lg,
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderStyle: 'dashed',
    },
    codeLabel: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    code: {
      ...theme.typography.h3,
      color: theme.colors.primary,
      fontWeight: '700',
      letterSpacing: 4,
      fontFamily: 'monospace',
    },
    copyButton: {
      marginTop: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    copyButtonText: {
      ...theme.typography.button,
      color: theme.colors.primary,
      marginLeft: theme.spacing.xs,
    },
    instructionsTitle: {
      ...theme.typography.h6,
      color: theme.colors.text,
      fontWeight: '600',
      marginBottom: theme.spacing.md,
    },
    instructionsList: {
      marginBottom: theme.spacing.lg,
    },
    instructionItem: {
      flexDirection: 'row',
      marginBottom: theme.spacing.sm,
    },
    instructionNumber: {
      ...theme.typography.body2,
      color: theme.colors.primary,
      fontWeight: '600',
      width: 24,
    },
    instructionText: {
      ...theme.typography.body2,
      color: theme.colors.text,
      flex: 1,
    },
    buttonContainer: {
      gap: theme.spacing.md,
    },
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>Invite Members</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={28} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <Text style={styles.description}>
                Share this code with people you want to invite to {groupName}. The code is valid for
                7 days.
              </Text>

              <View style={styles.codeContainer}>
                <Text style={styles.codeLabel}>Invite Code</Text>
                <Text style={styles.code}>{inviteCode}</Text>
                <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
                  <Ionicons name="copy-outline" size={20} color={theme.colors.primary} />
                  <Text style={styles.copyButtonText}>Copy Code</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.instructionsTitle}>How to join:</Text>
              <View style={styles.instructionsList}>
                <View style={styles.instructionItem}>
                  <Text style={styles.instructionNumber}>1.</Text>
                  <Text style={styles.instructionText}>
                    Open the Family Calendar app or create an account
                  </Text>
                </View>
                <View style={styles.instructionItem}>
                  <Text style={styles.instructionNumber}>2.</Text>
                  <Text style={styles.instructionText}>Go to the Home (Groups) screen</Text>
                </View>
                <View style={styles.instructionItem}>
                  <Text style={styles.instructionNumber}>3.</Text>
                  <Text style={styles.instructionText}>Tap the &quot;Join Group&quot; button</Text>
                </View>
                <View style={styles.instructionItem}>
                  <Text style={styles.instructionNumber}>4.</Text>
                  <Text style={styles.instructionText}>Enter the invite code above</Text>
                </View>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <Button
                title="Share Invite Code"
                onPress={handleShare}
                icon={<Ionicons name="share-social" size={20} color="#ffffff" />}
                fullWidth
              />
              <Button
                title="Generate New Code"
                onPress={generateInviteCode}
                variant="outline"
                fullWidth
                icon={<Ionicons name="refresh" size={20} color={theme.colors.primary} />}
              />
              <Button title="Done" onPress={onClose} variant="text" fullWidth />
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
