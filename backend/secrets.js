// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCqVKNU29PwzWTzq2KjUjZnx_6RrljylkE",
  authDomain: "psyc-a9a85.firebaseapp.com",
  projectId: "psyc-a9a85",
  storageBucket: "psyc-a9a85.firebasestorage.app",
  messagingSenderId: "611968105649",
  appId: "1:611968105649:web:f0eb195a8bda95dca93690",
  measurementId: "G-3HM3699R53"
};

// Initialize Firebase
const secret = initializeApp(firebaseConfig);
const analytics = getAnalytics(secret);

// Initialize and export Firebase services
export const auth = getAuth(secret);
export const db = getFirestore(secret);