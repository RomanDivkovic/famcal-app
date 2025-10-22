/**
 * Custom hook for join group logic
 */

import { useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../hooks';
import { dataService } from '../../services';

interface UseJoinGroupProps {
  onSuccess?: () => void;
}

export const useJoinGroup = ({ onSuccess }: UseJoinGroupProps) => {
  const { user } = useAuth();
  const { sendGroupInviteNotification, notifyMemberJoined } = useNotifications();
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  const formatCode = (text: string) => {
    const formatted = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
    return formatted.substring(0, 8);
  };

  const handleCodeChange = (text: string) => {
    setInviteCode(formatCode(text));
  };

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

      const codeUpper = inviteCode.toUpperCase().replace(/\s/g, '');
      if (codeUpper.length !== 8) {
        Alert.alert('Invalid Code', 'Invite code must be 8 characters');
        return;
      }

      const group = await dataService.findGroupByInviteCode(codeUpper);

      if (!group) {
        Alert.alert(
          'Invalid Code',
          'No group found with this invite code. Please check the code and try again.'
        );
        return;
      }

      if (group.members && group.members[user.id]) {
        Alert.alert('Already a Member', `You are already a member of ${group.name}`);
        setInviteCode('');
        if (onSuccess) {
          onSuccess();
        }
        return;
      }

      await dataService.joinGroup(group.id, user.id, codeUpper);

      try {
        await sendGroupInviteNotification(group.name, 'You');
        console.info('Group join notification sent to new member');
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
      }

      try {
        await notifyMemberJoined(
          user.displayName || user.email?.split('@')[0] || 'Someone',
          group.name
        );
        console.info('Existing members notified of new join');
      } catch (notifError) {
        console.error('Failed to notify existing members:', notifError);
      }

      Alert.alert('Success!', `You have joined ${group.name}`, [
        {
          text: 'OK',
          onPress: () => {
            setInviteCode('');
            if (onSuccess) {
              onSuccess();
            }
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

  return {
    inviteCode,
    loading,
    handleCodeChange,
    handleJoinGroup,
  };
};
