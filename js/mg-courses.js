import { auth, db } from "../js/index.js"; // Import auth and db from index.js
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

let crName = document.querySelector(".cr-name");
let catNameSel = document.querySelector(".cat");
let instSel = document.querySelector(".cat-inst");
let crSeats = document.querySelector(".cr-seats");
let crDesc = document.querySelector(".cr-desc");
let crStartDate = document.querySelector(".cr-start-date");
let crEndDate = document.querySelector(".cr-end-date");

let crViewBtn = document.querySelector(".cr-view");
let crAddBtn = document.querySelector(".cr-add");
let crDeleteBtn = document.querySelector(".cr-delete");
