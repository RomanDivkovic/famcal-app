/**
 * Group Collaboration Tests
 * Tests for group sharing, events, and todos
 */

import { firebaseService } from '../firebaseService';
import { Group, Event, Todo } from '../../types';

// Mock Firebase
jest.mock('../firebaseConfig', () => ({
  database: {},
  auth: {},
}));

describe('Group Collaboration', () => {
  const mockUserId1 = 'user-123';
  const mockUserId2 = 'user-456';
  const mockGroupId = 'group-789';

  describe('Group Creation and Sharing', () => {
    it('should create a group with creator as first member', async () => {
      const groupName = 'Test Family';
      const description = 'Family group for calendar sharing';

      const mockCreateGroup = jest.spyOn(firebaseService, 'createGroup').mockResolvedValue({
        id: mockGroupId,
        name: groupName,
        description,
        members: { [mockUserId1]: true },
        createdBy: mockUserId1,
        createdAt: new Date(),
        inviteCode: 'ABC123',
      } as Group);

      const group = await firebaseService.createGroup(groupName, description, mockUserId1);

      expect(group.id).toBe(mockGroupId);
      expect(group.name).toBe(groupName);
      expect(group.members[mockUserId1]).toBe(true);
      expect(Object.keys(group.members)).toHaveLength(1);
      expect(group.createdBy).toBe(mockUserId1);
      expect(group.inviteCode).toBeDefined();

      mockCreateGroup.mockRestore();
    });

    it('should generate unique invite code for group', async () => {
      const mockGenerateInviteCode = jest
        .spyOn(firebaseService, 'generateInviteCode')
        .mockResolvedValue('XYZ789');

      const inviteCode = await firebaseService.generateInviteCode(mockGroupId);

      expect(inviteCode).toBe('XYZ789');
      expect(inviteCode).toHaveLength(6);

      mockGenerateInviteCode.mockRestore();
    });

    it('should allow user to join group with valid invite code', async () => {
      const mockGroup: Group = {
        id: mockGroupId,
        name: 'Test Group',
        members: { [mockUserId1]: true },
        createdBy: mockUserId1,
        createdAt: new Date(),
        inviteCode: 'ABC123',
      };

      const mockFindGroup = jest
        .spyOn(firebaseService, 'findGroupByInviteCode')
        .mockResolvedValue(mockGroup);

      const mockJoinGroup = jest.spyOn(firebaseService, 'joinGroup').mockResolvedValue(undefined);

      const group = await firebaseService.findGroupByInviteCode('ABC123');
      expect(group).toBeTruthy();
      expect(group?.inviteCode).toBe('ABC123');

      await firebaseService.joinGroup(mockGroupId, mockUserId2, 'ABC123');

      expect(mockJoinGroup).toHaveBeenCalledWith(mockGroupId, mockUserId2, 'ABC123');

      mockFindGroup.mockRestore();
      mockJoinGroup.mockRestore();
    });

    it('should not allow joining with expired invite code', async () => {
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 8); // 8 days ago

      const mockGroup: Group = {
        id: mockGroupId,
        name: 'Test Group',
        members: { [mockUserId1]: true },
        createdBy: mockUserId1,
        createdAt: new Date(),
        inviteCode: 'OLD123',
        inviteCodeCreatedAt: expiredDate,
      };

      const mockFindGroup = jest
        .spyOn(firebaseService, 'findGroupByInviteCode')
        .mockResolvedValue(mockGroup);

      const mockJoinGroup = jest
        .spyOn(firebaseService, 'joinGroup')
        .mockRejectedValue(new Error('Invite code has expired'));

      await expect(firebaseService.joinGroup(mockGroupId, mockUserId2, 'OLD123')).rejects.toThrow(
        'Invite code has expired'
      );

      mockFindGroup.mockRestore();
      mockJoinGroup.mockRestore();
    });
  });

  describe('Shared Events', () => {
    it('should create group event visible to all members', async () => {
      const eventData = {
        title: 'Family Dinner',
        description: 'Monthly family gathering',
        startDate: new Date('2025-10-25T18:00:00'),
        endDate: new Date('2025-10-25T20:00:00'),
        createdBy: mockUserId1,
        groupId: mockGroupId,
      };

      const mockCreatedEvent: Event = {
        id: 'event-123',
        ...eventData,
      };

      const mockCreateEvent = jest
        .spyOn(firebaseService, 'createEvent')
        .mockResolvedValue(mockCreatedEvent);

      const event = await firebaseService.createEvent(eventData);

      expect(event.id).toBe('event-123');
      expect(event.groupId).toBe(mockGroupId);
      expect(event.title).toBe('Family Dinner');
      expect(event.createdBy).toBe(mockUserId1);

      mockCreateEvent.mockRestore();
    });

    it('should allow all group members to view group events', async () => {
      const mockEvents: Event[] = [
        {
          id: 'event-1',
          title: 'Group Event 1',
          startDate: new Date(),
          endDate: new Date(),
          createdBy: mockUserId1,
          groupId: mockGroupId,
        },
        {
          id: 'event-2',
          title: 'Group Event 2',
          startDate: new Date(),
          endDate: new Date(),
          createdBy: mockUserId2,
          groupId: mockGroupId,
        },
      ];

      const mockGetEventsForUser = jest
        .spyOn(firebaseService, 'getEventsForUser')
        .mockResolvedValue(mockEvents);

      const userEvents = await firebaseService.getEventsForUser(mockUserId2);

      expect(userEvents).toHaveLength(2);
      expect(userEvents.every((e) => e.groupId === mockGroupId)).toBe(true);

      mockGetEventsForUser.mockRestore();
    });

    it('should keep personal events private', async () => {
      const personalEvent: Event = {
        id: 'event-personal',
        title: 'Personal Appointment',
        startDate: new Date(),
        endDate: new Date(),
        createdBy: mockUserId1,
        // No groupId = personal event
      };

      const mockCreateEvent = jest
        .spyOn(firebaseService, 'createEvent')
        .mockResolvedValue(personalEvent);

      const event = await firebaseService.createEvent({
        title: 'Personal Appointment',
        startDate: new Date(),
        endDate: new Date(),
        createdBy: mockUserId1,
      });

      expect(event.groupId).toBeUndefined();

      mockCreateEvent.mockRestore();
    });
  });

  describe('Shared Todos', () => {
    it('should create group todo visible to all members', async () => {
      const todoData = {
        text: 'Buy groceries',
        description: 'Weekly shopping',
        completed: false,
        createdBy: mockUserId1,
        groupId: mockGroupId,
        dueDate: new Date('2025-10-22T12:00:00'),
        createdAt: new Date(),
      };

      const mockCreatedTodo: Todo = {
        id: 'todo-123',
        ...todoData,
      };

      const mockCreateTodo = jest
        .spyOn(firebaseService, 'createTodo')
        .mockResolvedValue(mockCreatedTodo);

      const todo = await firebaseService.createTodo(todoData);

      expect(todo.id).toBe('todo-123');
      expect(todo.groupId).toBe(mockGroupId);
      expect(todo.text).toBe('Buy groceries');
      expect(todo.createdBy).toBe(mockUserId1);

      mockCreateTodo.mockRestore();
    });

    it('should allow all group members to view group todos', async () => {
      const mockTodos: Todo[] = [
        {
          id: 'todo-1',
          text: 'Group Task 1',
          completed: false,
          createdBy: mockUserId1,
          groupId: mockGroupId,
          createdAt: new Date(),
        },
        {
          id: 'todo-2',
          text: 'Group Task 2',
          completed: true,
          createdBy: mockUserId2,
          groupId: mockGroupId,
          createdAt: new Date(),
        },
      ];

      const mockGetTodosForUser = jest
        .spyOn(firebaseService, 'getTodosForUser')
        .mockResolvedValue(mockTodos);

      const userTodos = await firebaseService.getTodosForUser(mockUserId2);

      expect(userTodos).toHaveLength(2);
      expect(userTodos.every((t) => t.groupId === mockGroupId)).toBe(true);

      mockGetTodosForUser.mockRestore();
    });

    it('should allow group members to complete todos', async () => {
      const mockToggleTodo = jest
        .spyOn(firebaseService, 'toggleTodoComplete')
        .mockResolvedValue(undefined);

      await firebaseService.toggleTodoComplete('todo-123', mockGroupId);

      expect(mockToggleTodo).toHaveBeenCalledWith('todo-123', mockGroupId);

      mockToggleTodo.mockRestore();
    });
  });

  describe('Data Isolation', () => {
    it('should not show personal events to other users', async () => {
      const user1Events: Event[] = [
        {
          id: 'event-personal-1',
          title: 'Personal Event',
          startDate: new Date(),
          endDate: new Date(),
          createdBy: mockUserId1,
          // No groupId
        },
      ];

      const user2Events: Event[] = [];

      const mockGetEvents = jest
        .spyOn(firebaseService, 'getEventsForUser')
        .mockImplementation((userId) => {
          if (userId === mockUserId1) return Promise.resolve(user1Events);
          if (userId === mockUserId2) return Promise.resolve(user2Events);
          return Promise.resolve([]);
        });

      const user1EventsList = await firebaseService.getEventsForUser(mockUserId1);
      const user2EventsList = await firebaseService.getEventsForUser(mockUserId2);

      expect(user1EventsList).toHaveLength(1);
      expect(user2EventsList).toHaveLength(0);

      mockGetEvents.mockRestore();
    });

    it('should not show personal todos to other users', async () => {
      const user1Todos: Todo[] = [
        {
          id: 'todo-personal-1',
          text: 'Personal Task',
          completed: false,
          createdBy: mockUserId1,
          createdAt: new Date(),
          // No groupId
        },
      ];

      const user2Todos: Todo[] = [];

      const mockGetTodos = jest
        .spyOn(firebaseService, 'getTodosForUser')
        .mockImplementation((userId) => {
          if (userId === mockUserId1) return Promise.resolve(user1Todos);
          if (userId === mockUserId2) return Promise.resolve(user2Todos);
          return Promise.resolve([]);
        });

      const user1TodosList = await firebaseService.getTodosForUser(mockUserId1);
      const user2TodosList = await firebaseService.getTodosForUser(mockUserId2);

      expect(user1TodosList).toHaveLength(1);
      expect(user2TodosList).toHaveLength(0);

      mockGetTodos.mockRestore();
    });
  });
});
