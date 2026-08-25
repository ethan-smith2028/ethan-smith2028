// ======================================================
// FIREBASE CONFIG
// ======================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// ======================================================
// FIREBASE CONFIGURATION
// Replace these values with your own Firebase project
// ======================================================

const firebaseConfig = {

    apiKey: "AIzaSyDZjXZtfqEscgVBYOYDZS-vRwxBuXuVsbQ",
  authDomain: "email-list-83dfb.firebaseapp.com",
  databaseURL: "https://email-list-83dfb-default-rtdb.firebaseio.com",
  projectId: "email-list-83dfb",
  storageBucket: "email-list-83dfb.firebasestorage.app",
  messagingSenderId: "471452404510",
  appId: "1:471452404510:web:e91752174f6f0000c1570f",
  measurementId: "G-3X5TK2WYBF"

};

// ======================================================
// INITIALIZE FIREBASE
// ======================================================

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

// ======================================================
// EXPORT
// ======================================================

export { db };