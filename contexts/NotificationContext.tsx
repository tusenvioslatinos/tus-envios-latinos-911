import createContextHook from '@nkzw/create-context-hook';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  PUSH_TOKEN: '@push_token',
  NOTIFICATIONS_ENABLED: '@notifications_enabled',
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }) as any,
});

export const [NotificationProvider, useNotifications] = createContextHook(() => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  const loadNotificationSettings = useCallback(async () => {
    try {
      const [storedToken, enabled] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.PUSH_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED),
      ]);

      if (storedToken) {
        setExpoPushToken(storedToken);
        console.log('[Notifications] Token loaded:', storedToken);
      }

      if (enabled !== null) {
        setNotificationsEnabled(enabled === 'true');
        console.log('[Notifications] Settings loaded:', enabled);
      }
    } catch (error) {
      console.error('[Notifications] Error loading settings:', error);
    }
  }, []);

  const registerForPushNotifications = useCallback(async () => {
    if (Platform.OS === 'web') {
      console.log('[Notifications] Web platform, skipping push registration');
      return;
    }

    if (!Device.isDevice) {
      console.log('[Notifications] Not a physical device, skipping push registration');
      return;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('[Notifications] Permission not granted');
        return;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: '34z6c325dcpuojgjmfr7a',
      });

      const token = tokenData.data;
      setExpoPushToken(token);
      await AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKEN, token);
      console.log('[Notifications] Push token obtained:', token);

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return token;
    } catch (error) {
      console.error('[Notifications] Error registering for push notifications:', error);
      return null;
    }
  }, []);

  const handleNotificationResponse = useCallback((response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data;
    console.log('[Notifications] Handling notification with data:', data);
    
    if (data.orderId) {
      console.log('[Notifications] Navigate to order:', data.orderId);
    }
  }, []);

  useEffect(() => {
    loadNotificationSettings();
    registerForPushNotifications();

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('[Notifications] Notification received:', notification);
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('[Notifications] Notification response:', response);
      handleNotificationResponse(response);
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [loadNotificationSettings, registerForPushNotifications, handleNotificationResponse]);

  const sendLocalNotification = useCallback(async (
    title: string, 
    body: string, 
    data?: Record<string, any>
  ) => {
    if (!notificationsEnabled) {
      console.log('[Notifications] Notifications disabled, skipping');
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: null,
      });
      console.log('[Notifications] Local notification sent:', title);
    } catch (error) {
      console.error('[Notifications] Error sending local notification:', error);
    }
  }, [notificationsEnabled]);

  const toggleNotifications = useCallback(async (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED, enabled.toString());
    console.log('[Notifications] Notifications toggled:', enabled);
  }, []);

  const clearNotifications = useCallback(async () => {
    try {
      await Notifications.dismissAllNotificationsAsync();
      console.log('[Notifications] All notifications cleared');
    } catch (error) {
      console.error('[Notifications] Error clearing notifications:', error);
    }
  }, []);

  const getBadgeCount = useCallback(async () => {
    try {
      const count = await Notifications.getBadgeCountAsync();
      return count;
    } catch (error) {
      console.error('[Notifications] Error getting badge count:', error);
      return 0;
    }
  }, []);

  const setBadgeCount = useCallback(async (count: number) => {
    try {
      await Notifications.setBadgeCountAsync(count);
      console.log('[Notifications] Badge count set:', count);
    } catch (error) {
      console.error('[Notifications] Error setting badge count:', error);
    }
  }, []);

  return useMemo(() => ({
    expoPushToken,
    notification,
    notificationsEnabled,
    sendLocalNotification,
    toggleNotifications,
    clearNotifications,
    getBadgeCount,
    setBadgeCount,
    registerForPushNotifications,
  }), [expoPushToken, notification, notificationsEnabled, sendLocalNotification, toggleNotifications, clearNotifications, getBadgeCount, setBadgeCount, registerForPushNotifications]);
});
