import { auth, db } from "../js/index.js"; // Import auth and db from index.js
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import {
  collection,
  getFirestore,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

document
  .getElementById("loginForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent form submission

    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value.trim();

    let isValid = true;
    const currentLang = document.documentElement.lang || "en";

    // Email Validation
    if (!validateEmail(email)) {
      emailError.textContent = translations[currentLang].invalidEmail;
      isValid = false;
    }

    if (!isValid) return; // Stop if validation fails

    await signIn(email, password);
  });

async function signIn(email, password) {
  try {
    const auth = getAuth();
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log("User signed in:", userCredential.user);

    const userId = userCredential.user.uid;
    const db = getFirestore();
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("id", "==", userId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      console.log("Fetched user data:", userData);
      // Handle userData as needed...
      let role = userData.role.toLowerCase();
      window.location.href = `${role}.html`; // Redirect based on role
      sessionStorage.setItem("token", userCredential.user.accessToken);
    } else {
      console.log("No matching user document found.");
    }
  } catch (error) {
    console.error("Error signing in:", error);
  }
}

// Email Validation Function
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// // onAuthStateChanged(auth, (user) => {
// //   if (user) {
// //     // User is signed in, you can access user information here
// //     console.log("Useris signed in:", user);
// //   } else {
// //     // User is signed out
// //     console.log("No user is signed in.");
// //   }
// // });

// Translations for login page
document.addEventListener("DOMContentLoaded", function () {
  // Apply translations to login page elements
  translateLoginElements();

  // Re-translate when language changes
  document
    .getElementById("language-toggle")
    .addEventListener("click", function () {
      setTimeout(translateLoginElements, 100); // Short delay to ensure translations are loaded
    });
});

// Function to translate login page elements
function translateLoginElements() {
  const currentLang = document.documentElement.lang || "en";

  if (!translations || !translations[currentLang]) return;

  // Translate login title
  const loginTitle = document.querySelector(".divider p");
  if (loginTitle) loginTitle.textContent = translations[currentLang].loginTitle;

  // Translate email label and placeholder
  const emailLabel = document.querySelector('label[for="email"]');
  if (emailLabel)
    emailLabel.textContent = translations[currentLang].emailAddress;

  const emailInput = document.getElementById("email");
  if (emailInput)
    emailInput.placeholder = translations[currentLang].emailPlaceholder;

  // Translate password label and placeholder
  const passwordLabel = document.querySelector('label[for="password"]');
  if (passwordLabel)
    passwordLabel.textContent = translations[currentLang].password;

  const passwordInput = document.getElementById("password");
  if (passwordInput)
    passwordInput.placeholder = translations[currentLang].passwordPlaceholder;

  // Translate remember me checkbox
  const rememberLabel = document.querySelector('label[for="remember"]');
  if (rememberLabel)
    rememberLabel.textContent = translations[currentLang].rememberMe;

  // Translate sign in button
  const signInButton = document.querySelector('button[type="submit"]');
  if (signInButton) signInButton.textContent = translations[currentLang].signIn;
}
