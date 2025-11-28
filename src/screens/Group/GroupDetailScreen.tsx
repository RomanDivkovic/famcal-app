/**
 * Group Detail Screen
 * Displays details of a group and its members
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Card,
  Header,
  Button,
  LoadingOverlay,
  InviteBottomSheet,
  MemberInfoBottomSheet,
} from '../../components';
import { RootStackParamList } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useGroupDetail } from './useGroupDetail';
import { createStyles } from './styles';

type GroupDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'GroupDetail'>;
type GroupDetailScreenRouteProp = RouteProp<RootStackParamList, 'GroupDetail'>;

interface Member {
  id: string;
  displayName: string;
  email: string;
  role: string;
  joinedAt?: string;
}

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
    handleDeleteGroup,
    getInitials,
    openInviteModal,
    closeInviteModal,
    isOwner,
  } = useGroupDetail(groupId);

  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showMemberInfo, setShowMemberInfo] = useState(false);

  const handleMemberPress = (member: Member) => {
    console.log('Member pressed:', member);
    setSelectedMember(member);
    setShowMemberInfo(true);
  };

  const styles = createStyles(theme);

  if (loading) {
    return (
      <View style={styles.container}>
        <Header showBack onBack={() => navigation.goBack()} />
        <LoadingOverlay visible={loading} />
      </View>
    );
  }

  if (!group) {
    return (
      <View style={styles.container}>
        <Header showBack onBack={() => navigation.goBack()} />
        <View style={styles.content}>
          <Text style={styles.emptyText}>Group not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header showBack onBack={() => navigation.goBack()} />
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
            <Card
              key={member.id}
              style={styles.memberCard}
              onPress={() => handleMemberPress(member as Member)}
            >
              <View style={styles.memberAvatar}>
                <Text style={styles.memberAvatarText}>{getInitials(member.displayName)}</Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.displayName}</Text>
                <Text style={styles.memberRole}>{member.role}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
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
          {isOwner ? (
            <Button
              title="Delete Group"
              onPress={() => handleDeleteGroup(() => navigation.goBack())}
              variant="outline"
              fullWidth
              style={styles.button}
            />
          ) : (
            <Button
              title="Leave Group"
              onPress={() => handleLeaveGroup(() => navigation.goBack())}
              variant="outline"
              fullWidth
              style={styles.button}
            />
          )}
        </View>
      </ScrollView>

      <InviteBottomSheet
        isVisible={showInviteModal}
        onClose={closeInviteModal}
        groupId={groupId}
        groupName={group?.name || 'Group'}
      />

      <MemberInfoBottomSheet
        isVisible={showMemberInfo}
        onClose={() => setShowMemberInfo(false)}
        member={selectedMember}
      />
    </View>
  );
};
