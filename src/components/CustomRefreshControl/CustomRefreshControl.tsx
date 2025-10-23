/**
 * CustomRefreshControl Component
 * A custom refresh control using Lottie animation
 */

import React from 'react';
import { View, StyleSheet, RefreshControl, RefreshControlProps } from 'react-native';
import LottieView from 'lottie-react-native';

interface CustomRefreshControlProps extends Omit<RefreshControlProps, 'refreshing' | 'onRefresh'> {
  refreshing: boolean;
  onRefresh: () => void;
}

export const CustomRefreshControl: React.FC<CustomRefreshControlProps> = ({
  refreshing,
  onRefresh,

  ...props
}) => {
  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor="transparent"
      colors={['transparent']}
      style={{ backgroundColor: 'transparent' }}
      {...props}
    >
      {refreshing && (
        <View style={styles.lottieContainer}>
          <LottieView
            source={require('../../../assets/animations/mini_loader.json')}
            autoPlay
            loop
            style={styles.lottie}
          />
        </View>
      )}
    </RefreshControl>
  );
};

const styles = StyleSheet.create({
  lottieContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
  },
  lottie: {
    width: 60,
    height: 60,
  },
});
