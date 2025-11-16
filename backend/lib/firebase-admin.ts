import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import * as fs from 'fs';
import * as path from 'path';

let app: App | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;

// Función para cargar las credenciales de Firebase Admin
const loadServiceAccount = () => {
  // Opción 1: Variable de entorno (recomendado para producción)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    } catch (error) {
      console.error('[Firebase Admin] Error parsing FIREBASE_SERVICE_ACCOUNT_KEY:', error);
    }
  }

  // Opción 2: Archivo JSON en la raíz del proyecto (para desarrollo local)
  const possiblePaths = [
    path.join(process.cwd(), 'tus-envios-latinos-c9d53-firebase-adminsdk-fbsvc-a4d6cbcf0c.json'),
    path.join(process.cwd(), 'backend', 'firebase-service-account.json'),
    path.join(process.cwd(), 'firebase-service-account.json'),
  ];

  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(fileContent);
      } catch (error) {
        console.error(`[Firebase Admin] Error reading service account file at ${filePath}:`, error);
      }
    }
  }

  return undefined;
};

// Inicializar Firebase Admin
export const initFirebaseAdmin = () => {
  if (getApps().length === 0) {
    const serviceAccount = loadServiceAccount();

    if (serviceAccount) {
      app = initializeApp({
        credential: cert(serviceAccount),
      });
      console.log('[Firebase Admin] Initialized successfully with service account');
    } else {
      // Si no hay credenciales, intenta usar Application Default Credentials
      // (útil para Cloud Functions, Cloud Run, etc.)
      try {
        app = initializeApp();
        console.log('[Firebase Admin] Initialized successfully with Application Default Credentials');
      } catch (error) {
        console.error('[Firebase Admin] Failed to initialize:', error);
        throw new Error('Firebase Admin initialization failed. Please provide service account credentials.');
      }
    }
  } else {
    app = getApps()[0];
  }

  return app;
};

// Obtener instancia de Firestore
export const getFirestoreAdmin = (): Firestore => {
  if (!app) {
    initFirebaseAdmin();
  }
  if (!db) {
    db = getFirestore(app);
  }
  return db;
};

// Obtener instancia de Auth
export const getAuthAdmin = (): Auth => {
  if (!app) {
    initFirebaseAdmin();
  }
  if (!auth) {
    auth = getAuth(app);
  }
  return auth;
};

// Inicializar al importar
initFirebaseAdmin();


