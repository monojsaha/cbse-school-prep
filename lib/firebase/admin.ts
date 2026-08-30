import { getApps, initializeApp, cert, type App, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

let _app: App | null = null;

function getAdminApp(): App {
  if (_app) return _app;
  const existing = getApps();
  if (existing.length > 0) {
    _app = existing[0];
    return _app;
  }
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!key) throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not set");
  _app = initializeApp({ credential: cert(JSON.parse(key) as ServiceAccount) });
  return _app;
}

// Lazy proxies — Firebase Admin is NOT initialized at import time,
// only on first actual property access. This lets Next.js import the
// module during build-time config collection without a real service account.
export const adminDb = new Proxy({} as ReturnType<typeof getFirestore>, {
  get: (_, prop: string) => {
    const db = getFirestore(getAdminApp());
    const val = (db as unknown as Record<string, unknown>)[prop];
    return typeof val === "function" ? (val as Function).bind(db) : val;
  },
});

export const adminAuth = new Proxy({} as ReturnType<typeof getAuth>, {
  get: (_, prop: string) => {
    const auth = getAuth(getAdminApp());
    const val = (auth as unknown as Record<string, unknown>)[prop];
    return typeof val === "function" ? (val as Function).bind(auth) : val;
  },
});
