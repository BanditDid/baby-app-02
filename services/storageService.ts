
import { Memory } from '../types';

const DB_NAME = 'BabyStepsDB';
const DB_VERSION = 1;
const STORE_NAME = 'memories';

// Open Database
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject("IndexedDB error");

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const saveMemoryToDB = async (memory: Memory) => {
  const db = await initDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(memory);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const deleteMemoryFromDB = async (id: string) => {
  const db = await initDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getAllMemoriesFromDB = async (): Promise<Memory[]> => {
  const db = await initDB();
  return new Promise<Memory[]>((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
        const results = request.result as Memory[];
        // Sort by date descending (newest first)
        results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
};

// Migrate data from LocalStorage (Old System) to IndexedDB (New System)
export const migrateFromLocalStorage = async () => {
  const lsData = localStorage.getItem('baby_memories');
  if (lsData) {
    try {
      const memories = JSON.parse(lsData);
      if (Array.isArray(memories) && memories.length > 0) {
        console.log("Migrating data from LocalStorage to IndexedDB...");
        const db = await initDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        for (const memory of memories) {
          store.put(memory);
        }
        
        // Wait for transaction to complete
        await new Promise<void>((resolve, reject) => {
             transaction.oncomplete = () => resolve();
             transaction.onerror = () => reject(transaction.error);
        });

        // Clear local storage only after successful migration
        localStorage.removeItem('baby_memories');
        console.log(`Successfully migrated ${memories.length} memories.`);
      }
    } catch (e) {
      console.error("Migration failed", e);
    }
  }
}
