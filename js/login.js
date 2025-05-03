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

    // Email Validation
    if (!validateEmail(email)) {
      emailError.textContent = "Invalid email format!";
      isValid = false;
    }

    if (!isValid) return; // Stop if validation fails

    // Send login request to backend
    try {
      let response = await fetch(
        "https://uccd-etmsy.ondigitalocean.app/api/v1/login?email=manager@gmail.com&password=123456789",
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
        alert("Login successful!");

        // Store JWT token in sessionStorage (or HttpOnly cookies if backend supports)
        sessionStorage.setItem("token", data.token);

        // Redirect to dashboard or another page
        window.location.href = "admin.html";
      } else {
        alert(data.message || "Login failed! Please check your credentials.");
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
