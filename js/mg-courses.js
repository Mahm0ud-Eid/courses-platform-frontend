import {
  db,
  validateToken,
  dir,
  instDetails,
  cDetails,
  stdDetails,
  dash,
} from "../js/manager.js"; // Import db and other necessary variables
import {
  collection,
  getFirestore,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  doc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

let addCr = document.querySelector(".add-cr");

let crName = document.querySelector(".cr-name");
let catNameSel = document.querySelector(".cat");
let instSel = document.querySelector(".cr-inst");
let crSeats = document.querySelector(".cr-seats");
let crDesc = document.querySelector(".cr-desc");
let crStartDate, crEndDate, intrStartDate, intrEndDate;

let crMgBtn = document.querySelector(".cr-mg-btn");
let crViewBtn = document.querySelector(".cr-view");
let crAddBtn = document.querySelector(".cr-add");
let crDeleteBtn = document.querySelector(".cr-delete");

const coursesRef = collection(db, "courses");

document.addEventListener("DOMContentLoaded", function () {
  validateToken();
});

addCr.style.display = "none";

crMgBtn.addEventListener("click", function () {
  dir.innerHTML = "Manage Courses";
  dash.style.display = "none";
  stdDetails.style.display = "none";
  cDetails.style.display = "none";
  addCr.style.display = "block";
});
