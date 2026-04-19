import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider, db, onAuthStateChanged, signInWithPopup, signOut, doc, getDoc, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from '../utils/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
  const loginWithEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const signupWithEmail = (email, password) => createUserWithEmailAndPassword(auth, email, password);
  const forgotPassword = (email) => sendPasswordResetEmail(auth, email);
  const logout = () => signOut(auth);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const profileDoc = await getDoc(doc(db, 'users', currentUser.uid, 'profile', 'data'));
        if (profileDoc.exists()) {
          setProfile(profileDoc.data());
        } else {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    profile,
    loading,
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    forgotPassword,
    logout,
    setProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
