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
  Timestamp,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

let addCr = document.querySelector(".add-cr");

let crName = document.querySelector(".cr-name");
let catNameSel = document.querySelector(".cat");
let instSel = document.querySelector(".cr-inst");
let crSeats = document.querySelector(".cr-seats");
let crDesc = document.querySelector(".cr-desc");
let crDates = document.querySelector(".cr-dates");
let intrDates = document.querySelector(".intr-dates");
let crStartDate, crEndDate, intrStartDate, intrEndDate;

let crMgBtn = document.querySelector(".cr-mg-btn");
let crViewBtn = document.querySelector(".cr-view");
let crSaveBtn = document.querySelector(".cr-save");
let crDelBtn = document.querySelector(".cr-del");

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

crViewBtn.addEventListener("click", async function () {
  dir.innerHTML = "View Courses";

  const cSnap = await getDocs(
    query(coursesRef, where("title", "==", crName.value))
  );

  if (!cSnap.empty) {
    const crData = cSnap.docs[0].data();
    console.log("Fetched Course data:", crData);
    Swal.fire({
      title: "Course Found",
      text: "Fill the fields to update it",
      icon: "success",
      showCloseButton: true,
    });
    crSaveBtn.innerHTML = "Update Course";

    crName.value = crData.title;
    catNameSel.value = crData.category;
    instSel.value = crData.instructor;
    crSeats.value = crData.maxAcceptedStudents;
    crDesc.value = crData.description;
    // Combine and convert courseStartDate and courseEndDate to "MM-DD-YYYY - MM-DD-YYYY"
    const crStart = formatDate(crData.courseStartDate);
    const crEnd = formatDate(crData.courseEndDate);
    const intrStart = formatDate(crData.interviewStartDate);
    const intrEnd = formatDate(crData.interviewEndDate);

    crDates.value = crStart && crEnd ? `${crStart} - ${crEnd}` : "";
    intrDates.value = intrStart && intrEnd ? `${intrStart} - ${intrEnd}` : "";
  } else {
    Swal.fire({
      title: "Course Not Found",
      text: "Fill the fields to create it",
      icon: "info",
      showCloseButton: true,
    });
    crSaveBtn.innerHTML = "Create Course";
    crName.value = "";
    catNameSel.value = "";
    instSel.value = "";
    crSeats.value = "";
    crDesc.value = "";
    crDates.value = "";
    intrDates.value = "";
  }
});

// Functions
function formatDate(dateStr) {
  if (!dateStr) return "";
  // If dateStr is a Firestore Timestamp, convert to JS Date
  if (
    dateStr &&
    typeof dateStr === "object" &&
    typeof dateStr.toDate === "function"
  ) {
    dateStr = dateStr.toDate();
  }
  // If it's a Date object, format directly
  if (dateStr instanceof Date) {
    const mm = String(dateStr.getMonth() + 1).padStart(2, "0");
    const dd = String(dateStr.getDate()).padStart(2, "0");
    const yyyy = dateStr.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  }
  // If it's a string, parse as before
  if (typeof dateStr === "string") {
    const datePart = dateStr.split(" at")[0];
    const dateObj = new Date(datePart);
    if (!isNaN(dateObj)) {
      const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
      const dd = String(dateObj.getDate()).padStart(2, "0");
      const yyyy = dateObj.getFullYear();
      return `${mm}/${dd}/${yyyy}`;
    }
  }
  return "";
}

// Converts "MM/DD/YYYY" to Firestore Timestamp
function parseDateToTimestamp(dateStr) {
  if (!dateStr) return null;
  // Import Timestamp from Firestore if not already imported
  const [mm, dd, yyyy] = dateStr.split("/");
  if (!mm || !dd || !yyyy) return null;
  const dateObj = new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
  if (isNaN(dateObj)) return null;
  // Firestore Timestamp expects seconds and nanoseconds
  return {
    seconds: Math.floor(dateObj.getTime() / 1000),
    nanoseconds: 0,
    toDate: () => dateObj,
  };
  // If you have access to Firestore Timestamp:
  // return Timestamp.fromDate(dateObj);
}

document.getElementById("file-input").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("myFile", file);
});
