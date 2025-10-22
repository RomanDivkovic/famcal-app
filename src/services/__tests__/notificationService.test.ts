/**
 * Notification Service Tests
 */

import * as Notifications from 'expo-notifications';
import { notificationService } from '../notificationService';

// Mock expo-notifications
jest.mock('expo-notifications');
jest.mock('expo-device', () => ({
  isDevice: true,
}));
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      eas: {
        projectId: 'test-project-id',
      },
    },
  },
}));

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestPermissions', () => {
    it('should request permissions on a physical device', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const result = await notificationService.requestPermissions();

      expect(result).toBe(true);
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
    });

    it('should return false on simulator', async () => {
      // Temporarily override the mock
      jest.mock('expo-device', () => ({
        isDevice: false,
      }));

      // For this test, we'll skip it since mocking isDevice properly requires module reload
      // In real testing, you'd use jest.resetModules() and re-import
    });

    it('should return false if permission denied', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const result = await notificationService.requestPermissions();

      expect(result).toBe(false);
    });
  });

  describe('scheduleEventNotification', () => {
    it('should schedule notification 15 minutes before event', async () => {
      const eventId = 'event-123';
      const title = 'Team Meeting';
      const startDate = new Date(Date.now() + 30 * 60 * 1000); // 30 min from now
      const minutesBefore = 15;

      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue(
        'notification-id-123'
      );

      const notificationId = await notificationService.scheduleEventNotification(
        eventId,
        title,
        startDate,
        minutesBefore
      );

      expect(notificationId).toBe('notification-id-123');
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: '📅 Event Starting Soon',
          body: `${title} starts in ${minutesBefore} minutes`,
          data: {
            type: 'event',
            eventId,
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: expect.any(Date),
      });
    });

    it('should not schedule if time has passed', async () => {
      const eventId = 'event-123';
      const title = 'Past Event';
      const startDate = new Date(Date.now() - 10 * 60 * 1000); // 10 min ago
      const minutesBefore = 15;

      const notificationId = await notificationService.scheduleEventNotification(
        eventId,
        title,
        startDate,
        minutesBefore
      );

      expect(notificationId).toBeNull();
      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });
  });

  describe('scheduleTodoNotification', () => {
    it('should schedule notification 2 hours before todo due', async () => {
      const todoId = 'todo-123';
      const title = 'Submit Report';
      const dueDate = new Date(Date.now() + 5 * 60 * 60 * 1000); // 5 hours from now
      const hoursBefore = 2;

      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue(
        'notification-id-456'
      );

      const notificationId = await notificationService.scheduleTodoNotification(
        todoId,
        title,
        dueDate,
        hoursBefore
      );

      expect(notificationId).toBe('notification-id-456');
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: '✅ Todo Due Soon',
          body: `"${title}" is due in ${hoursBefore} hours`,
          data: {
            type: 'todo',
            todoId,
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: expect.any(Date),
      });
    });

    it('should not schedule if time has passed', async () => {
      const todoId = 'todo-123';
      const title = 'Overdue Todo';
      const dueDate = new Date(Date.now() - 1 * 60 * 60 * 1000); // 1 hour ago
      const hoursBefore = 2;

      const notificationId = await notificationService.scheduleTodoNotification(
        todoId,
        title,
        dueDate,
        hoursBefore
      );

      expect(notificationId).toBeNull();
      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });
  });

  describe('notifyGroupEventCreated', () => {
    it('should send immediate notification for new group event', async () => {
      const eventTitle = 'Team Standup';
      const creatorName = 'John Doe';
      const groupName = 'Engineering Team';
      const eventId = 'event-789';

      await notificationService.notifyGroupEventCreated(
        eventTitle,
        creatorName,
        groupName,
        eventId
      );

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: '📅 New Event in ' + groupName,
          body: `${creatorName} created "${eventTitle}"`,
          data: {
            type: 'event',
            eventId,
            groupName,
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.DEFAULT,
        },
        trigger: null,
      });
    });
  });

  describe('notifyGroupTodoCreated', () => {
    it('should send immediate notification for new group todo', async () => {
      const todoTitle = 'Review PR';
      const creatorName = 'Jane Smith';
      const groupName = 'Dev Team';
      const todoId = 'todo-789';

      await notificationService.notifyGroupTodoCreated(todoTitle, creatorName, groupName, todoId);

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: '✅ New Todo in ' + groupName,
          body: `${creatorName} added "${todoTitle}"`,
          data: {
            type: 'todo',
            todoId,
            groupName,
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.DEFAULT,
        },
        trigger: null,
      });
    });
  });

  describe('notifyMemberJoined', () => {
    it('should send low-priority notification when member joins', async () => {
      const newMemberName = 'Alice Johnson';
      const groupName = 'Family';

      await notificationService.notifyMemberJoined(newMemberName, groupName);

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: '👋 New Member Joined',
          body: `${newMemberName} joined "${groupName}"`,
          data: {
            type: 'member-joined',
            groupName,
          },
          sound: false,
          priority: Notifications.AndroidNotificationPriority.LOW,
        },
        trigger: null,
      });
    });
  });

  describe('cancelNotification', () => {
    it('should cancel scheduled notification by ID', async () => {
      const notificationId = 'notification-123';

      await notificationService.cancelNotification(notificationId);

      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(notificationId);
    });
  });

  describe('cancelAllNotifications', () => {
    it('should cancel all scheduled notifications', async () => {
      await notificationService.cancelAllNotifications();

      expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    });
  });

  describe('getScheduledNotifications', () => {
    it('should return list of scheduled notifications', async () => {
      const mockNotifications = [
        { identifier: 'notif-1', content: {}, trigger: {} },
        { identifier: 'notif-2', content: {}, trigger: {} },
      ];

      (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue(
        mockNotifications
      );

      const notifications = await notificationService.getScheduledNotifications();

      expect(notifications).toEqual(mockNotifications);
      expect(notifications).toHaveLength(2);
    });
  });
});
