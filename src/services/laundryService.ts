import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Order, OrderStatus, GarmentType } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const laundryService = {
  // --- Orders ---
  async createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) {
    const path = 'orders';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...order,
        status: order.status || OrderStatus.RECEIVED,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    const path = `orders/${orderId}`;
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  subscribeToOrders(callback: (orders: Order[]) => void) {
    const path = 'orders';
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        estimatedDeliveryDate: doc.data().estimatedDeliveryDate?.toDate(),
      })) as Order[];
      callback(orders);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  // --- Garment Types (Configuration) ---
  async getGarmentTypes() {
    const path = 'garmentTypes';
    try {
      const snapshot = await getDocs(collection(db, path));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GarmentType[];
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async seedGarmentTypes() {
    const defaultTypes = [
      { name: 'Shirt', basePrice: 50 },
      { name: 'Pants', basePrice: 60 },
      { name: 'Saree', basePrice: 150 },
      { name: 'Suit', basePrice: 200 },
      { name: 'Bedspread', basePrice: 100 },
    ];

    const current = await this.getGarmentTypes();
    if (current && current.length === 0) {
      for (const type of defaultTypes) {
        await addDoc(collection(db, 'garmentTypes'), type);
      }
    }
  }
};
