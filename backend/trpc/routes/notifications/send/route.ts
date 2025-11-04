import { z } from 'zod';
import { publicProcedure } from '../../../create-context';

const sendNotificationSchema = z.object({
  expoPushToken: z.string(),
  title: z.string(),
  body: z.string(),
  data: z.record(z.string(), z.any()).optional(),
});

export const sendNotificationProcedure = publicProcedure
  .input(sendNotificationSchema)
  .mutation(async ({ input }) => {
    const { expoPushToken, title, body, data } = input;

    try {
      const message = {
        to: expoPushToken,
        sound: 'default',
        title,
        body,
        data,
      };

      console.log('[Notifications] Sending push notification:', message);

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();
      console.log('[Notifications] Push notification sent:', result);

      return { success: true, result };
    } catch (error) {
      console.error('[Notifications] Error sending push notification:', error);
      throw new Error('Failed to send push notification');
    }
  });
