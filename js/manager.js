import { auth, db, validateToken } from "../js/index.js"; // Import auth and db from index.js
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

let dir = document.querySelector(".curr-path");
let instMgBtn = document.querySelector(".inst-mg-btn");
let instVAllBtn = document.querySelector(".inst-v-all");
let dash = document.querySelector(".dash");
let stdDetails = document.querySelector(".std-details");
let cDetails = document.querySelector(".c-details");
let addInst = document.querySelector(".add-inst");
let instDetails = document.querySelector(".inst-details");

instDetails.style.display = "none";
addInst.style.display = "none";

let instViewBtn = document.querySelector(".inst-view");
let instSaveBtn = document.querySelector(".inst-save");
let instDelBtn = document.querySelector(".inst-del");

// let instFName = document.querySelector(".inst-f-name");
// let instLName = document.querySelector(".inst-l-name");
let instName = document.querySelector(".inst-name");
let instPhone = document.querySelector(".inst-phone");
let instEmail = document.querySelector(".inst-email");
let instPass = document.querySelector(".inst-pass");
let instDesc = document.querySelector(".inst-desc");
let instImg = document.querySelector(".inst-img");

const usersRef = collection(db, "users");

document.addEventListener("DOMContentLoaded", function () {
  validateToken();
});

instMgBtn.addEventListener("click", function () {
  dir.innerHTML = "manage users";
  dash.style.display = "none";
  stdDetails.style.display = "none";
  cDetails.style.display = "none";
  addInst.style.display = "block";
});

instViewBtn.addEventListener("click", async function () {
  dir.innerHTML = "view user";
  // const token = validateToken();

  // // Initialize Firebase if not already initialized
  // if (!firebase.apps.length) {
  //   firebase.initializeApp({
  //     apiKey: "YOUR_API_KEY",
  //     authDomain: "YOUR_AUTH_DOMAIN",
  //     projectId: "YOUR_PROJECT_ID",
  //     // ...other config
  //   });
  // }
  // const db = firebase.firestore();
  const qSnap = await getDocs(
    query(usersRef, where("email", "==", instEmail.value))
  );

  if (!qSnap.empty) {
    const userData = qSnap.docs[0].data();
    console.log("Fetched user data:", userData);
    Swal.fire({
      title: "User Found",
      text: "Fill the fields to update it",
      icon: "success",
      showCloseButton: true,
    });
    instSaveBtn.innerHTML = "Update User";
    // instFName.value = userData.firstname || "";
    // instLName.value = userData.lastname || "";
    instName.value = userData.name || "";
    instPass.value = userData.password || "";
    instPhone.value = userData.phone || "";
    instDesc.value = userData.description || "";
    // instImg.src = userData.image || "images/user/1.png";

    const role = userData.role ? userData.role.toLowerCase() : "";
    document
      .querySelector('[value="instructor"]')
      .toggleAttribute("selected", role === "instructor");
    document
      .querySelector('[value="student"]')
      .toggleAttribute("selected", role === "student");
  } else {
    Swal.fire({
      title: "User Not Found",
      text: "Fill the fields to create it",
      icon: "info",
      showCloseButton: true,
    });
    instSaveBtn.innerHTML = "Create User";
    // Clear the form fields if no data is returned
    instName.value = "";
    instPhone.value = "";
    instDesc.value = "";
    // instPass.value = "";
    // instImg.src = "images/user/1.png";
  }
});

document.getElementById("file-input").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("myFile", file);
});

instSaveBtn.addEventListener("click", async (event) => {
  event.preventDefault(); // Prevent form submission
  const token = validateToken();

  const instructorData = {
    email: instEmail.value,
    name: instName.value,
    password: instPass.value,
    phone: instPhone.value,
    description: instDesc.value,
    role: document.getElementById("userRole").value,
    // image: instImg.value || `images/user/1.png`,
  };

  try {
    if (instSaveBtn.innerHTML === "Update User") {
      // Update existing user
      const qSnap = await getDocs(
        query(usersRef, where("email", "==", instEmail.value))
      );
      if (!qSnap.empty) {
        const userDoc = qSnap.docs[0];
        await updateDoc(doc(db, "users", userDoc.id), {
          ...instructorData,
          updatedAt: new Date(),
        });
        Swal.fire({
          title: "User updated!",
          text: `User updated successfully.`,
          icon: "success",
          showCloseButton: true,
        });
      } else {
        Swal.fire({
          title: "User not found",
          text: "Cannot update non-existing user.",
          icon: "error",
          showCloseButton: true,
        });
      }
    } else {
      // Create new user
      const docRef = await addDoc(usersRef, instructorData);
      Swal.fire({
        title: "User saved!",
        text: `User ID: ${docRef.id}`,
        icon: "success",
        showCloseButton: true,
      });
    }
  } catch (error) {
    console.error("Error saving user: ", error);
    Swal.fire({
      title: "Error",
      text: error.message,
      icon: "error",
      showCloseButton: true,
    });
  }
});

// DELETE User
instDelBtn.addEventListener("click", async (event) => {
  event.preventDefault(); // Prevent form submission
  const token = validateToken();

  const qSnap = await getDocs(
    query(usersRef, where("email", "==", instEmail.value))
  );
  if (qSnap.empty) {
    Swal.fire({
      title: "User not found",
      icon: "error",
      showCloseButton: true,
    });
    return;
  }

  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "No, cancel!",
  }).then(async (result) => {
    if (result.isConfirmed) {
      const userDoc = qSnap.docs[0];
      await deleteDoc(doc(db, "users", userDoc.id));
      Swal.fire({
        title: "Deleted!",
        icon: "success",
        showCloseButton: true,
      });
      // Clear form after deletion
      instName.value = "";
      instEmail.value = "";
      instPhone.value = "";
      instDesc.value = "";
      instPass.value = "";
    } else {
      console.log("Deletion cancelled");
    }
  });
});

instVAllBtn.addEventListener("click", function () {
  dir.innerHTML = "view All Instructors";
  dash.style.display = "none";
  cDetails.style.display = "none";
  addInst.style.display = "none";
  instDetails.style.display = "block";

  const token = validateToken();

  fetch(
    `https://uccd-ljoxz.ondigitalocean.app/api/v1/manager/instructor/getAllInstructors`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      showAllInst(data.data);
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
});

function showAllInst(data) {
  let instArr = data;
  const tableBody = document.querySelector(".instructors-table tbody");
  tableBody.innerHTML = ""; // Clear existing rows

  instArr.forEach((instructor) => {
    const row = document.createElement("tr");

    row.innerHTML = `
        <td>
      <span class="list-img">
        <img src="${
          instructor.Image && instructor.Image.startsWith("http")
            ? instructor.Image
            : "images/user/1.png"
        }" alt="Instructor Image">
      </span>
        </td>
        
        <td>
      <a href="#">
        <span class="list-enq-name">${instructor.username}</span>
      </a>
        </td>
        <td>${instructor.Phone}</td>
        <td>${instructor.Email}</td>
        <td>
      <a href="admin-student-details.html" class="ad-st-view">View</a>
        </td>
      `;

    tableBody.appendChild(row);
  });
}

export { db, validateToken, dir, instDetails, cDetails, stdDetails, dash }; // Export the validateToken function for use in other modules
