/**
 * Custom hook for invite code generation and sharing
 */

import { useState, useCallback, useEffect } from 'react';
import { Alert, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { dataService } from '../../services';

interface UseInviteCodeProps {
  groupId: string;
  groupName: string;
  isVisible: boolean;
  onInviteCreated?: (inviteCode: string) => void;
}

export const useInviteCode = ({
  groupId,
  groupName,
  isVisible,
  onInviteCreated,
}: UseInviteCodeProps) => {
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  const generateNewInviteCode = useCallback(async () => {
    try {
      setLoading(true);
      const code = await dataService.generateInviteCode(groupId);
      setInviteCode(code);
      setIsExpired(false);
      setDaysRemaining(7);

      if (onInviteCreated) {
        onInviteCreated(code);
      }

      Alert.alert('Success', 'New invite code generated successfully!');
    } catch (error) {
      console.error('Error generating invite code:', error);
      Alert.alert('Error', 'Failed to generate invite code. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [groupId, onInviteCreated]);

  // Load existing invite code when modal opens
  const loadInviteCode = useCallback(async () => {
    try {
      setLoading(true);
      const group = await dataService.getGroupById(groupId);

      if (!group) {
        throw new Error('Group not found');
      }

      // Check if group has an invite code
      if (group.inviteCode) {
        setInviteCode(group.inviteCode);

        // Check expiration
        if (group.inviteCodeCreatedAt) {
          const expirationTime = 7 * 24 * 60 * 60 * 1000; // 7 days
          const codeAge = Date.now() - new Date(group.inviteCodeCreatedAt).getTime();
          const daysLeft = Math.ceil((expirationTime - codeAge) / (24 * 60 * 60 * 1000));

          setIsExpired(codeAge > expirationTime);
          setDaysRemaining(daysLeft > 0 ? daysLeft : 0);

          if (codeAge > expirationTime) {
            Alert.alert(
              'Code Expired',
              'This invite code has expired. Please generate a new one.',
              [{ text: 'OK' }]
            );
          }
        }

        if (onInviteCreated) {
          onInviteCreated(group.inviteCode);
        }
      } else {
        // No code exists, generate one
        await generateNewInviteCode();
      }
    } catch (error) {
      console.error('Error loading invite code:', error);
      Alert.alert('Error', 'Failed to load invite code. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [groupId, onInviteCreated, generateNewInviteCode]);

  // Load code when modal becomes visible
  useEffect(() => {
    if (isVisible) {
      loadInviteCode();
    }
  }, [isVisible, loadInviteCode]);

  const handleShare = useCallback(async () => {
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
  }, [inviteCode, groupName]);

  const handleCopyCode = useCallback(async () => {
    try {
      await Clipboard.setStringAsync(inviteCode);
      Alert.alert('Copied!', `Invite code ${inviteCode} copied to clipboard`);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      Alert.alert('Error', 'Failed to copy invite code');
    }
  }, [inviteCode]);

  return {
    inviteCode,
    loading,
    isExpired,
    daysRemaining,
    generateNewInviteCode,
    loadInviteCode,
    handleShare,
    handleCopyCode,
  };
};
