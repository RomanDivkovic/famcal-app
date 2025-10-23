/**
 * useGroupDetail Hook
 * Handles group detail screen logic
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { dataService } from '../../services';
import { Group } from '../../types';

interface Member {
  id: string;
  displayName: string;
  email: string;
  role: string;
}

export function useGroupDetail(groupId: string) {
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const loadGroupData = useCallback(async () => {
    try {
      setLoading(true);
      const groupData = await dataService.getGroupById(groupId);
      setGroup(groupData);

      // Load members information
      if (groupData?.members && typeof groupData.members === 'object') {
        const memberIds = Object.keys(groupData.members);
        console.info('Loading members:', memberIds);

        if (memberIds.length > 0) {
          const membersList = await Promise.all(
            memberIds.map(async (memberId) => {
              try {
                console.info('Fetching user data for:', memberId);
                const userData = await dataService.getUserById(memberId);
                console.info('User data received:', userData);

                if (!userData) {
                  console.warn('No user data found for:', memberId);
                  return {
                    id: memberId,
                    displayName: 'Unknown User',
                    email: '',
                    role: memberId === groupData.createdBy ? 'Owner' : 'Member',
                  };
                }

                return {
                  id: memberId,
                  displayName:
                    userData.displayName || userData.email?.split('@')[0] || 'Unknown User',
                  email: userData.email || '',
                  role: memberId === groupData.createdBy ? 'Owner' : 'Member',
                };
              } catch (error) {
                console.error('Error loading member:', memberId, error);
                return {
                  id: memberId,
                  displayName: 'Unknown User',
                  email: '',
                  role: memberId === groupData.createdBy ? 'Owner' : 'Member',
                };
              }
            })
          );
          console.info('Members list loaded:', membersList);
          setMembers(membersList);
        }
      }
    } catch (error) {
      console.error('Error loading group:', error);
      Alert.alert('Error', 'Failed to load group details');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    loadGroupData();
  }, [loadGroupData]);

  const handleLeaveGroup = useCallback((onSuccess: () => void) => {
    Alert.alert('Leave Group', 'Are you sure you want to leave this group?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          try {
            // TODO: Implement leave group functionality
            Alert.alert('Success', 'You have left the group');
            onSuccess();
          } catch (error) {
            console.error('Error leaving group:', error);
            Alert.alert('Error', 'Failed to leave group');
          }
        },
      },
    ]);
  }, []);

  const getInitials = useCallback((name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0]?.toUpperCase() || '?';
  }, []);

  const openInviteModal = useCallback(() => setShowInviteModal(true), []);
  const closeInviteModal = useCallback(() => setShowInviteModal(false), []);

  return {
    group,
    loading,
    members,
    showInviteModal,
    handleLeaveGroup,
    getInitials,
    openInviteModal,
    closeInviteModal,
  };
}
