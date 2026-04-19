import { initializeApp } from "firebase/app";
import * as realAuth from "firebase/auth";
import * as realFirestore from "firebase/firestore";
import * as mock from './mockFirebase';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const isMock = !firebaseConfig.apiKey || firebaseConfig.apiKey === 'your_api_key';

let auth, db, googleProvider;
let onAuthStateChanged, signInWithPopup, signOut;
let createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail;
let doc, getDoc, setDoc, addDoc, collection, query, orderBy, limit, onSnapshot, where, getDocs, deleteDoc, serverTimestamp;

if (isMock) {
  console.warn("⚠️ LekkaFlow is running in DEMO MODE with mock Firebase.");
  auth = mock.auth;
  db = mock.db;
  googleProvider = mock.googleProvider;
  
  // Auth
  onAuthStateChanged = mock.auth.onAuthStateChanged;
  signInWithPopup = mock.auth.signInWithPopup;
  signOut = mock.auth.signOut;
  createUserWithEmailAndPassword = mock.auth.createUserWithEmailAndPassword;
  signInWithEmailAndPassword = mock.auth.signInWithEmailAndPassword;
  sendPasswordResetEmail = mock.auth.sendPasswordResetEmail;

  // Firestore
  doc = mock.doc;
  getDoc = mock.getDoc;
  setDoc = mock.setDoc;
  addDoc = mock.addDoc;
  collection = mock.collection;
  query = mock.query;
  orderBy = mock.orderBy;
  limit = mock.limit;
  onSnapshot = mock.onSnapshot;
  where = mock.where;
  getDocs = mock.getDocs;
  deleteDoc = mock.deleteDoc;
  serverTimestamp = mock.serverTimestamp;
} else {
  const app = initializeApp(firebaseConfig);
  auth = realAuth.getAuth(app);
  db = realFirestore.getFirestore(app);
  googleProvider = new realAuth.GoogleAuthProvider();

  // Auth Functions
  onAuthStateChanged = realAuth.onAuthStateChanged;
  signInWithPopup = realAuth.signInWithPopup;
  signOut = realAuth.signOut;
  createUserWithEmailAndPassword = realAuth.createUserWithEmailAndPassword;
  signInWithEmailAndPassword = realAuth.signInWithEmailAndPassword;
  sendPasswordResetEmail = realAuth.sendPasswordResetEmail;

  // Firestore Functions
  doc = realFirestore.doc;
  getDoc = realFirestore.getDoc;
  setDoc = realFirestore.setDoc;
  addDoc = realFirestore.addDoc;
  collection = realFirestore.collection;
  query = realFirestore.query;
  orderBy = realFirestore.orderBy;
  limit = realFirestore.limit;
  onSnapshot = realFirestore.onSnapshot;
  where = realFirestore.where;
  getDocs = realFirestore.getDocs;
  deleteDoc = realFirestore.deleteDoc;
  serverTimestamp = realFirestore.serverTimestamp;
}

export { 
  auth, db, googleProvider, 
  onAuthStateChanged, signInWithPopup, signOut,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail,
  doc, getDoc, setDoc, addDoc, collection, query, orderBy, limit, onSnapshot, where, getDocs, deleteDoc, serverTimestamp
};
