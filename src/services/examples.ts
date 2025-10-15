/**
 * Example usage of the data service
 * This file demonstrates how to use the backend abstraction layer
 */

import { dataService } from '../services';
import { Group, Event, Todo } from '../types';

// Example: Create a new group
export const createNewGroup = async (userId: string) => {
  try {
    const group = await dataService.createGroup(
      'My New Group',
      'A group for collaborating on projects',
      userId
    );
    console.log('Created group:', group);
    return group;
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
};

// Example: Fetch user's events for current month
export const fetchMonthEvents = async (userId: string) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const events = await dataService.getEventsInDateRange(startOfMonth, endOfMonth, userId);

    console.log('Month events:', events);
    return events;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

// Example: Create a new event
export const createNewEvent = async (userId: string, groupId?: string) => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0);

    const endTime = new Date(tomorrow);
    endTime.setHours(15, 0, 0, 0);

    const event = await dataService.createEvent({
      title: 'Team Meeting',
      description: 'Discuss project progress',
      startDate: tomorrow,
      endDate: endTime,
      groupId,
      createdBy: userId,
      location: 'Conference Room A',
      reminders: [15, 30], // 15 and 30 minutes before
    });

    console.log('Created event:', event);
    return event;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// Example: Create a new todo
export const createNewTodo = async (userId: string, groupId?: string) => {
  try {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // Due in 7 days

    const todo = await dataService.createTodo({
      text: 'Complete project documentation',
      description: 'Write comprehensive docs for the new feature',
      completed: false,
      createdBy: userId,
      groupId,
      priority: 'high',
      dueDate,
      createdAt: new Date(),
    });

    console.log('Created todo:', todo);
    return todo;
  } catch (error) {
    console.error('Error creating todo:', error);
    throw error;
  }
};

// Example: Toggle todo completion
export const toggleTodo = async (todoId: string) => {
  try {
    await dataService.toggleTodoComplete(todoId);
    console.log('Toggled todo:', todoId);
  } catch (error) {
    console.error('Error toggling todo:', error);
    throw error;
  }
};

// Example: Subscribe to real-time updates (Firebase only)
export const subscribeToGroupUpdates = (userId: string, callback: (groups: Group[]) => void) => {
  if (dataService.subscribeToGroups) {
    const unsubscribe = dataService.subscribeToGroups(userId, callback);
    return unsubscribe;
  }

  // For REST API, you'd need to implement polling or WebSockets
  console.warn('Real-time subscriptions not supported with current backend');
  return () => {};
};
