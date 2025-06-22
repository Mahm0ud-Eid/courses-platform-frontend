// import { auth, db, validateToken, collection } from "../js/index.js"; // Import auth and db from index.js
let db;

async function loadIndexModule() {
  try {
    const module = await import("../js/index.js");
    db = module.db;
    module.validateToken();
  } catch (err) {
    console.error("Failed to load login.js:", err);
  }
}
await loadIndexModule();

function loadValidate() {
  import("../js/index.js")
    .then((module) => {
      module.validateToken(); // Call validateToken from index.js
    })
    .catch((err) => {
      console.error("Failed to load index.js:", err);
    });
}

import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  collection,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
// import { validateToken } from "./manager.js";

const userData = JSON.parse(sessionStorage.getItem("userData"));

let stdName = document.getElementsByClassName("std-name");
let stdId = document.querySelector(".std-id");

// Display user data on the page
if (userData) {
  Array.from(stdName).forEach((el) => {
    el.innerHTML = userData.name;
  });
  stdId.textContent = userData.universityID;
} else {
  console.error("No user data found in sessionStorage.");
}

// Display courses
const container = document.querySelector(".enr-courses");

if (Array.isArray(userData?.courses) && userData.courses.length) {
  for (const course of userData.courses) {
    (async () => {
      try {
        const q = query(
          collection(db, "courses"),
          where("title", "==", course)
        );
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          console.error(`No course found with title '${course}'`);
          return;
        }
        const courseRef = querySnapshot.docs[0].ref;
        const courseSnap = await getDoc(courseRef);
        if (!courseSnap.exists()) return;
        const data = courseSnap.data();
        const ratingDocRef = doc(
          collection(db, "courses", data.courseID, "ratings"),
          userData.id
        );
        const ratingSnap = await getDoc(ratingDocRef);
        let userRating = 0;
        if (ratingSnap.exists()) {
          userRating = ratingSnap.data().rate;
        }

        const crCard = `
          <div class="col-md-6">
            <div class="course-card">
              <div class="course-card-img">
          <img src="${data.imageLink ?? "images/course/3.jpg"}" alt="${
          data.title
        }" />
          <span class="course-badge">Completed</span>
              </div>
              <div class="course-card-body">
          <h5>${data.title}</h5>
          <p>${data.description ?? data.title + " course."}</p>
          <div class="course-meta">
            <span class="course-duration">${data.duration} Days</span>
            <div class="star-rating ${data.courseID}">
              <span class="star" data-value="1" style="color:${
                userRating >= 1 ? "gold" : "gray"
              }">&#9733;</span>
              <span class="star" data-value="2" style="color:${
                userRating >= 2 ? "gold" : "gray"
              }">&#9733;</span>
              <span class="star" data-value="3" style="color:${
                userRating >= 3 ? "gold" : "gray"
              }">&#9733;</span>
              <span class="star" data-value="4" style="color:${
                userRating >= 4 ? "gold" : "gray"
              }">&#9733;</span>
              <span class="star" data-value="5" style="color:${
                userRating >= 5 ? "gold" : "gray"
              }">&#9733;</span>
            </div>
          </div>
              </div>
            </div>
          </div>`;
        container.insertAdjacentHTML("beforeend", crCard);
      } catch (error) {
        console.error("Error fetching course data:", error);
      }
    })();
  }
}

// Star rating functionality
document.addEventListener("mouseover", (e) => {
  if (!e.target.classList.contains("star")) return;
  const rating = e.target.dataset.value;
  const container = e.target.closest(".star-rating");
  container?.querySelectorAll(".star").forEach((s) => {
    s.style.color = Number(s.dataset.value) <= rating ? "gold" : "gray";
  });
});

let rating;
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("star")) {
    rating = Number(e.target.dataset.value);
    const container = e.target.closest(".star-rating");
    container?.querySelectorAll(".star").forEach((s) => {
      s.style.color = Number(s.dataset.value) <= rating ? "gold" : "gray";
    });
    const courseId = e.target.parentElement.classList[1];
    const ratingsRef = collection(db, "courses", courseId, "ratings");
    const ratingDocRef = doc(ratingsRef, userData.id);
    setDoc(
      ratingDocRef,
      {
        courseId,
        overallRating: rating,
        rateId: ratingDocRef.id,
        userId: userData.id,
        userName: userData.name,
      },
      { merge: true }
    )
      .then(() => console.log("Rating saved/updated."))
      .catch((error) => console.error("Error updating rating:", error));
  }
});

document.addEventListener("mouseout", (e) => {
  if (!e.target.classList.contains("star")) return;
  e.target
    .closest(".star-rating")
    ?.querySelectorAll(".star")
    .forEach((s) => {
      s.style.color = Number(s.dataset.value) <= rating ? "gold" : "gray";
    });
});

document.addEventListener("DOMContentLoaded", function () {
  loadValidate();
});
