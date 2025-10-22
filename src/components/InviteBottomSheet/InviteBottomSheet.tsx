/**
 * Invite Bottom Sheet Component
 * Bottom sheet for inviting members to a group via invite code using gorhom/bottom-sheet
 */

import React, { useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../Button/Button';
import { Ionicons } from '@expo/vector-icons';
import { useInviteCode } from './useInviteCode';
import { styles as getStyles } from './styles';

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
  const {
    inviteCode,
    loading,
    isExpired,
    daysRemaining,
    generateNewInviteCode,
    handleShare,
    handleCopyCode,
  } = useInviteCode({
    groupId,
    groupName,
    isVisible,
    onInviteCreated,
  });

  const snapPoints = useMemo(() => ['70%', '90%'], []);
  const styles = getStyles(theme);

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
              Share this code with people you want to invite to {groupName}.{' '}
              {daysRemaining !== null && !isExpired && (
                <Text style={{ color: theme.colors.success, fontWeight: '600' }}>
                  Valid for {daysRemaining} more {daysRemaining === 1 ? 'day' : 'days'}.
                </Text>
              )}
              {isExpired && (
                <Text style={{ color: theme.colors.error, fontWeight: '600' }}>
                  This code has expired.
                </Text>
              )}
            </Text>

            <View
              style={[
                styles.codeContainer,
                isExpired && { borderColor: theme.colors.error, opacity: 0.6 },
              ]}
            >
              <Text style={styles.codeLabel}>Invite Code</Text>
              {loading ? (
                <Text style={styles.code}>Loading...</Text>
              ) : (
                <>
                  <Text style={[styles.code, isExpired && { color: theme.colors.error }]}>
                    {inviteCode || 'No code'}
                  </Text>
                  {!isExpired && inviteCode && (
                    <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
                      <Ionicons name="copy-outline" size={20} color={theme.colors.primary} />
                      <Text style={styles.copyButtonText}>Copy Code</Text>
                    </TouchableOpacity>
                  )}
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
              disabled={isExpired || !inviteCode}
            />
            <Button
              title={isExpired ? 'Generate New Code' : 'Refresh Code'}
              onPress={generateNewInviteCode}
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
