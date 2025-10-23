/**
 * Group Detail Screen
 * Displays details of a group and its members
 */

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, Header, Button, LoadingOverlay, InviteBottomSheet } from '../../components';
import { RootStackParamList } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useGroupDetail } from './useGroupDetail';
import { createStyles } from './styles';

type GroupDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'GroupDetail'>;
type GroupDetailScreenRouteProp = RouteProp<RootStackParamList, 'GroupDetail'>;

interface Props {
  navigation: GroupDetailScreenNavigationProp;
  route: GroupDetailScreenRouteProp;
}

export const GroupDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useTheme();
  useAuth();
  const { groupId } = route.params;

  const {
    group,
    loading,
    members,
    showInviteModal,
    handleLeaveGroup,
    getInitials,
    openInviteModal,
    closeInviteModal,
  } = useGroupDetail(groupId);

  const styles = createStyles(theme);

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Group Details" showBack onBack={() => navigation.goBack()} />
        <LoadingOverlay visible={loading} />
      </View>
    );
  }

  if (!group) {
    return (
      <View style={styles.container}>
        <Header title="Group Details" showBack onBack={() => navigation.goBack()} />
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={styles.emptyText}>Group not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Group Details" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Group Info */}
        <Card style={styles.section}>
          <View style={styles.groupHeader}>
            <View
              style={[
                styles.colorIndicator,
                { backgroundColor: group.color || theme.colors.primary },
              ]}
            />
            <View style={styles.groupInfo}>
              <Text style={styles.groupName}>{group.name}</Text>
              {group.description && (
                <Text style={styles.groupDescription}>{group.description}</Text>
              )}
            </View>
          </View>
        </Card>

        {/* Members Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Members ({members.length})</Text>
          {members.map((member) => (
            <Card key={member.id} style={styles.memberCard}>
              <View style={styles.memberAvatar}>
                <Text style={styles.memberAvatarText}>{getInitials(member.displayName)}</Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.displayName}</Text>
                <Text style={styles.memberRole}>{member.role}</Text>
              </View>
            </Card>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Button
            title="Invite Members"
            onPress={openInviteModal}
            icon={<Ionicons name="person-add" size={20} color="#ffffff" />}
            fullWidth
            style={styles.button}
          />
          <Button
            title="Leave Group"
            onPress={() => handleLeaveGroup(() => navigation.goBack())}
            variant="outline"
            fullWidth
            style={styles.button}
          />
        </View>
      </ScrollView>

      <InviteBottomSheet
        isVisible={showInviteModal}
        onClose={closeInviteModal}
        groupId={groupId}
        groupName={group?.name || 'Group'}
      />
    </View>
  );
};
