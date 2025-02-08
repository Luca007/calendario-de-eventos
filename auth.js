import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCVe3vXKaq7SWkgWIJUZ2hzhmn0BnWJQ7Y",
    authDomain: "calendario-de-eventos-fa152.firebaseapp.com",
    projectId: "calendario-de-eventos-fa152",
    storageBucket: "calendario-de-eventos-fa152.firebasestorage.app",
    messagingSenderId: "142777201479",
    appId: "1:142777201479:web:93133ae189008634951262"
};

const app = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);
export const db = getFirestore(app);
