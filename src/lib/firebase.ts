import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, indexedDBLocalPersistence, initializeAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
console.log("Initializing Firebase...");
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
console.log("Firebase App initialized:", app.name);

// For Native/Capacitor, we need to explicitly initialize Auth with IndexedDB persistence
// to prevent the "stuck loading" state on restarts.
let auth: Auth;
try {
  console.log("Attempting to get Auth...");
  auth = getAuth(app);
  console.log("Standard Auth retrieved.");
} catch (e) {
  console.log("Initializing Auth with persistence...");
  auth = initializeAuth(app, {
    persistence: indexedDBLocalPersistence
  });
  console.log("Persistence Auth initialized.");
}

const db: Firestore = getFirestore(app);
console.log("Firestore initialized.");

export { app, auth, db };
