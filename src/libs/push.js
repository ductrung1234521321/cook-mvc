import { getFirebaseMessaging, isFirebaseEnabled } from './firebase.js';
import { prisma } from './prisma.js';

const INVALID_TOKEN_ERRORS = new Set([
  'messaging/invalid-registration-token',
  'messaging/registration-token-not-registered',
]);

async function cleanBadTokens(tokens) {
  if (!tokens.length) return;
  await prisma.device.deleteMany({
    where: { fcmToken: { in: tokens } },
  });
}

export async function listUserFcmTokens(userId) {
  const records = await prisma.device.findMany({
    where: { userId, fcmToken: { not: null } },
    select: { fcmToken: true },
  });
  return records.map((r) => r.fcmToken).filter(Boolean);
}

export async function sendPushToUser(userId, payload) {
  if (!isFirebaseEnabled()) return { skipped: true, reason: 'firebase_not_configured' };
  const tokens = await listUserFcmTokens(userId);
  return sendPush(tokens, payload);
}

export async function sendPush(tokens, payload) {
  if (!tokens || tokens.length === 0) return { skipped: true, reason: 'no_tokens' };
  const messaging = getFirebaseMessaging();
  if (!messaging) return { skipped: true, reason: 'firebase_not_configured' };

  const multicastPayload = {
    tokens,
    notification: payload.notification,
    data: payload.data,
    android: { priority: 'high' },
    apns: { payload: { aps: { sound: 'default' } } },
  };

  // sendMulticast was removed in newer firebase-admin versions; prefer sendEachForMulticast
  let response;
  if (typeof messaging.sendEachForMulticast === 'function') {
    response = await messaging.sendEachForMulticast(multicastPayload);
  } else if (typeof messaging.sendMulticast === 'function') {
    response = await messaging.sendMulticast(multicastPayload);
  } else {
    // Fallback for unexpected API shapes
    const messages = tokens.map((token) => ({
      token,
      notification: payload.notification,
      data: payload.data,
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default' } } },
    }));
    response = await messaging.sendAll(messages);
  }

  // Remove invalid tokens
  const badTokens = [];
  response.responses.forEach((r, idx) => {
    if (!r.success && INVALID_TOKEN_ERRORS.has(r.error?.code)) {
      badTokens.push(tokens[idx]);
    }
  });
  if (badTokens.length) {
    await cleanBadTokens(badTokens);
  }

  return response;
}
