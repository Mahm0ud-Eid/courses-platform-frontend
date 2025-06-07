import { auth, db } from "../js/index.js"; // Import auth and db from index.js
import {
  collection,
  getFirestore,
  getDocs,
  query,
  where,
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

function validateToken() {
  const token = sessionStorage.getItem("token");

  if (!token) {
    alert("No token found. Please log in.");
    window.location.href = "/login.html";
    return null;
  }

  // If token is not a JWT, skip decoding logic
  if (!token.includes(".")) {
    console.log("Token is not a JWT. Skipping verification");
    return token;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const isExpired = payload.exp * 1000 < Date.now();

    if (isExpired) {
      alert("Token expired. Please log in again.");
      window.location.href = "/login.html";
      return null;
    }
  } catch (error) {
    console.error("Invalid token format:", error);
    alert("Invalid token format. Please log in again.");
    window.location.href = "/login.html";
    return null;
  }

  console.log("Token is valid and not expired.");
  return token;
}

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
  const token = validateToken();

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
  const db = getFirestore();
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", instEmail.value));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const userData = querySnapshot.docs[0].data();
    console.log("Fetched user data:", userData);
    Swal.fire({
      title: "User Found",
      text: "Fill the fields to update it",
      icon: "success",
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: "Ok",
      cancelButtonText: "No, thanks",
    }).then((result) => {
      if (result.isConfirmed) {
        console.log("yes");
      } else if (result.isDismissed) {
        console.log("No");
      }
    });
    instSaveBtn.innerHTML = "Update Instructor";
    // instFName.value = userData.firstname || "";
    // instLName.value = userData.lastname || "";
    instName.value = userData.name || "";
    // instPass.value = userData.password || "";
    instPhone.value = userData.Phone || "";
    instDesc.value = userData.Description || "";
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
      showCancelButton: true,
      confirmButtonText: "Ok",
      cancelButtonText: "No, thanks",
    }).then((result) => {
      if (result.isConfirmed) {
        console.log("yes");
      } else if (result.isDismissed) {
        console.log("No");
      }
    });
    instSaveBtn.innerHTML = "Create Instructor";
    // Clear the form fields if no data is returned
    instName.value = "";
    instPhone.value = "";
    instDesc.value = "";
    // instPass.value = "";
    // instImg.src = "images/user/1.png";
  }
});

instSaveBtn.addEventListener("click", function (event) {
  event.preventDefault(); // Prevent form submission

  const token = validateToken();

  // Prevent default form submission and handle everything via fetch
  const instructorData = {
    Email: instEmail.value,
    Name: instName.value,
    Password: instPass.value,
    Phone: instPhone.value,
    Description: instDesc.value,
    // Image: instImg.value || `images/user/1.png`,
  };

  fetch(rUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(instructorData),
    redirect: "manual", // Prevent automatic following of redirects
  })
    .then((response) => {
      // If the backend tries to redirect, fetch with redirect: "manual" will not follow it
      if (
        response.type === "opaqueredirect" ||
        response.status === 302 ||
        response.status === 301
      ) {
        throw new Error("Redirect prevented by client.");
      }
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      Swal.fire({
        title: data.message,
        icon: "success",
        showCloseButton: true,
      });
    })
    .catch((error) => {
      console.error("There was a problem with the operation:", error);
      Swal.fire({
        title: "Error",
        text: error.message,
        icon: "error",
        showCloseButton: true,
      });
    });
});

instDelBtn.addEventListener("click", function (event) {
  event.preventDefault(); // Prevent form submission

  const token = validateToken();

  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "No, cancel!",
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(
        `https://uccd-ljoxz.ondigitalocean.app/api/v1/manager/instructor/delete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ username: instEmail.value }),
        }
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          Swal.fire({
            title: data.message,
            icon: "success",
            showCloseButton: true,
          });
          // Clear the form fields after deletion
          instName.value = "";
          instPhone.value = "";
          instDesc.value = "";
          instEmail.value = "";
          instPass.value = "";
        })
        .catch((error) => {
          console.error("There was a problem with the fetch operation:", error);
          Swal.fire({
            title: "Error",
            text: error.message,
            icon: "error",
            showCloseButton: true,
          });
        });
    } else if (result.isDismissed) {
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
