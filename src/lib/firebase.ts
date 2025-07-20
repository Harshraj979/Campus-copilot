import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth } from "firebase/auth"; 

const firebaseConfig = {
  apiKey: "AIzaSyBQX42OsYDwec2edsbajw39vjEafFZqFG0",
  authDomain: "campus-copilot-8cd7f.firebaseapp.com",
  projectId: "campus-copilot-8cd7f",
  storageBucket: "campus-copilot-8cd7f.appspot.com",   
  messagingSenderId: "783641049230",
  appId: "1:783641049230:web:51ef616bd117aef843b1df",
  measurementId: "G-G7PNP0YL5H",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app); 

enableIndexedDbPersistence(db).catch((_err) => {});

export { db, auth };
