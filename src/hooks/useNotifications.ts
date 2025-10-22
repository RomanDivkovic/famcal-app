/**
 * useNotifications Hook
 * Hook for managing push notifications in the app
 */

import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';

export const useNotifications = () => {
  const { user } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

  useEffect(() => {
    if (!user) return;

    // Request permissions and get push token
    const setupNotifications = async () => {
      const hasPermission = await notificationService.requestPermissions();

      if (hasPermission) {
        const token = await notificationService.getExpoPushToken();
        setExpoPushToken(token);

        // TODO: Save token to user's profile in Firebase
        // This allows sending push notifications from server
        console.info('User push token:', token);
      }
    };

    setupNotifications();

    // Listen for notifications while app is in foreground
    notificationListener.current = notificationService.addNotificationReceivedListener(
      (notification) => {
        console.info('Notification received:', notification);
        setNotification(notification);
      }
    );

    // Listen for user tapping on notification
    responseListener.current = notificationService.addNotificationResponseListener((response) => {
      console.info('Notification response:', response);

      const data = response.notification.request.content.data;

      // Handle navigation based on notification type
      if (data.type === 'event' && data.eventId) {
        // TODO: Navigate to event detail screen
        console.info('Navigate to event:', data.eventId);
      } else if (data.type === 'todo' && data.todoId) {
        // TODO: Navigate to todo detail screen
        console.info('Navigate to todo:', data.todoId);
      } else if (data.type === 'invite') {
        // TODO: Navigate to groups screen or show join modal
        console.info('Navigate to groups for invite');
      }
    });

    // Cleanup
    return () => {
      if (notificationListener.current) {
        notificationService.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        notificationService.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [user]);

  return {
    expoPushToken,
    notification,
    scheduleEventNotification:
      notificationService.scheduleEventNotification.bind(notificationService),
    scheduleTodoNotification:
      notificationService.scheduleTodoNotification.bind(notificationService),
    sendGroupInviteNotification:
      notificationService.sendGroupInviteNotification.bind(notificationService),
    notifyGroupEventCreated: notificationService.notifyGroupEventCreated.bind(notificationService),
    notifyGroupTodoCreated: notificationService.notifyGroupTodoCreated.bind(notificationService),
    notifyMemberJoined: notificationService.notifyMemberJoined.bind(notificationService),
    cancelNotification: notificationService.cancelNotification.bind(notificationService),
    cancelAllNotifications: notificationService.cancelAllNotifications.bind(notificationService),
  };
};

export default useNotifications;
