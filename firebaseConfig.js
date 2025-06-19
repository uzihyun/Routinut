// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDzwZFbk0nsmksuyIrg98JahefbuhO5l8U",
  authDomain: "routinut.firebaseapp.com",
  projectId: "routinut",
  storageBucket: "routinut.appspot.com", // 반드시 이 값
  messagingSenderId: "147743528679",
  appId: "1:147743528679:web:90d75e9992c3fcc4c23442"
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
