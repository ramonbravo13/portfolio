// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyApcgnqqBFT7q2LYuPTjrjov3cNuKQIUck",
  authDomain: "portfolio-juan-a3743.firebaseapp.com",
  projectId: "portfolio-juan-a3743",
  storageBucket: "portfolio-juan-a3743.firebasestorage.app",
  messagingSenderId: "224375135743",
  appId: "1:224375135743:web:5e62eed09154a268341bca",
  measurementId: "G-XBGK2J452N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
