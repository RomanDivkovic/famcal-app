/**
 * Header Component Tests
 */

import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { render } from './test-utils';
import { Header } from '../components';

// Mock safe area insets
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe('Header Component', () => {
  test('renders title correctly', () => {
    const { getByText } = render(<Header title="Test Header" />);
    expect(getByText('Test Header')).toBeTruthy();
  });

  test('renders back button when showBack is true', () => {
    const onBackMock = jest.fn();
    const { UNSAFE_getAllByType } = render(
      <Header title="Test Header" showBack={true} onBack={onBackMock} />
    );

    // The back button should be rendered as TouchableOpacity
    const touchables = UNSAFE_getAllByType(require('react-native').TouchableOpacity);
    expect(touchables.length).toBeGreaterThan(0);
  });

  test('calls onBack when back button is pressed', () => {
    const onBackMock = jest.fn();
    const { UNSAFE_getAllByType } = render(
      <Header title="Test Header" showBack={true} onBack={onBackMock} />
    );

    const touchables = UNSAFE_getAllByType(require('react-native').TouchableOpacity);
    if (touchables.length > 0) {
      fireEvent.press(touchables[0]);
      expect(onBackMock).toHaveBeenCalled();
    }
  });

  test('renders right icon when provided', () => {
    const onRightPressMock = jest.fn();
    const { UNSAFE_getAllByType } = render(
      <Header title="Test Header" rightIcon="settings" onRightPress={onRightPressMock} />
    );

    // Should have at least one TouchableOpacity (right icon button)
    const touchables = UNSAFE_getAllByType(require('react-native').TouchableOpacity);
    expect(touchables.length).toBeGreaterThan(0);
  });

  test('calls onRightPress when right icon is pressed', () => {
    const onRightPressMock = jest.fn();
    const { UNSAFE_getAllByType } = render(
      <Header title="Test Header" rightIcon="settings" onRightPress={onRightPressMock} />
    );

    const touchables = UNSAFE_getAllByType(require('react-native').TouchableOpacity);
    if (touchables.length > 0) {
      fireEvent.press(touchables[touchables.length - 1]); // Last button is right button
      expect(onRightPressMock).toHaveBeenCalled();
    }
  });

  test('renders without back button by default', () => {
    const { UNSAFE_queryAllByType } = render(<Header title="Test Header" />);

    // Should not have any TouchableOpacity if showBack is false and no rightIcon
    const touchables = UNSAFE_queryAllByType(require('react-native').TouchableOpacity);
    expect(touchables.length).toBe(0);
  });

  test('renders both back button and right icon', () => {
    const onBackMock = jest.fn();
    const onRightPressMock = jest.fn();
    const { UNSAFE_getAllByType } = render(
      <Header
        title="Test Header"
        showBack={true}
        onBack={onBackMock}
        rightIcon="settings"
        onRightPress={onRightPressMock}
      />
    );

    const touchables = UNSAFE_getAllByType(require('react-native').TouchableOpacity);
    expect(touchables.length).toBe(2); // Back button + right icon button
  });
});
