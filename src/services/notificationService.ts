/**
 * Notification Service
 * Handles push notifications for events, todos, and group invites
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  type: 'event' | 'todo' | 'invite';
  id: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

class NotificationService {
  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.warn('Push notifications only work on physical devices');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Failed to get push notification permissions');
      return false;
    }

    // For Android, configure notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1a3a52',
      });

      // Events channel
      await Notifications.setNotificationChannelAsync('events', {
        name: 'Event Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1a3a52',
        sound: 'default',
      });

      // Todos channel
      await Notifications.setNotificationChannelAsync('todos', {
        name: 'Todo Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#ff6b6b',
        sound: 'default',
      });

      // Invites channel
      await Notifications.setNotificationChannelAsync('invites', {
        name: 'Group Invitations',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4ecdc4',
      });
    }

    return true;
  }

  /**
   * Get Expo push token for this device
   */
  async getExpoPushToken(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.info('Push tokens only work on physical devices, skipping in simulator');
        return null;
      }

      const projectId = Constants.expoConfig?.extra?.eas?.projectId;

      if (!projectId || projectId === 'your-project-id') {
        console.info(
          'No EAS project ID configured. Run "eas init" to set up push notifications. Local notifications will still work.'
        );
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      console.info('Expo Push Token:', token.data);
      return token.data;
    } catch {
      // Silently fail for Expo Go or invalid project ID
      // This is expected behavior until EAS project is set up
      console.info('Push token not available (expected in Expo Go or without EAS setup)');
      return null;
    }
  }

  /**
   * Schedule a local notification for an event
   * @param eventId - Event ID
   * @param title - Event title
   * @param startDate - Event start date
   * @param minutesBefore - Minutes before event to notify (default: 15)
   */
  async scheduleEventNotification(
    eventId: string,
    title: string,
    startDate: Date,
    minutesBefore: number = 15
  ): Promise<string | null> {
    try {
      const trigger = new Date(startDate.getTime() - minutesBefore * 60 * 1000);

      // Don't schedule if the time has already passed
      if (trigger.getTime() <= Date.now()) {
        console.info('Event notification time has passed, not scheduling');
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
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
        trigger: trigger as unknown as Notifications.NotificationTriggerInput,
      });

      console.info(`Scheduled event notification: ${notificationId}`);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling event notification:', error);
      return null;
    }
  }

  /**
   * Schedule a local notification for a todo
   * @param todoId - Todo ID
   * @param title - Todo title
   * @param dueDate - Todo due date
   * @param hoursBefore - Hours before due date to notify (default: 2)
   */
  async scheduleTodoNotification(
    todoId: string,
    title: string,
    dueDate: Date,
    hoursBefore: number = 2
  ): Promise<string | null> {
    try {
      const trigger = new Date(dueDate.getTime() - hoursBefore * 60 * 60 * 1000);

      // Don't schedule if the time has already passed
      if (trigger.getTime() <= Date.now()) {
        console.info('Todo notification time has passed, not scheduling');
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '✅ Todo Due Soon',
          body: `"${title}" is due in ${hoursBefore} ${hoursBefore === 1 ? 'hour' : 'hours'}`,
          data: {
            type: 'todo',
            todoId,
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: trigger as unknown as Notifications.NotificationTriggerInput,
      });

      console.info(`Scheduled todo notification: ${notificationId}`);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling todo notification:', error);
      return null;
    }
  }

  /**
   * Send immediate notification for group invite
   * @param groupName - Group name
   * @param invitedBy - Name of person who invited
   */
  async sendGroupInviteNotification(groupName: string, invitedBy: string): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '👥 New Group Invitation',
          body: `${invitedBy} invited you to join "${groupName}"`,
          data: {
            type: 'invite',
            groupName,
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.DEFAULT,
        },
        trigger: null, // null means send immediately
      });

      console.info(`Sent group invite notification for: ${groupName}`);
    } catch (error) {
      console.error('Error sending group invite notification:', error);
    }
  }

  /**
   * Notify all group members when a new event is created
   * @param eventTitle - Event title
   * @param creatorName - Name of person who created the event
   * @param groupName - Group name
   * @param eventId - Event ID
   */
  async notifyGroupEventCreated(
    eventTitle: string,
    creatorName: string,
    groupName: string,
    eventId: string
  ): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
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

      console.info(`Sent group event notification for: ${eventTitle}`);
    } catch (error) {
      console.error('Error sending group event notification:', error);
    }
  }

  /**
   * Notify all group members when a new todo is created
   * @param todoTitle - Todo title
   * @param creatorName - Name of person who created the todo
   * @param groupName - Group name
   * @param todoId - Todo ID
   */
  async notifyGroupTodoCreated(
    todoTitle: string,
    creatorName: string,
    groupName: string,
    todoId: string
  ): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
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

      console.info(`Sent group todo notification for: ${todoTitle}`);
    } catch (error) {
      console.error('Error sending group todo notification:', error);
    }
  }

  /**
   * Notify existing group members when someone joins
   * @param newMemberName - Name of the person who joined
   * @param groupName - Group name
   */
  async notifyMemberJoined(newMemberName: string, groupName: string): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '👋 New Member Joined',
          body: `${newMemberName} joined "${groupName}"`,
          data: {
            type: 'member-joined',
            groupName,
          },
          sound: false, // Less intrusive
          priority: Notifications.AndroidNotificationPriority.LOW,
        },
        trigger: null,
      });

      console.info(`Sent member joined notification for: ${newMemberName}`);
    } catch (error) {
      console.error('Error sending member joined notification:', error);
    }
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.info(`Cancelled notification: ${notificationId}`);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.info('Cancelled all scheduled notifications');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      console.info(`Found ${notifications.length} scheduled notifications`);
      return notifications;
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Add notification received listener
   * Called when app is in foreground and notification is received
   */
  addNotificationReceivedListener(
    listener: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(listener);
  }

  /**
   * Add notification response listener
   * Called when user taps on notification
   */
  addNotificationResponseListener(
    listener: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  /**
   * Remove notification listener subscription
   */
  removeNotificationSubscription(subscription: Notifications.Subscription): void {
    subscription.remove();
  }
}

export const notificationService = new NotificationService();
export default notificationService;
