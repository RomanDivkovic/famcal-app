/**
 * Notification Service
 * Handles push notifications for events, todos, and group invites
 * Supports both local notifications and FCM push notifications
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { ref, set, get } from 'firebase/database';
import { database, auth } from './firebaseConfig';

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
  type: 'event' | 'todo' | 'invite' | 'member-joined';
  id?: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export interface NotificationSettings {
  enabled: boolean;
  events: boolean;
  todos: boolean;
  groupInvites: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  events: true,
  todos: true,
  groupInvites: true,
  soundEnabled: true,
  vibrationEnabled: true,
};

class NotificationService {
  private notificationListener?: Notifications.Subscription;
  private responseListener?: Notifications.Subscription;

  /**
   * Initialize notification service
   * - Request permissions
   * - Register FCM token
   * - Setup notification listeners
   */
  async initialize(): Promise<void> {
    try {
      console.info('[NotificationService] Initializing...');

      // Request permissions and setup channels
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn('[NotificationService] Notification permissions not granted');
        return;
      }

      // Register FCM token for push notifications
      await this.registerForPushNotifications();

      // Setup notification listeners
      this.setupNotificationListeners();

      console.info('[NotificationService] Initialization complete');
    } catch (error) {
      console.error('[NotificationService] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Setup notification listeners
   * - Listen for incoming notifications (foreground)
   * - Listen for user interactions with notifications
   */
  private setupNotificationListeners(): void {
    // Handle notifications received while app is in foreground
    this.notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      console.info('[NotificationService] Notification received:', notification);
    });

    // Handle user interaction with notifications
    this.responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.info('[NotificationService] Notification response:', response);
      const data = response.notification.request.content.data;
      this.handleNotificationAction(data);
    });
  }

  /**
   * Handle notification actions (for deep linking)
   * @param data Notification data payload
   */
  private handleNotificationAction(data: Record<string, unknown>): void {
    console.info('[NotificationService] Handle action:', data);
    // Deep linking navigation will be implemented here
    // Example: navigation.navigate('EventDetail', { eventId: data.eventId });
  }

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
   * Register device for push notifications
   * - Get Expo push token
   * - Store in Firebase under user's FCM token
   */
  async registerForPushNotifications(): Promise<string | null> {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.warn('[NotificationService] No authenticated user');
        return null;
      }

      if (!Device.isDevice) {
        console.info('[NotificationService] Push tokens only work on physical devices');
        return null;
      }

      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId || 'd2b85b83-45b9-4e6a-bcc1-6736fc9d83fe';

      // Get Expo push token (works with development builds)
      const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
      const token = tokenData.data;

      console.info('[NotificationService] Expo Push Token:', token);

      // Store token in Firebase
      const tokenRef = ref(database, `users/${user.uid}/fcmToken`);
      await set(tokenRef, token);

      console.info('[NotificationService] Token registered successfully');
      return token;
    } catch (error) {
      console.error('[NotificationService] Failed to register for push notifications:', error);
      return null;
    }
  }

  /**
   * Get Expo push token for this device (legacy method)
   */
  async getExpoPushToken(): Promise<string | null> {
    return this.registerForPushNotifications();
  }

  /**
   * Get FCM token for a specific user
   * @param userId User ID
   * @returns FCM token or null
   */
  async getUserToken(userId: string): Promise<string | null> {
    try {
      const tokenRef = ref(database, `users/${userId}/fcmToken`);
      const snapshot = await get(tokenRef);

      if (!snapshot.exists()) {
        return null;
      }

      return snapshot.val();
    } catch (error) {
      console.error('[NotificationService] Error getting user token:', error);
      return null;
    }
  }

  /**
   * Get FCM tokens for multiple users
   * @param userIds Array of user IDs
   * @returns Array of tokens (excluding null values)
   */
  async getUserTokens(userIds: string[]): Promise<string[]> {
    try {
      const tokenPromises = userIds.map((userId) => this.getUserToken(userId));
      const tokens = await Promise.all(tokenPromises);

      // Filter out null values
      return tokens.filter((token): token is string => token !== null);
    } catch (error) {
      console.error('[NotificationService] Error getting user tokens:', error);
      return [];
    }
  }

  /**
   * Get notification settings for current user
   */
  async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return DEFAULT_NOTIFICATION_SETTINGS;
      }

      const settingsRef = ref(database, `users/${user.uid}/notificationSettings`);
      const snapshot = await get(settingsRef);

      if (!snapshot.exists()) {
        return DEFAULT_NOTIFICATION_SETTINGS;
      }

      return { ...DEFAULT_NOTIFICATION_SETTINGS, ...snapshot.val() };
    } catch (error) {
      console.error('[NotificationService] Error getting settings:', error);
      return DEFAULT_NOTIFICATION_SETTINGS;
    }
  }

  /**
   * Update notification settings for current user
   */
  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user');
      }

      const settingsRef = ref(database, `users/${user.uid}/notificationSettings`);
      const currentSettings = await this.getNotificationSettings();
      const newSettings = { ...currentSettings, ...settings };

      await set(settingsRef, newSettings);
      console.info('[NotificationService] Settings updated:', newSettings);
    } catch (error) {
      console.error('[NotificationService] Error updating settings:', error);
      throw error;
    }
  }

  /**
   * Cleanup listeners on app unmount
   */
  cleanup(): void {
    if (this.notificationListener) {
      this.notificationListener.remove();
    }
    if (this.responseListener) {
      this.responseListener.remove();
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
