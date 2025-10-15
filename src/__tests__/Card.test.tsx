/**
 * Card Component Tests
 */

import React from 'react';
import { Text } from 'react-native';
import { fireEvent } from '@testing-library/react-native';
import { render } from './test-utils';
import { Card } from '../components';

describe('Card Component', () => {
  test('renders children correctly', () => {
    const { getByText } = render(
      <Card>
        <Text>Card Content</Text>
      </Card>
    );

    expect(getByText('Card Content')).toBeTruthy();
  });

  test('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Card onPress={onPressMock}>
        <Text>Pressable Card</Text>
      </Card>
    );

    fireEvent.press(getByText('Pressable Card'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  test('renders without onPress (non-pressable)', () => {
    const { getByText } = render(
      <Card>
        <Text>Static Card</Text>
      </Card>
    );

    expect(getByText('Static Card')).toBeTruthy();
  });

  test('renders with custom style', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByText } = render(
      <Card style={customStyle}>
        <Text>Styled Card</Text>
      </Card>
    );

    expect(getByText('Styled Card')).toBeTruthy();
  });
});
