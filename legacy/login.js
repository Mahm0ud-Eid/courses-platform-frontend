document
  .getElementById("loginForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent form submission

    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value.trim();
    let emailError = document.getElementById("emailError");
    let passwordError = document.getElementById("passwordError");

    emailError.textContent = "";
    passwordError.textContent = "";

    let isValid = true;

    const currentLang = document.documentElement.lang || "en";

    // Email Validation
    if (!validateEmail(email)) {
      emailError.textContent = translations[currentLang].invalidEmail;
      isValid = false;
    }

    if (!isValid) return; // Stop if validation fails

    // Send login request to backend
    try {
      let response = await fetch(
        "https://uccd-ljoxz.ondigitalocean.app/api/v1/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      let data = await response.json();

      if (response.ok) {
        console.log(data.data);
        sessionStorage.setItem("token", data.data.Token);
        alert("Login successful!"); // Store JWT token in sessionStorage (or HttpOnly cookies if backend supports)

        // Redirect to dashboard or another page
        if (data.data.Role === "manager") {
          window.location.href = "admin.html";
        }
      } else {
        const currentLang = document.documentElement.lang || "en";
        alert(data.message || translations[currentLang].loginFailed);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong! Please try again later.");
    }
  });

// Email Validation Function
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

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
