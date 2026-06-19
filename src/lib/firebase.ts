import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCC5ZuSeaXjQYG7NHf-1lPAzxg_432X8lM",
  authDomain: "xynova.firebaseapp.com",
  projectId: "xynova",
  storageBucket: "xynova.firebasestorage.app",
  messagingSenderId: "604703707929",
  appId: "1:604703707929:web:04fcd57ce7620eb1df6b88",
  measurementId: "G-BWDMR4GTCK"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Analytics only in browser environment
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
