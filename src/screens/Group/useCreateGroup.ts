/**
 * useCreateGroup Hook
 * Handles create group form logic
 */

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { dataService } from '../../services';

export function useCreateGroup(userId: string | undefined, onSuccess: () => void) {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateGroup = useCallback(async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'You must be logged in to create a group');
      return;
    }

    setLoading(true);
    try {
      await dataService.createGroup(groupName.trim(), description.trim(), userId);

      Alert.alert('Success', 'Group created successfully!', [
        {
          text: 'OK',
          onPress: onSuccess,
        },
      ]);
    } catch (error) {
      console.error('Create group error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create group';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [groupName, description, userId, onSuccess]);

  const isFormValid = groupName.trim().length > 0;

  return {
    groupName,
    setGroupName,
    description,
    setDescription,
    loading,
    handleCreateGroup,
    isFormValid,
  };
}
