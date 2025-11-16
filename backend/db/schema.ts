import { getFirestoreAdmin } from '../lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export interface Admin {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  // Nota: La contraseña no se almacena aquí, se maneja con Firebase Auth
}

export interface OrderDB {
  id: string;
  type: string;
  recipientData: string;
  amount: number;
  currency: string;
  senderName: string;
  senderPhone?: string;
  senderEmail?: string;
  senderCountry: string;
  details?: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

const firestoreDb = getFirestoreAdmin();

// Helper para convertir Firestore Timestamp a string ISO
const toISOString = (value: any): string => {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return value;
};

// Helper para convertir documentos de Firestore a objetos planos
const docToObject = <T>(doc: any): T => {
  const data = doc.data();
  if (!data) return data;
  
  // Convertir Timestamps a strings ISO
  const converted: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Timestamp) {
      converted[key] = value.toDate().toISOString();
    } else {
      converted[key] = value;
    }
  }
  return { ...converted, id: doc.id } as T;
};

export const dbService = {
  admins: {
    async findByEmail(email: string): Promise<Admin | undefined> {
      const snapshot = await firestoreDb.collection('admins')
        .where('email', '==', email)
        .limit(1)
        .get();
      
      if (snapshot.empty) return undefined;
      
      return docToObject<Admin>(snapshot.docs[0]);
    },
    async findById(id: string): Promise<Admin | undefined> {
      const doc = await firestoreDb.collection('admins').doc(id).get();
      if (!doc.exists) return undefined;
      return docToObject<Admin>(doc);
    },
    async create(admin: Omit<Admin, 'id'>): Promise<Admin> {
      const docRef = firestoreDb.collection('admins').doc();
      const adminData = {
        ...admin,
        createdAt: Timestamp.now(),
      };
      await docRef.set(adminData);
      return docToObject<Admin>(await docRef.get());
    },
    async getAll(): Promise<Admin[]> {
      const snapshot = await firestoreDb.collection('admins').orderBy('createdAt', 'desc').get();
      return snapshot.docs.map(doc => docToObject<Admin>(doc));
    }
  },
  orders: {
    async create(order: Omit<OrderDB, 'id'> | OrderDB): Promise<OrderDB> {
      // Si el order tiene un id, usarlo; si no, dejar que Firestore genere uno
      const orderId = 'id' in order ? order.id : undefined;
      const { id: _, ...orderData } = order as any;
      
      // Filtrar valores undefined para evitar errores de Firestore
      const cleanOrderData: any = {};
      for (const [key, value] of Object.entries(orderData)) {
        if (value !== undefined) {
          cleanOrderData[key] = value;
        }
      }
      
      const docRef = orderId 
        ? firestoreDb.collection('orders').doc(orderId)
        : firestoreDb.collection('orders').doc();
      
      const firestoreData = {
        ...cleanOrderData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      await docRef.set(firestoreData);
      const created = await docRef.get();
      console.log('[DB] Order saved. Order ID:', created.id);
      console.log('[DB] Order details:', { id: created.id, type: cleanOrderData.type, status: cleanOrderData.status });
      return docToObject<OrderDB>(created);
    },
    async findById(id: string): Promise<OrderDB | undefined> {
      const doc = await firestoreDb.collection('orders').doc(id).get();
      if (!doc.exists) return undefined;
      return docToObject<OrderDB>(doc);
    },
    async getAll(): Promise<OrderDB[]> {
      const snapshot = await firestoreDb.collection('orders').orderBy('createdAt', 'desc').get();
      const orders = snapshot.docs.map(doc => docToObject<OrderDB>(doc));
      console.log('[DB] Returning all orders. Count:', orders.length);
      return orders;
    },
    async update(id: string, updates: Partial<OrderDB>): Promise<OrderDB | null> {
      const docRef = firestoreDb.collection('orders').doc(id);
      const doc = await docRef.get();
      
      if (!doc.exists) return null;
      
      // Filtrar valores undefined para evitar errores de Firestore
      const cleanUpdates: any = {};
      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined) {
          cleanUpdates[key] = value;
        }
      }
      
      const updateData = {
        ...cleanUpdates,
        updatedAt: Timestamp.now(),
      };
      
      await docRef.update(updateData);
      const updated = await docRef.get();
      return docToObject<OrderDB>(updated);
    },
    async delete(id: string): Promise<boolean> {
      const docRef = firestoreDb.collection('orders').doc(id);
      const doc = await docRef.get();
      
      if (!doc.exists) return false;
      
      await docRef.delete();
      return true;
    }
  }
};

// Mantener compatibilidad con el código existente
export const db = dbService;
