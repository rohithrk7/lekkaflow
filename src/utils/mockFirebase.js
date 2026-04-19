let mockUser = null;
let listeners = [];

export const auth = {
  get currentUser() { return mockUser; },
  onAuthStateChanged: (auth, callback) => {
    listeners.push(callback);
    callback(mockUser);
    return () => {
      listeners = listeners.filter(l => l !== callback);
    };
  },
  signInWithPopup: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockUser = { uid: 'demo-user-123', email: 'demo@lekkaflow.com', displayName: 'Demo Shop' };
        listeners.forEach(l => l(mockUser));
        resolve({ user: mockUser });
      }, 800);
    });
  },
  signOut: () => {
    mockUser = null;
    listeners.forEach(l => l(null));
    window.location.reload();
    return Promise.resolve();
  },
  createUserWithEmailAndPassword: (auth, email, password) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockUser = { uid: 'mock-user-' + Date.now(), email, displayName: email.split('@')[0] };
        listeners.forEach(l => l(mockUser));
        resolve({ user: mockUser });
      }, 800);
    });
  },
  signInWithEmailAndPassword: (auth, email, password) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockUser = { uid: 'mock-user-123', email, displayName: email.split('@')[0] };
        listeners.forEach(l => l(mockUser));
        resolve({ user: mockUser });
      }, 800);
    });
  },
  sendPasswordResetEmail: (auth, email) => {
    console.log('Mock Password Reset Email sent to:', email);
    return Promise.resolve();
  }
};

export const googleProvider = {};

// Mock Firestore
const mockStore = {
  'products': {
    '123456': { name: 'Amul Milk 500ml', price: 32, taxPct: 5 },
    '789012': { name: 'Tata Salt 1kg', price: 28, taxPct: 0 },
    '556677': { name: 'Maggi Noodles', price: 14, taxPct: 12 }
  }
};

export const db = {};

export const getDoc = (docRef) => {
  const path = docRef.path;
  return Promise.resolve({
    exists: () => !!mockStore[path] || (path.startsWith('users/') && !!mockStore[path]),
    data: () => mockStore[path] || mockStore.products[path.split('/').pop()]
  });
};

export const setDoc = (docRef, data) => {
  console.log('Mock SetDoc:', docRef.path, data);
  mockStore[docRef.path] = data;
  return Promise.resolve();
};

export const addDoc = (colRef, data) => {
  console.log('Mock AddDoc:', colRef.path, data);
  return Promise.resolve({ id: 'mock-bill-' + Date.now() });
};

export const collection = (db, ...paths) => ({ path: paths.join('/') });
export const doc = (db, ...paths) => ({ path: paths.join('/') });

export const onSnapshot = (q, callback) => {
  const products = Object.entries(mockStore.products).map(([id, data]) => ({ id, ...data }));
  callback({ docs: products.map(p => ({ id: p.id, data: () => p })) });
  return () => {};
};

export const query = (q, ...args) => q;
export const orderBy = () => {};
export const limit = () => {};
export const where = () => {};
export const getDocs = () => Promise.resolve({ docs: [] });
export const deleteDoc = (docRef) => {
  console.log('Mock DeleteDoc:', docRef.path);
  return Promise.resolve();
};
export const serverTimestamp = () => ({
  toDate: () => new Date(),
  seconds: Math.floor(Date.now() / 1000),
  nanoseconds: 0
});
