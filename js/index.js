// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCaUETFsFnRgSmNFIwEgyGWugfrK9zHbM0",
  authDomain: "uccd-f607e.firebaseapp.com",
  projectId: "uccd-f607e",
  storageBucket: "uccd-f607e.firebasestorage.app",
  messagingSenderId: "1037776187244",
  appId: "1:1037776187244:web:7d02b5edc4908dad390d49",
  measurementId: "G-B95Y1W5QWP",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const users = collection(db, "users");

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, you can access user information here
    // console.log("User is signed in:", user);
  } else {
    // User is signed out
    console.log("No user is signed in.");
  }
});
function validateToken() {
  const token = sessionStorage.getItem("token");

  if (!token) {
    Swal.fire({
      title: "No token found",
      text: "Please log in.",
      icon: "warning",
      showCloseButton: true,
    }).then(() => {
      window.location.href = "/login.html";
    });
    return null;
  }

  // If token is not a JWT, skip decoding logic
  if (!token.includes(".")) {
    console.log("Token is not a JWT. Skipping verification");
    return token;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const isExpired = payload.exp * 1000 < Date.now();

    if (isExpired) {
      Swal.fire({
        title: "Session Expired",
        text: "Your session has expired. Please log in again.",
        icon: "warning",
        showCloseButton: true,
      }).then(() => {
        window.location.href = "/login.html";
      });
      return null;
    }
  } catch (error) {
    console.error("Invalid token format:", error);
    Swal.fire({
      title: "Invalid token format",
      text: "Please log in again.",
      icon: "error",
      showCloseButton: true,
    }).then(() => {
      window.location.href = "/login.html";
    });
    return null;
  }

  console.log("Token is valid and not expired.");
  return token;
}

export { auth, db, app, validateToken, collection };
