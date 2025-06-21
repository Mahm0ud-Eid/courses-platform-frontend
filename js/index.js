// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  query,
  where,
  limit,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCaUETFsFnRgSmNFIwEgyGWugfrK9zHbM0",
  authDomain: "uccd-f607e.firebaseapp.com",
  projectId: "uccd-f607e",
  storageBucket: "uccd-f607e.firebasestorage.app",
  messagingSenderId: "1037776187244",
  appId: "1:1037776187244:web:7d02b5edc4908dad390d49",
  measurementId: "G-B95Y1W5QWP",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const users = collection(db, "users");

// events
// Check if the user is authenticated
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, you can access user information here
    // console.log("User is signed in:", user);
  } else {
    // User is signed out
    console.log("No user is signed in.");
  }
});

let token;
let signBtn = document.querySelector(".sign-btn");

document.addEventListener("DOMContentLoaded", function () {
  afterSignIn();
  loadCoursesPreview();
});

function afterSignIn() {
  token = validateToken();
  if (token) {
    signBtn.innerHTML = "Sign Out";
  }
  signBtn.addEventListener("click", function () {
    if (signBtn.innerHTML === "Sign Out") {
      auth
        .signOut()
        .then(() => {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("userData");
          window.location.href = "/login.html";
        })
        .catch((error) => {
          console.error("Sign out error:", error);
        });
    } else {
      window.location.href = "/login.html";
    }
  });
}

// Function to validate the token and check for expiration
function validateToken() {
  const token = sessionStorage.getItem("token");

  if (!token) {
    Swal.fire({
      title: "No token found",
      text: "Please log in.",
      icon: "warning",
      showCloseButton: true,
    }).then(() => {
      window.location.href = "/login.html";
    });
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
      Swal.fire({
        title: "Session Expired",
        text: "Your session has expired. Please log in again.",
        icon: "warning",
        showCloseButton: true,
      }).then(() => {
        window.location.href = "/login.html";
      });
      return null;
    }
  } catch (error) {
    console.error("Invalid token format:", error);
    Swal.fire({
      title: "Invalid token format",
      text: "Please log in again.",
      icon: "error",
      showCloseButton: true,
    }).then(() => {
      window.location.href = "/login.html";
    });
    return null;
  }

  console.log("Token is valid and not expired.");
  return token;
}

export { auth, db, app, validateToken, collection };

const userData = JSON.parse(sessionStorage.getItem("userData"));
let coursesPt = document.querySelector(".courses-pt");

async function loadCoursesPreview() {
  try {
    const q = query(collection(db, "courses"), limit(5));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();

      // Only create the component if data.title is not in userData.courses
      if (!userData?.courses?.includes(data.title)) {
        let courseItem = `
          <div
        class="col-lg-4 col-md-6 d-flex align-items-stretch"
        data-aos="zoom-in"
        data-aos-delay="100"
          >
        <div class="course-item">
          <img
        src="${data.imageLink || "images/course/3.jpg"}"
        class="img-fluid"
        alt="${data.title}"
          />
          <div class="course-content">
        <div
          class="d-flex justify-content-between align-items-center mb-3"
        >
          <p class="category">${data.category || "General"}</p>
        </div>

        <h3><a href="course-details.html">${data.title || "Course"}</a></h3>
        <p class="description">
          ${data.description ?? data.title + " course."}
        </p>
        <div
          class="trainer d-flex justify-content-between align-items-center"
        >
          <div class="trainer-profile d-flex align-items-center">
        <img
          src="assets/img/trainers/trainer-1-2.jpg"
          class="img-fluid"
          alt="trainer"
        />
        <a href="" class="trainer-link">${data.instructor || "Trainer"}</a>
          </div>
          <div class="trainer-rank d-flex align-items-center">
        <i class="bi bi-person user-icon"></i>&nbsp;${
          data.maxAcceptedStudents || 50
        }
        &nbsp;&nbsp;
        ${
          userData && userData.role && userData.role.toLowerCase() === "student"
            ? `<span class="badge rounded-pill text-bg-warning apply-btn cr-apply-btn" course-id="${data.courseID}" cat="${data.category}" style="cursor:pointer;">Apply</span>`
            : ""
        }
          </div>
        </div>
          </div>
        </div>
          </div>`;
        coursesPt.insertAdjacentHTML("beforeend", courseItem);
      }
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
  }
}

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("cr-apply-btn")) {
    const cat = e.target.getAttribute("cat");
    const courseId = e.target.getAttribute("course-id");

    // Get all courses where title is in userData.courses
    const titles = userData?.courses || [];
    // if (!titles.length) {
    //   Swal.fire({
    //     title: "No enrolled courses found",
    //     text: "You are not enrolled in any courses.",
    //     icon: "info",
    //     showCloseButton: true,
    //   });
    //   return;
    // }

    // Query Firestore for courses with matching titles
    const coursesRef = collection(db, "courses");
    const q = query(coursesRef, where("title", "in", titles));
    getDocs(q)
      .then((querySnapshot) => {
        let hasCategory = false;
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.category === cat) {
            hasCategory = true;
          }
        });

        if (hasCategory) {
          Swal.fire({
            title: "Already Enrolled",
            text: "You already have a course in this category.",
            icon: "warning",
            showCloseButton: true,
          });
        } else {
          // Add student to the students subcollection
          const studentsRef = collection(db, "courses", courseId, "students");
          const studentDoc = {
            email: userData.email,
            isAccepted: null,
            name: userData.name,
            department: userData.department,
            studentId: userData.id,
            universityID: userData.universityID,
          };
          // Use studentId as doc id for uniqueness
          import(
            "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js"
          ).then(({ setDoc, doc }) => {
            setDoc(doc(studentsRef, userData.id), studentDoc)
              .then(() => {
                Swal.fire({
                  title: "Applied Successfully",
                  text: "Your request is under review.",
                  icon: "success",
                  showCloseButton: true,
                });
              })
              .catch((error) => {
                Swal.fire({
                  title: "Error",
                  text: "Could not apply: " + error.message,
                  icon: "error",
                  showCloseButton: true,
                });
              });
          });
        }
      })
      .catch((error) => {
        Swal.fire({
          title: "Error",
          text: "Could not check courses: " + error.message,
          icon: "error",
          showCloseButton: true,
        });
      });
  }
});
