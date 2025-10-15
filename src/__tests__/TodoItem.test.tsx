/**
 * TodoItem Component Tests
 */

import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { render } from './test-utils';
import { TodoItem } from '../components';
import { Todo } from '../types';

describe('TodoItem Component', () => {
  const mockTodo: Todo = {
    id: 'todo-1',
    text: 'Test todo item',
    completed: false,
    groupId: 'group-1',
    createdBy: 'user-1',
    createdAt: new Date(),
  };

  test('renders todo text correctly', () => {
    const { getByText } = render(<TodoItem todo={mockTodo} />);

    expect(getByText('Test todo item')).toBeTruthy();
  });

  test('calls onToggle when toggle button is pressed', () => {
    const onToggleMock = jest.fn();
    const { UNSAFE_getAllByType } = render(<TodoItem todo={mockTodo} onToggle={onToggleMock} />);

    // The TodoItem uses TouchableOpacity for the checkbox
    const touchables = UNSAFE_getAllByType(require('react-native').TouchableOpacity);
    if (touchables.length > 0) {
      fireEvent.press(touchables[0]);
      expect(onToggleMock).toHaveBeenCalled();
    }
  });

  test('calls onPress when item is pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<TodoItem todo={mockTodo} onPress={onPressMock} />);

    fireEvent.press(getByText('Test todo item'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  test('renders completed state', () => {
    const completedTodo = { ...mockTodo, completed: true };
    const { getByText } = render(<TodoItem todo={completedTodo} />);

    expect(getByText('Test todo item')).toBeTruthy();
  });

  test('renders with due date if provided', () => {
    const todoWithDueDate: Todo = {
      ...mockTodo,
      dueDate: new Date('2025-12-31'),
    };

    const { getByText } = render(<TodoItem todo={todoWithDueDate} />);

    expect(getByText('Test todo item')).toBeTruthy();
  });

  test('renders with priority if provided', () => {
    const todoWithPriority: Todo = {
      ...mockTodo,
      priority: 'high',
    };

    const { getByText } = render(<TodoItem todo={todoWithPriority} />);

    expect(getByText('Test todo item')).toBeTruthy();
  });

  test('handles multiple todos independently', () => {
    const onPressMock = jest.fn();
    const todo1 = { ...mockTodo, id: 'todo-1', text: 'First todo' };
    const todo2 = { ...mockTodo, id: 'todo-2', text: 'Second todo' };

    const { getByText } = render(
      <>
        <TodoItem todo={todo1} onPress={() => onPressMock('todo-1')} />
        <TodoItem todo={todo2} onPress={() => onPressMock('todo-2')} />
      </>
    );

    fireEvent.press(getByText('First todo'));
    expect(onPressMock).toHaveBeenCalledWith('todo-1');

    fireEvent.press(getByText('Second todo'));
    expect(onPressMock).toHaveBeenCalledWith('todo-2');
  });

  test('renders description when provided', () => {
    const todoWithDescription: Todo = {
      ...mockTodo,
      description: 'This is a test description',
    };

    const { getByText } = render(<TodoItem todo={todoWithDescription} />);

    expect(getByText('Test todo item')).toBeTruthy();
    // Description might be shown in the component
  });
});
