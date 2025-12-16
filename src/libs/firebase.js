import admin from 'firebase-admin';
import env from '../config/env.js';

let firebaseApp = null;
let firebaseAuth = null;
let firebaseMessaging = null;

function hasCredentials() {
  return Boolean(env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY);
}

export function initFirebase() {
  if (firebaseApp || !hasCredentials()) return { firebaseAuth, firebaseMessaging };

  // Private key from env often contains literal \n, convert to real newlines
  const privateKey = env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });

  firebaseAuth = admin.auth(firebaseApp);
  firebaseMessaging = admin.messaging(firebaseApp);
  console.log('[Firebase] admin initialized');
  return { firebaseAuth, firebaseMessaging };
}

export function getFirebaseAuth() {
  if (!firebaseAuth) initFirebase();
  return firebaseAuth;
}

export function getFirebaseMessaging() {
  if (!firebaseMessaging) initFirebase();
  return firebaseMessaging;
}

export function isFirebaseEnabled() {
  return hasCredentials();
}
