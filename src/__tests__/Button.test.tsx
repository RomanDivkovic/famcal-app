/**
 * Button Component Tests
 */

import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { render } from './test-utils';
import { Button } from '../components';

describe('Button Component', () => {
  test('renders correctly with title', () => {
    const { getByText } = render(<Button title="Test Button" onPress={() => {}} />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  test('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<Button title="Click Me" onPress={onPressMock} />);

    const button = getByText('Click Me');
    fireEvent.press(button);

    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  test('renders disabled state', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button title="Disabled Button" onPress={onPressMock} disabled={true} />
    );

    const button = getByText('Disabled Button');
    expect(button).toBeTruthy();

    // Try to press disabled button
    fireEvent.press(button);

    // Should not call onPress when disabled
    expect(onPressMock).not.toHaveBeenCalled();
  });

  test('renders loading state', () => {
    const { UNSAFE_getByType } = render(
      <Button title="Loading" onPress={() => {}} loading={true} />
    );

    // Button should show ActivityIndicator when loading
    const activityIndicator = UNSAFE_getByType(require('react-native').ActivityIndicator);
    expect(activityIndicator).toBeTruthy();
  });

  test('renders outline variant', () => {
    const { getByText } = render(
      <Button title="Outline Button" onPress={() => {}} variant="outline" />
    );

    expect(getByText('Outline Button')).toBeTruthy();
  });

  test('button is disabled when loading', () => {
    const onPressMock = jest.fn();
    const { UNSAFE_getByType } = render(
      <Button title="Loading" onPress={onPressMock} loading={true} />
    );

    // Get the TouchableOpacity and check if it's disabled
    const touchable = UNSAFE_getByType(require('react-native').TouchableOpacity);
    expect(touchable.props.disabled).toBe(true);
  });
});
