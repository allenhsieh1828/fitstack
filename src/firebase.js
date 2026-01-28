import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// 如果您需要分析功能，可以保留這行，否則可以刪除
import { getAnalytics } from "firebase/analytics";

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
const analytics = getAnalytics(app);

// 核心：初始化並導出 Firestore 資料庫
export const db = getFirestore(app);