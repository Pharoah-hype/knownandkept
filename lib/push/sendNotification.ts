import webpush from './vapid';

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
}

export async function sendNotification(
  subscription: PushSubscription,
  payload: NotificationPayload
): Promise<boolean> {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return true;
  } catch (error: any) {
    if (error?.statusCode === 410) {
      console.error('Push subscription expired:', subscription.endpoint);
      return false;
    }
    console.error('Failed to send push notification:', error);
    throw error;
  }
}
