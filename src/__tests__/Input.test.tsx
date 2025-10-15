/**
 * Input Component Tests
 */

import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { render } from './test-utils';
import { Input } from '../components';

describe('Input Component', () => {
  test('renders correctly with placeholder', () => {
    const { getByPlaceholderText } = render(
      <Input placeholder="Enter text" value="" onChangeText={() => {}} />
    );
    expect(getByPlaceholderText('Enter text')).toBeTruthy();
  });

  test('renders with initial value', () => {
    const { getByDisplayValue } = render(
      <Input placeholder="Enter text" value="Initial value" onChangeText={() => {}} />
    );
    expect(getByDisplayValue('Initial value')).toBeTruthy();
  });

  test('calls onChangeText when text changes', () => {
    const onChangeTextMock = jest.fn();
    const { getByPlaceholderText } = render(
      <Input placeholder="Type here" value="" onChangeText={onChangeTextMock} />
    );

    const input = getByPlaceholderText('Type here');
    fireEvent.changeText(input, 'New text');

    expect(onChangeTextMock).toHaveBeenCalledWith('New text');
  });

  test('handles secure text entry for passwords', () => {
    const { getByPlaceholderText } = render(
      <Input placeholder="Enter password" value="" onChangeText={() => {}} secureTextEntry={true} />
    );

    const input = getByPlaceholderText('Enter password');
    expect(input).toBeTruthy();
    expect(input.props.secureTextEntry).toBe(true);
  });

  test('renders with label', () => {
    const { getByText } = render(
      <Input label="Email Address" placeholder="Enter email" value="" onChangeText={() => {}} />
    );

    expect(getByText('Email Address')).toBeTruthy();
  });

  test('renders with error message', () => {
    const { getByText } = render(
      <Input
        placeholder="Enter email"
        value=""
        onChangeText={() => {}}
        error="Invalid email address"
      />
    );

    expect(getByText('Invalid email address')).toBeTruthy();
  });

  test('is disabled when disabled prop is true', () => {
    const onChangeTextMock = jest.fn();
    const { getByPlaceholderText } = render(
      <Input
        placeholder="Disabled input"
        value=""
        onChangeText={onChangeTextMock}
        editable={false}
      />
    );

    const input = getByPlaceholderText('Disabled input');
    expect(input.props.editable).toBe(false);
  });

  test('handles multiline input', () => {
    const { getByPlaceholderText } = render(
      <Input
        placeholder="Enter description"
        value=""
        onChangeText={() => {}}
        multiline={true}
        numberOfLines={4}
      />
    );

    const input = getByPlaceholderText('Enter description');
    expect(input.props.multiline).toBe(true);
    expect(input.props.numberOfLines).toBe(4);
  });
});
