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
    window.location.href = "/admin-login.html";
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
      window.location.href = "/admin-login.html";
      return null;
    }
  } catch (error) {
    console.error("Invalid token format:", error);
    alert("Invalid token format. Please log in again.");
    window.location.href = "/admin-login.html";
    return null;
  }

  console.log("Token is valid and not expired.");
  return token;
}

document.addEventListener("DOMContentLoaded", function () {
  validateToken();
});

instMgBtn.addEventListener("click", function () {
  dir.innerHTML = "manage Instructors";
  dash.style.display = "none";
  stdDetails.style.display = "none";
  cDetails.style.display = "none";
  addInst.style.display = "block";
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

instViewBtn.addEventListener("click", function () {
  dir.innerHTML = "view Instructor";
  const token = validateToken();

  fetch(
    `https://uccd-ljoxz.ondigitalocean.app/api/v1/manager/instructor/show?username=${instEmail.value}`,
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
      console.log(data.data);
      // instFName.value = data.data.firstname || "";
      // instLName.value = data.data.lastname || "";
      instName.value = data.data.username || "";
      instPass.value = data.data.password || "";
      instPhone.value = data.data.Phone || "";
      instDesc.value = data.data.description || "";
      // instImg.src = data.data.image || "images/user/1.png";
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
});

let instSaveBtn = document.querySelector(".inst-save");

instSaveBtn.addEventListener("click", function (event) {
  const token = validateToken();
  event.preventDefault(); // Prevent form submission

  const instructorData = {
    email: instEmail.value,
    name: instName.value,
    // password: instPass.value,
    phone: instPhone.value,
    description: instDesc.value,
    // image: instImg.src || "images/user/1.png",
  };

  fetch(
    `https://uccd-ljoxz.ondigitalocean.app/api/v1/manager/instructor/update`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(instructorData),
    }
  )
    .then((response) => {
      if (response.status === 404) {
        // If not found, create a new instructor
        return fetch(
          `https://uccd-ljoxz.ondigitalocean.app/api/v1/manager/instructor/store`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(instructorData),
          }
        );
      }

      return response;
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Operation successful:", data);
    })
    .catch((error) => {
      console.error("There was a problem with the operation:", error);
    });
});
