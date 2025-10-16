import React from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import LottieView from 'lottie-react-native';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.container}>
        <View style={styles.content}>
          <LottieView
            source={require('../../assets/animations/loader.json')}
            autoPlay
            loop
            style={styles.lottie}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 150,
    minHeight: 150,
  },
  lottie: {
    width: 100,
    height: 100,
  },
});
