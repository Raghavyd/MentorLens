import { initializeApp } from "firebase/app";
import { signInWithPopup, signOut } from "firebase/auth";


import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  
  User,
  UserCredential,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  
  onAuthStateChanged
} from "firebase/auth";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDaKwaf-X3Bk3CE6P13FZ7_szcr49e75w8",
  authDomain: "mentorlens-799c2.firebaseapp.com",
  projectId: "mentorlens-799c2",
  storageBucket: "mentorlens-799c2.firebasestorage.app",
  messagingSenderId: "803118054122",
  measurementId: "G-5NTB8ZTPN4"};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Start Google sign-in redirect



// Handle redirect result
export const handleRedirectResult = async (): Promise<UserCredential | null> => {
  try {
    const result = await getRedirectResult(auth);
    return result;
  } catch (error) {
    console.error("Firebase redirect error:", error);
    return null;
  }
};



// Google sign-in
export const signInWithGoogle = async () => {
  await signInWithPopup(auth, googleProvider);
};

// Email/password login
export const loginWithEmail = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

// Email/password registration
export const registerWithEmail = async (email: string, password: string) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

// Logout
export const logout = async () => {
  await signOut(auth);
};

// Optional: listen for auth state changes
export const onAuthStateChange = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, callback);
};

export { auth, googleProvider };
