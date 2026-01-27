// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // 我們需要的是資料庫

const firebaseConfig = {
  apiKey: "AIzaSyDiXls2FURRj-j5nyjKfnw72tvVmS1Ad9k",
  authDomain: "fitstack-gym-1cbba.firebaseapp.com",
  projectId: "fitstack-gym-1cbba",
  storageBucket: "fitstack-gym-1cbba.firebasestorage.app",
  messagingSenderId: "267200068168",
  appId: "1:267200068168:web:efdf76d30686cb0f24367d",
  measurementId: "G-PPF0VS5X8K"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 初始化 Firestore 並導出
const db = getFirestore(app);

export { db };