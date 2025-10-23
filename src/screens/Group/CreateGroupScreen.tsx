/**
 * Create Group Screen
 * Form for creating a new group
 */

import React from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input, Header } from '../../components';
import { RootStackParamList } from '../../types';
import { useCreateGroup } from './useCreateGroup';
import { createCreateGroupStyles } from './createGroupStyles';

type CreateGroupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateGroup'>;

interface Props {
  navigation: CreateGroupScreenNavigationProp;
}

export const CreateGroupScreen = ({ navigation }: Props) => {
  const { theme } = useTheme();
  const { user } = useAuth();

  const {
    groupName,
    setGroupName,
    description,
    setDescription,
    loading,
    handleCreateGroup,
    isFormValid,
  } = useCreateGroup(user?.id, () => navigation.goBack());

  const styles = createCreateGroupStyles(theme);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <Header title="Create Group" showBack={true} onBack={() => navigation.goBack()} />

      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Text style={styles.title}>Create a New Group</Text>
          <Text style={styles.subtitle}>
            Groups help you organize events and todos with family, friends, or colleagues.
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Group Name *</Text>
            <Input
              placeholder="Enter group name"
              value={groupName}
              onChangeText={setGroupName}
              autoCapitalize="words"
              maxLength={50}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description (Optional)</Text>
            <Input
              placeholder="Enter group description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              maxLength={200}
              editable={!loading}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title={loading ? 'Creating...' : 'Create Group'}
              onPress={handleCreateGroup}
              loading={loading}
              disabled={loading || !isFormValid}
            />

            <Button
              title="Cancel"
              onPress={() => navigation.goBack()}
              variant="outline"
              style={styles.cancelButton}
              disabled={loading}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
