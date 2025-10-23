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

export const CustomRefreshControl: React.FC<CustomRefreshControlProps & { children?: React.ReactNode }> = ({
  refreshing,
  onRefresh,
  children,
  ...props
}) => {
  return (
    <View style={{ flex: 1 }}>
      {children}
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        tintColor="transparent"
        colors={['transparent']}
        style={{ backgroundColor: 'transparent', position: 'absolute', top: 0, left: 0, right: 0, height: 0 }}
        {...props}
      />
      {refreshing && (
        <View style={styles.lottieOverlay}>
          <View style={styles.lottieContainer}>
            <LottieView
              source={require('../../../assets/animations/mini_loader.json')}
              autoPlay
              loop
              style={styles.lottie}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  lottieOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
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
