import { auth, db, validateToken, collection } from "../js/index.js"; // Import auth and db from index.js

import {
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const userData = JSON.parse(sessionStorage.getItem("userData"));

let stdName = document.getElementsByClassName("std-name");
let stdId = document.querySelector(".std-id");

// Display user data on the page
if (userData) {
  Array.from(stdName).forEach((el) => {
    el.innerHTML = userData.name;
  });
  stdId.textContent = userData.id;
} else {
  console.error("No user data found in sessionStorage.");
}

const container = document.querySelector(".enr-courses");

if (userData?.courses?.length) {
  userData.courses.forEach(async (course) => {
    try {
      const q = query(collection(db, "courses"), where("title", "==", course));
      const querySnapshot = await getDocs(q);
      let courseRef;
      if (!querySnapshot.empty) {
        courseRef = querySnapshot.docs[0].ref;
      } else {
        console.error(`No course found with title '${course}'`);
      }
      const courseSnap = await getDoc(courseRef);
      // console.log("Fetched Course data:", courseSnap.data());
      if (courseSnap.exists()) {
        const data = courseSnap.data();
        const colDiv = document.createElement("div");
        colDiv.className = "col-md-6";

        const card = document.createElement("div");
        card.className = "course-card";

        const cardImg = document.createElement("div");
        cardImg.className = "course-card-img";

        const img = document.createElement("img");
        img.src = data.imageLink ? data.imageLink : "images/course/3.jpg";
        img.alt = data.title;

        const badge = document.createElement("span");
        badge.className = "course-badge";
        badge.textContent = "Completed";

        cardImg.appendChild(img);
        cardImg.appendChild(badge);

        const cardBody = document.createElement("div");
        cardBody.className = "course-card-body";

        const title = document.createElement("h5");
        title.textContent = data.title;

        const desc = document.createElement("p");
        desc.textContent = data.description;

        const meta = document.createElement("div");
        meta.className = "course-meta";

        const duration = document.createElement("span");
        duration.className = "course-duration";
        duration.textContent = `${data.duration} Days`;

        meta.appendChild(duration);
        cardBody.appendChild(title);
        cardBody.appendChild(desc);
        cardBody.appendChild(meta);

        card.appendChild(cardImg);
        card.appendChild(cardBody);
        colDiv.appendChild(card);
        container.appendChild(colDiv);
      }
    } catch (error) {
      console.error("Error fetching course data:", error);
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  validateToken();
});
