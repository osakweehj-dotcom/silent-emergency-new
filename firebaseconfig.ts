import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyAa9gLm4J1nDF2EXPDpysgYB7Ns6n7AizA",
  authDomain: "silent-emergency-15e0e.firebaseapp.com",
  projectId: "silent-emergency-15e0e",
  storageBucket: "silent-emergency-15e0e.firebasestorage.app",
  messagingSenderId: "905399104026",
  appId: "1:905399104026:web:4625cfb16a78b6ea32d7a3",
  databaseURL: "https://silent-emergency-15e0e-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);

// 🔐 SIMPLE & STABLE AUTH (NO persistence import issues)
export const auth = initializeAuth(app, {});

// ☁️ FIRESTORE
export const db = getFirestore(app);