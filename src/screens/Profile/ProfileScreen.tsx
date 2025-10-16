/**
 * Profile Screen - User profile and settings
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Header, Card, Button, ChangePasswordModal } from '../../components';
import { Ionicons } from '@expo/vector-icons';

export const ProfileScreen: React.FC = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [showChangePassword, setShowChangePassword] = React.useState(false);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (error) {
            console.error('Error signing out:', error);
          }
        },
      },
    ]);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      padding: theme.spacing.md,
    },
    profileCard: {
      alignItems: 'center',
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    avatarText: {
      ...theme.typography.h2,
      color: '#ffffff',
      fontWeight: '700',
    },
    name: {
      ...theme.typography.h4,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    email: {
      ...theme.typography.body2,
      color: theme.colors.textSecondary,
    },
    section: {
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      ...theme.typography.h6,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
      marginLeft: theme.spacing.xs,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    settingIcon: {
      marginRight: theme.spacing.md,
    },
    settingText: {
      ...theme.typography.body1,
      color: theme.colors.text,
    },
    settingValue: {
      ...theme.typography.body2,
      color: theme.colors.textSecondary,
    },
    signOutButton: {
      marginTop: theme.spacing.lg,
    },
  });

  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <View style={styles.container}>
      <Header title="Profile" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user?.displayName)}</Text>
          </View>
          <Text style={styles.name}>{user?.displayName || 'User'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <Card style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons
                name={isDark ? 'moon' : 'sunny'}
                size={24}
                color={theme.colors.text}
                style={styles.settingIcon}
              />
              <Text style={styles.settingText}>Dark Mode</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="#ffffff"
            />
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>

          <Card style={styles.settingItem} onPress={() => setShowChangePassword(true)}>
            <View style={styles.settingLeft}>
              <Ionicons
                name="key-outline"
                size={24}
                color={theme.colors.text}
                style={styles.settingIcon}
              />
              <Text style={styles.settingText}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <Card style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons
                name="information-circle-outline"
                size={24}
                color={theme.colors.text}
                style={styles.settingIcon}
              />
              <Text style={styles.settingText}>Version</Text>
            </View>
            <Text style={styles.settingValue}>1.0.0</Text>
          </Card>

          <Card
            style={styles.settingItem}
            onPress={() => {
              Alert.alert(
                'Backend Configuration',
                `Currently using: ${process.env.EXPO_PUBLIC_USE_FIREBASE === 'true' ? 'Firebase' : 'Custom API'}`,
                [{ text: 'OK' }]
              );
            }}
          >
            <View style={styles.settingLeft}>
              <Ionicons
                name="server-outline"
                size={24}
                color={theme.colors.text}
                style={styles.settingIcon}
              />
              <Text style={styles.settingText}>Backend</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </Card>
        </View>

        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="outline"
          style={styles.signOutButton}
        />
      </ScrollView>

      <ChangePasswordModal
        visible={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </View>
  );
};
