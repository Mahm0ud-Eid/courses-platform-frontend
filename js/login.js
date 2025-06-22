// import { auth, db } from "../js/index.js"; // Import auth and db from index.js
function loadIndexModule() {
  import("../js/index.js")
    .then((module) => {
      module.db; // Access db from index.js
      module.auth; // Access auth from index.js
    })
    .catch((err) => {
      console.error("Failed to load login.js:", err);
    });
}
loadIndexModule();
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

    // Clear previous error messages
    document.getElementById("emailError").textContent = "";
    document.getElementById("passwordError").textContent = "";
    hideLoginError();

    let isValid = true;
    const currentLang = document.documentElement.lang || "en";

    // Email Validation
    if (!validateEmail(email)) {
      document.getElementById("emailError").textContent = translations[currentLang].invalidEmail;
      isValid = false;
    }

    if (!isValid) return; // Stop if validation fails

    // Show loading state on button
    const submitButton = document.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = "Signing in...";

    try {
      await signIn(email, password);
    } finally {
      // Restore button state
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });

async function signIn(email, password) {
  try {
    const auth = getAuth();
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    // console.log("User signed in:", userCredential.user);

    const userId = userCredential.user.uid;
    const db = getFirestore();
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("id", "==", userId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      // console.log("Fetched user data:", userData);
      // Handle userData as needed...
      let role = userData.role.toLowerCase();
      window.location.href = `${role}.html`; // Redirect based on role
      sessionStorage.setItem("token", userCredential.user.accessToken);
      sessionStorage.setItem("userData", JSON.stringify(userData));
    } else {
      console.log("No matching user document found.");
      // Try looking up by email as a fallback
      const emailQuery = query(usersRef, where("email", "==", email));
      const emailQuerySnapshot = await getDocs(emailQuery);
      
      if (!emailQuerySnapshot.empty) {
        // Found by email
        const userData = emailQuerySnapshot.docs[0].data();
        console.log("Fetched user data by email:", userData);
        let role = userData.role.toLowerCase();
        window.location.href = `${role}.html`; // Redirect based on role
        sessionStorage.setItem("token", userCredential.user.accessToken);
      } else {
        // No record found in Firestore
        const currentLang = document.documentElement.lang || "en";
        const errorMessage = translations[currentLang]?.accountNotConfigured || 
                            "Your account exists but is not properly configured in the system. Please contact an administrator.";
        showLoginError(errorMessage);
      }
    }
  } catch (error) {
    console.error("Error signing in:", error);
    
    const currentLang = document.documentElement.lang || "en";
    
    // Display user-friendly error messages
    if (error.code === 'auth/invalid-login-credentials' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      showLoginError(translations[currentLang]?.invalidCredentials || "Invalid email or password. Please try again.");
    } else if (error.code === 'auth/user-disabled') {
      showLoginError(translations[currentLang]?.accountDisabled || "This account has been disabled. Please contact an administrator.");
    } else if (error.code === 'auth/too-many-requests') {
      showLoginError(translations[currentLang]?.tooManyAttempts || "Too many failed login attempts. Please try again later.");
    } else {
      showLoginError(translations[currentLang]?.loginFailed + ": " + error.message || "Login failed: " + error.message);
    }
  }
}

// Function to show login error with animation
function showLoginError(message) {
  const loginError = document.getElementById("loginError");
  loginError.textContent = message;
  loginError.style.display = "block";
  
  // Add visual feedback
  loginError.style.animation = "none";
  setTimeout(() => {
    loginError.style.animation = "fadeIn 0.3s";
  }, 10);
  
  // Scroll to error if needed
  loginError.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// Function to hide login error
function hideLoginError() {
  const loginError = document.getElementById("loginError");
  loginError.style.display = "none";
  loginError.textContent = "";
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
  const languageToggle = document.getElementById("language-toggle");
  if (languageToggle) {
    languageToggle.addEventListener("click", function () {
      setTimeout(function() {
        translateLoginElements();
        // No need for additional adjustments as CSS handles RTL automatically
      }, 100); // Short delay to ensure translations are loaded
    });
  }
      // Add CSS for error animations with RTL support
  const style = document.createElement('style');
  style.textContent = `
    .error {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
    
    #loginError {
      background-color: rgba(220, 53, 69, 0.1);
      color: #dc3545;
      padding: 10px;
      border-radius: 5px;
      border-left: 4px solid #dc3545;
      margin-bottom: 15px;
      text-align: left;
    }
    
    /* RTL support for Arabic */
    html[lang="ar"] #loginError {
      border-left: none;
      border-right: 4px solid #dc3545;
      text-align: right;
      direction: rtl;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
  `;
  document.head.appendChild(style);
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
