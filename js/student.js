import { auth, db, validateToken, collection } from "../js/index.js"; // Import auth and db from index.js

import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// ...existing code...
const userData = JSON.parse(sessionStorage.getItem("userData"));

document.addEventListener("DOMContentLoaded", function () {
  validateToken();
});
