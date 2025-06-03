// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-analytics.js";
import { getAuth } from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js'
import { getFirestore } from 'https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD8MOanAllTfOHgbsAMW1EhaHNMKIxkH8Q",
  authDomain: "roomvision-893ec.firebaseapp.com",
  databaseURL: "https://roomvision-893ec-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "roomvision-893ec",
  storageBucket: "roomvision-893ec.firebasestorage.app",
  messagingSenderId: "523771012623",
  appId: "1:523771012623:web:1936914c9dba7cb79ae57a",
  measurementId: "G-3ENZQFE6CC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

console.log("Firebase: ", app);
console.log("Firebase Firestore: ", db._initialized);
console.log("Firebase Auth: ", auth._isInitialized);

export { db, auth };