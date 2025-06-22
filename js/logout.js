// logout.js

// Function to handle user logout
function logout() {
  // Clear user session data (e.g., tokens, user info)
  localStorage.removeItem("authToken");
  localStorage.removeItem("userInfo");

  // Redirect to login page
  window.location.href = "login.html";
}

// Add event listener when DOM is loaded to ensure all elements are available
document.addEventListener('DOMContentLoaded', function() {
  // Find all logout buttons
  const logoutButtons = document.querySelectorAll(".logout-btn");
  
  // Add click event to each logout button
  logoutButtons.forEach(button => {
    button.addEventListener("click", function(e) {
      e.preventDefault();
      logout();
    });
  });
});
