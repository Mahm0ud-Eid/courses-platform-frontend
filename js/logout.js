// logout.js

// Function to handle user logout
function logout() {
  // Clear user session data (e.g., tokens, user info)
  localStorage.removeItem("authToken");
  localStorage.removeItem("userInfo");

  // Redirect to login page
  window.location.href = "/login.html";
}

// Attach logout functionality to a button (if needed)
document.querySelector(".logout-btn").addEventListener("click", logout);
