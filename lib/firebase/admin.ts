import { getApps, initializeApp, cert, App } from "firebase-admin/app";
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore";
import { getAuth as getAdminAuth } from "firebase-admin/auth";

let adminApp: App;

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];

  adminApp = initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
      privateKey:  process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }),
  });
  return adminApp;
}

export const adminDb   = getAdminFirestore(getAdminApp());
export const adminAuth = getAdminAuth(getAdminApp());
