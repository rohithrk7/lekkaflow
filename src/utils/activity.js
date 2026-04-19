import { db, collection, addDoc, serverTimestamp, query, where, orderBy, limit, onSnapshot } from './firebase';

/**
 * Log a user activity to Firestore
 * @param {string} userId - The unique ID of the user
 * @param {string} type - The type of activity (e.g., 'INVOICE_CREATED', 'PRODUCT_ADDED')
 * @param {string} description - Human-readable description of the activity
 * @param {object} metadata - Optional additional data
 */
export const logActivity = async (userId, type, description, metadata = {}) => {
  try {
    await addDoc(collection(db, 'users', userId, 'activities'), {
      type,
      description,
      metadata,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

/**
 * Subscribe to recent activities for a user
 * @param {string} userId - The unique ID of the user
 * @param {function} callback - Function to handle the activities list
 */
export const subscribeToActivities = (userId, callback) => {
  const q = query(
    collection(db, 'users', userId, 'activities'),
    orderBy('timestamp', 'desc'),
    limit(20)
  );

  return onSnapshot(q, (snapshot) => {
    const activities = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(activities);
  });
};
