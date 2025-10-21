/**
 * Invite Bottom Sheet Component
 * Bottom sheet for inviting members to a group via invite code using gorhom/bottom-sheet
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Alert, ScrollView } from 'react-native';
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './index';
import { Ionicons } from '@expo/vector-icons';
import { dataService } from '../services';

interface InviteBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  onInviteCreated?: (inviteCode: string) => void;
}

export const InviteBottomSheet = ({
  isVisible,
  onClose,
  groupId,
  groupName,
  onInviteCreated,
}: InviteBottomSheetProps) => {
  const { theme } = useTheme();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Bottom sheet snap points
  const snapPoints = useMemo(() => ['70%', '90%'], []);

  const generateInviteCode = useCallback(async () => {
    try {
      setLoading(true);
      // Generate and save the invite code to Firebase
      const code = await dataService.generateInviteCode(groupId);
      setInviteCode(code);
      if (onInviteCreated) {
        onInviteCreated(code);
      }
    } catch (error) {
      console.error('Error generating invite code:', error);
      Alert.alert('Error', 'Failed to generate invite code. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [groupId, onInviteCreated]);

  useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.expand();
      generateInviteCode();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isVisible, generateInviteCode]);

  const handleShare = async () => {
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
  };

  const handleCopyCode = async () => {
    try {
      await Clipboard.setStringAsync(inviteCode);
      Alert.alert('Copied!', `Invite code ${inviteCode} copied to clipboard`);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      Alert.alert('Error', 'Failed to copy invite code');
    }
  };

  const handleClose = () => {
    bottomSheetRef.current?.close();
  };

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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.xl,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    title: {
      ...theme.typography.h5,
      color: theme.colors.text,
      fontWeight: '600',
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    content: {
      marginBottom: theme.spacing.xl,
    },
    description: {
      ...theme.typography.body2,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.lg,
      lineHeight: 22,
    },
    codeContainer: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.xl,
      borderRadius: theme.borderRadius.lg,
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderStyle: 'dashed',
    },
    codeLabel: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    code: {
      ...theme.typography.h3,
      color: theme.colors.primary,
      fontWeight: '700',
      letterSpacing: 4,
      fontFamily: 'monospace',
    },
    copyButton: {
      marginTop: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    copyButtonText: {
      ...theme.typography.button,
      color: theme.colors.primary,
      marginLeft: theme.spacing.xs,
    },
    instructionsTitle: {
      ...theme.typography.h6,
      color: theme.colors.text,
      fontWeight: '600',
      marginBottom: theme.spacing.md,
    },
    instructionsList: {
      marginBottom: theme.spacing.lg,
    },
    instructionItem: {
      flexDirection: 'row',
      marginBottom: theme.spacing.sm,
    },
    instructionNumber: {
      ...theme.typography.body2,
      color: theme.colors.primary,
      fontWeight: '600',
      width: 24,
    },
    instructionText: {
      ...theme.typography.body2,
      color: theme.colors.text,
      flex: 1,
    },
    buttonContainer: {
      gap: theme.spacing.md,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: theme.spacing.xl,
    },
  });

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
      <BottomSheetView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Invite Members</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={28} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          bounces={true}
          alwaysBounceVertical={true}
          scrollEventThrottle={16}
        >
          <View style={styles.content}>
            <Text style={styles.description}>
              Share this code with people you want to invite to {groupName}. The code is valid for 7
              days.
            </Text>

            <View style={styles.codeContainer}>
              <Text style={styles.codeLabel}>Invite Code</Text>
              {loading ? (
                <Text style={styles.code}>Generating...</Text>
              ) : (
                <>
                  <Text style={styles.code}>{inviteCode}</Text>
                  <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
                    <Ionicons name="copy-outline" size={20} color={theme.colors.primary} />
                    <Text style={styles.copyButtonText}>Copy Code</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            <Text style={styles.instructionsTitle}>How to join:</Text>
            <View style={styles.instructionsList}>
              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>1.</Text>
                <Text style={styles.instructionText}>
                  Open the Family Calendar app or create an account
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>2.</Text>
                <Text style={styles.instructionText}>Go to the Home (Groups) screen</Text>
              </View>
              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>3.</Text>
                <Text style={styles.instructionText}>Tap the &quot;Join Group&quot; button</Text>
              </View>
              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>4.</Text>
                <Text style={styles.instructionText}>Enter the invite code above</Text>
              </View>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Share Invite Code"
              onPress={handleShare}
              icon={<Ionicons name="share-social" size={20} color="#ffffff" />}
              fullWidth
            />
            <Button
              title="Generate New Code"
              onPress={generateInviteCode}
              variant="outline"
              fullWidth
              loading={loading}
              disabled={loading}
              icon={<Ionicons name="refresh" size={20} color={theme.colors.primary} />}
            />
          </View>
        </ScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
};
