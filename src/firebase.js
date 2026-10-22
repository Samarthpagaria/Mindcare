// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCqVKNU29PwzWTzq2KjUjZnx_6RrljylkE",
  authDomain: "psyc-a9a85.firebaseapp.com",
  projectId: "psyc-a9a85",
  storageBucket: "psyc-a9a85.appspot.com", // Corrected storage bucket URL
  messagingSenderId: "611968105649",
  appId: "1:611968105649:web:f0eb195a8bda95dca93690",
  measurementId: "G-3HM3699R53"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the necessary Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
