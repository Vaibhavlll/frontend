/**
 * IndexedDB service for HeidelAI application
 * Provides an interface for storing and retrieving data from IndexedDB
 */

/**
 * Define the database configuration
 */
const DB_CONFIG = {
  name: "heidelai_db",
  version: 1,
  stores: {
    integrations: "integrations",
    conversations: "conversations",
    messages: "messages",
  }
};

/**
 * Initialize the IndexedDB database with the specified stores
 */
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);
    
    request.onerror = (event) => {
      reject(`IndexedDB error: ${(event.target as IDBOpenDBRequest).error}`);
    };
    
    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores if they don't exist
      Object.values(DB_CONFIG.stores).forEach(storeName => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName);
        }
      });
    };
  });
};

/**
 * Store data in the specified store with the given key
 * @param storeName - The name of the store to use
 * @param key - The key to store the data under
 * @param data - The data to store
 */
export const storeData = async <T>(
  storeName: keyof typeof DB_CONFIG.stores,
  key: string,
  data: T
): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(DB_CONFIG.stores[storeName], "readwrite");
    const store = transaction.objectStore(DB_CONFIG.stores[storeName]);
    
    return new Promise((resolve, reject) => {
      // IndexedDB can store objects directly, no need to stringify
      const request = store.put(data, key);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      
      // Close the database connection when the transaction is complete
      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error(`Error storing data in ${storeName}:`, error);
    throw error;
  }
};

/**
 * Retrieve data from the specified store with the given key
 * @param storeName - The name of the store to retrieve from
 * @param key - The key to retrieve
 * @returns The data stored under the key, or null if not found
 */
export const getData = async <T>(
  storeName: keyof typeof DB_CONFIG.stores, 
  key: string
): Promise<T | null> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(DB_CONFIG.stores[storeName], "readonly");
    const store = transaction.objectStore(DB_CONFIG.stores[storeName]);
    
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      
      request.onsuccess = () => {
        // If no data found, result is undefined
        const result = request.result;
        resolve(result === undefined ? null : result);
      };
      
      request.onerror = () => reject(request.error);
      
      // Close the database connection when the transaction is complete
      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error(`Error retrieving data from ${storeName}:`, error);
    throw error;
  }
};

/**
 * Delete data from the specified store with the given key
 * @param storeName - The name of the store to delete from
 * @param key - The key to delete
 */
export const deleteData = async (
  storeName: keyof typeof DB_CONFIG.stores, 
  key: string
): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(DB_CONFIG.stores[storeName], "readwrite");
    const store = transaction.objectStore(DB_CONFIG.stores[storeName]);
    
    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      
      // Close the database connection when the transaction is complete
      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error(`Error deleting data from ${storeName}:`, error);
    throw error;
  }
};

/**
 * Get all keys from a specific store
 * @param storeName - The name of the store to get keys from
 * @returns Array of keys in the store
 */
export const getAllKeys = async (
  storeName: keyof typeof DB_CONFIG.stores
): Promise<string[]> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(DB_CONFIG.stores[storeName], "readonly");
    const store = transaction.objectStore(DB_CONFIG.stores[storeName]);
    
    return new Promise((resolve, reject) => {
      const request = store.getAllKeys();
      
      request.onsuccess = () => {
        const keys = request.result as string[];
        resolve(keys);
      };
      
      request.onerror = () => reject(request.error);
      
      // Close the database connection when the transaction is complete
      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error(`Error getting all keys from ${storeName}:`, error);
    throw error;
  }
};

/**
 * Get all data from a specific store
 * @param storeName - The name of the store to get data from
 * @returns Array of all values in the store
 */
export const getAllData = async <T>(
  storeName: keyof typeof DB_CONFIG.stores
): Promise<T[]> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(DB_CONFIG.stores[storeName], "readonly");
    const store = transaction.objectStore(DB_CONFIG.stores[storeName]);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      
      request.onsuccess = () => {
        // Result is already an array of T
        const result = request.result as T[];
        resolve(result);
      };
      
      request.onerror = () => reject(request.error);
      
      // Close the database connection when the transaction is complete
      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error(`Error getting all data from ${storeName}:`, error);
    throw error;
  }
};

/**
 * Clear all data from a specific store
 * @param storeName - The name of the store to clear
 */
export const clearStore = async (
  storeName: keyof typeof DB_CONFIG.stores
): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(DB_CONFIG.stores[storeName], "readwrite");
    const store = transaction.objectStore(DB_CONFIG.stores[storeName]);
    
    return new Promise((resolve, reject) => {
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      
      // Close the database connection when the transaction is complete
      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error(`Error clearing store ${storeName}:`, error);
    throw error;
  }
};

/**
 * Create constant keys for common data items to avoid typos
 */
export const DB_KEYS = {
  INTEGRATIONS: {
    INSTAGRAM: "instagram_connection",
    INSTAGRAM_POSTS: "instagram_posts",
    WHATSAPP: "whatsapp_connection",
    WHATSAPP_DETAILS: "whatsapp_details"
  },
  USER_PREFERENCES: {
    THEME: "theme_preference",
    LANGUAGE: "language_preference"
  }
};