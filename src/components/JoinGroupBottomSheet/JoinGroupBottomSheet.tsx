/**
 * Join Group Bottom Sheet Component
 * Bottom sheet for joining a group using an invite code with @gorhom/bottom-sheet
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Keyboard } from 'react-native';
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../Button/Button';
import { styles as getStyles } from './styles';
import { useJoinGroup } from './useJoinGroup';

interface JoinGroupBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const JoinGroupBottomSheet: React.FC<JoinGroupBottomSheetProps> = ({
  isVisible,
  onClose,
  onSuccess,
}) => {
  const { theme } = useTheme();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { inviteCode, loading, handleCodeChange, handleJoinGroup } = useJoinGroup({
    onSuccess: () => {
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    },
  });

  const snapPoints = React.useMemo(() => ['50%', '70%'], []);
  const styles = getStyles(theme);

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    bottomSheetRef.current?.close();
  }, []);

  useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isVisible]);

  // Listen for keyboard dismiss and close the bottom sheet
  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      if (isVisible) {
        handleClose();
      }
    });

    return () => {
      keyboardDidHideListener.remove();
    };
  }, [isVisible, handleClose]);

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
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
    >
      <BottomSheetView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Join Group</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={28} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.description}>
            Enter the 8-character invite code shared by a group member to join their group.
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Invite Code</Text>
            <BottomSheetTextInput
              style={styles.input}
              placeholder="ABC12345"
              value={inviteCode}
              onChangeText={handleCodeChange}
              autoCapitalize="characters"
              maxLength={8}
              editable={!loading}
            />
          </View>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Join Group"
            onPress={handleJoinGroup}
            loading={loading}
            disabled={loading || inviteCode.length !== 8}
            fullWidth
            icon={!loading ? <Ionicons name="person-add" size={20} color="#ffffff" /> : undefined}
          />
          <Button
            title="Cancel"
            onPress={handleClose}
            variant="outline"
            fullWidth
            disabled={loading}
          />
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
};
