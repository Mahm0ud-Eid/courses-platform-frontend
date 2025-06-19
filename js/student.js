import { auth, db, validateToken, collection } from "../js/index.js"; // Import auth and db from index.js

import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const userData = JSON.parse(sessionStorage.getItem("userData"));

let stdName = document.querySelector(".std-name");
let stdId = document.querySelector(".std-id");

document.addEventListener("DOMContentLoaded", function () {
  validateToken();
  if (userData) {
    stdName.textContent = userData.name;
    stdId.textContent = userData.id;
  } else {
    console.error("No user data found in sessionStorage.");
  }
});
