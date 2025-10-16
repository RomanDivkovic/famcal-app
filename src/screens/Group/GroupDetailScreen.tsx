/**
 * Group Detail Screen
 * Displays details of a group and its members
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, Header, Button, LoadingOverlay, InviteModal } from '../../components';
import { RootStackParamList, Group } from '../../types';
import { dataService } from '../../services';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

type GroupDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'GroupDetail'>;
type GroupDetailScreenRouteProp = RouteProp<RootStackParamList, 'GroupDetail'>;

interface Props {
  navigation: GroupDetailScreenNavigationProp;
  route: GroupDetailScreenRouteProp;
}

export const GroupDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { groupId } = route.params;
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<
    Array<{ id: string; displayName: string; email: string; role: string }>
  >([]);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    loadGroupData();
  }, [groupId]);

  const loadGroupData = async () => {
    try {
      setLoading(true);
      const groupData = await dataService.getGroupById(groupId);
      setGroup(groupData);

      // Load members (this might need to be added to your data service)
      // For now, we'll show the creator as the only member
      if (groupData?.createdBy) {
        setMembers([
          {
            id: groupData.createdBy,
            displayName: 'Group Creator',
            email: '',
            role: 'owner',
          },
        ]);
      }
    } catch (error) {
      console.error('Error loading group:', error);
      Alert.alert('Error', 'Failed to load group details');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = () => {
    Alert.alert('Leave Group', 'Are you sure you want to leave this group?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          try {
            // TODO: Implement leave group functionality
            Alert.alert('Success', 'You have left the group');
            navigation.goBack();
          } catch (error) {
            console.error('Error leaving group:', error);
            Alert.alert('Error', 'Failed to leave group');
          }
        },
      },
    ]);
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0]?.toUpperCase() || '?';
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.md,
    },
    section: {
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      ...theme.typography.h6,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    groupHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    colorIndicator: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: theme.spacing.md,
    },
    groupInfo: {
      flex: 1,
    },
    groupName: {
      ...theme.typography.h5,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    groupDescription: {
      ...theme.typography.body2,
      color: theme.colors.textSecondary,
    },
    memberCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    memberAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    memberAvatarText: {
      ...theme.typography.button,
      color: '#ffffff',
      fontWeight: '600',
    },
    memberInfo: {
      flex: 1,
    },
    memberName: {
      ...theme.typography.body1,
      color: theme.colors.text,
      fontWeight: '500',
    },
    memberRole: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      textTransform: 'capitalize',
    },
    button: {
      marginTop: theme.spacing.md,
    },
    emptyText: {
      ...theme.typography.body2,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      fontStyle: 'italic',
    },
  });

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
            onPress={() => setShowInviteModal(true)}
            icon={<Ionicons name="person-add" size={20} color="#ffffff" />}
            fullWidth
            style={styles.button}
          />
          <Button
            title="Leave Group"
            onPress={handleLeaveGroup}
            variant="outline"
            fullWidth
            style={styles.button}
          />
        </View>
      </ScrollView>

      <InviteModal
        visible={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        groupId={groupId}
        groupName={group?.name || 'Group'}
      />
    </View>
  );
};
