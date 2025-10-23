/**
 * Home Screen - Display list of groups
 */

import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  Header,
  GroupCard,
  LoadingOverlay,
  JoinGroupBottomSheet,
  CustomRefreshControl,
} from '../../components';
import { RootStackParamList, Group } from '../../types';
import { dataService } from '../../services';
import { Ionicons } from '@expo/vector-icons';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();

  const [groups, setGroups] = useState<Group[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    if (!user) return;

    try {
      const userGroups = await dataService.getGroups(user.id);
      setGroups(userGroups);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadGroups();
  };

  const handleGroupPress = (group: Group) => {
    navigation.navigate('GroupDetail', { groupId: group.id });
  };

  const handleCreateGroup = () => {
    navigation.navigate('CreateGroup');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flexGrow: 0,
      padding: theme.spacing.md,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    emptyIcon: {
      marginBottom: theme.spacing.lg,
    },
    emptyTitle: {
      ...theme.typography.h5,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
    },
    emptyText: {
      ...theme.typography.body1,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
    createButton: {
      position: 'absolute',
      right: theme.spacing.lg,
      bottom: theme.spacing.lg,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.large,
    },
  });

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="people-outline"
        size={80}
        color={theme.colors.textSecondary}
        style={styles.emptyIcon}
      />
      <Text style={styles.emptyTitle}>No Groups Yet</Text>
      <Text style={styles.emptyText}>
        Create a group to start collaborating with others on calendars and tasks
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="My Groups" rightIcon="enter" onRightPress={() => setShowJoinModal(true)} />

      <FlatList
        data={groups}
        renderItem={({ item }) => <GroupCard group={item} onPress={() => handleGroupPress(item)} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.content, groups.length === 0 && { flex: 1 }]}
        ListEmptyComponent={renderEmpty}
        refreshControl={<CustomRefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      />

      <TouchableOpacity style={styles.createButton} onPress={handleCreateGroup}>
        <Ionicons name="add" size={32} color="#ffffff" />
      </TouchableOpacity>

      <JoinGroupBottomSheet
        isVisible={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSuccess={() => loadGroups()}
      />
    </View>
  );
};
