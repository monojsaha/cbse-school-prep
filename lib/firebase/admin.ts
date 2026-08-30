import { getApps, initializeApp, cert, App, ServiceAccount } from "firebase-admin/app";
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore";
import { getAuth as getAdminAuth } from "firebase-admin/auth";

let adminApp: App;

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountJson) throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY env var is not set");

  const serviceAccount = JSON.parse(serviceAccountJson) as ServiceAccount;

  adminApp = initializeApp({ credential: cert(serviceAccount) });
  return adminApp;
}

export const adminDb   = getAdminFirestore(getAdminApp());
export const adminAuth = getAdminAuth(getAdminApp());
