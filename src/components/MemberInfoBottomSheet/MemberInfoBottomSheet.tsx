/**
 * Member Info Bottom Sheet Component
 * Shows detailed information about a group member
 */

import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import type { Theme } from '../../theme';

interface Member {
  id: string;
  displayName: string;
  email: string;
  role: string;
  joinedAt?: string;
}

interface MemberInfoBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  member: Member | null;
}

const createStyles = (theme: Theme) => ({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  avatarContainer: {
    alignItems: 'center' as const,
    paddingVertical: theme.spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: theme.spacing.md,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  memberName: {
    ...theme.typography.h4,
    color: theme.colors.text,
    textAlign: 'center' as const,
  },
  memberRole: {
    ...theme.typography.body2,
    color: theme.colors.primary,
    textTransform: 'capitalize' as const,
    marginTop: theme.spacing.xs,
    backgroundColor: `${theme.colors.primary}20`,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.round,
    overflow: 'hidden' as const,
  },
  infoSection: {
    paddingTop: theme.spacing.lg,
  },
  infoRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  infoIcon: {
    width: 40,
    alignItems: 'center' as const,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    ...theme.typography.body1,
    color: theme.colors.text,
  },
});

export const MemberInfoBottomSheet: React.FC<MemberInfoBottomSheetProps> = ({
  isVisible,
  onClose,
  member,
}) => {
  const { theme } = useTheme();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const styles = createStyles(theme);

  const snapPoints = useMemo(() => ['55%'], []);

  useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isVisible]);

  const handleClose = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const getRoleIcon = (role: string) => {
    const roleLower = role?.toLowerCase() || '';
    switch (roleLower) {
      case 'owner':
        return 'shield-checkmark';
      case 'admin':
        return 'shield';
      default:
        return 'person';
    }
  };

  const getRoleLabel = (role: string) => {
    const roleLower = role?.toLowerCase() || '';
    switch (roleLower) {
      case 'owner':
        return 'Group Owner';
      case 'admin':
        return 'Administrator';
      default:
        return 'Member';
    }
  };

  // Always render the BottomSheet, but with empty content if no member
  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: theme.colors.background }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.textSecondary }}
    >
      {member ? (
        <BottomSheetView style={styles.container}>
          <View style={styles.header}>
            <View style={{ flex: 1 }} />
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={28} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(member.displayName)}</Text>
            </View>
            <Text style={styles.memberName}>{member.displayName}</Text>
            <Text style={styles.memberRole}>{member.role}</Text>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="mail-outline" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{member.email}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons
                  name={getRoleIcon(member.role) as keyof typeof Ionicons.glyphMap}
                  size={24}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Role</Text>
                <Text style={styles.infoValue}>{getRoleLabel(member.role)}</Text>
              </View>
            </View>

            {member.joinedAt && (
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Ionicons name="calendar-outline" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Joined</Text>
                  <Text style={styles.infoValue}>
                    {new Date(member.joinedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </BottomSheetView>
      ) : (
        <BottomSheetView style={styles.container}>
          <View />
        </BottomSheetView>
      )}
    </BottomSheet>
  );
};
