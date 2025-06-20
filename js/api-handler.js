// Firebase Configuration
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
if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
} else {
    console.error("Firebase SDK not loaded");
}

document.addEventListener("DOMContentLoaded", async function () {
    const userRole = localStorage.getItem("userRole");

    if (!userRole) {
        console.warn("User role not found, please log in.");
        return;
    }

    let apiUrls = {};
    if (userRole === "doctor") {
        apiUrls = {
            events: "https://api.com/doctor/events",
            courses: "https://api.com/doctor/courses"
        };
    } else if (userRole === "student") {
        apiUrls = {
            events: "https://api.com/student/events",
            courses: "https://api.com/student/courses"
        };
    } else {
        console.error("Unknown user role:", userRole);
        return;
    }

    try {
        const [eventsData, coursesData] = await Promise.all([
            fetchData(apiUrls.events),
            fetchData(apiUrls.courses)
        ]);

        displayEvents(eventsData);
        displayCourses(coursesData);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
});

async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch data from ${url}`);
    }
    return await response.json();
}

function displayEvents(events) {
    const eventsList = document.getElementById("events-list");
    if (!eventsList) return;

    eventsList.innerHTML = events.map(event => `
        <li>
            <div class="ho-ev-date pg-eve-date">
                <span>${event.date.split('-')[2]}</span><span>${event.date}</span>
            </div>
            <div class="ho-ev-link pg-eve-desc">
                <a href="event-register.html">
                    <h4>${event.title}</h4>
                </a>
                <p>${event.description}</p>
                <span>${event.time}</span>
            </div>
            <div class="pg-eve-reg">
                <a href="event-register.html">Register</a>
                <a href="event-details.html">Read more</a>
            </div>
        </li>
    `).join("");
}

function displayCourses(courses) {
    const coursesList = document.getElementById("courses-list");
    if (!coursesList) return;

    coursesList.innerHTML = courses.map(course => `
        <li class="course-item">
            <div class="home-top-cour">
                <div class="col-md-3">
                    <img src="${course.image}" alt="${course.title}" />
                </div>
                <div class="col-md-9 home-top-cour-desc">
                    <a href="course-details.html">
                        <h3>${course.title}</h3>
                    </a>
                    <h4>${course.category}</h4>
                    <p>${course.description}</p>
                    <span class="home-top-cour-rat">${course.rating}</span>
                    <div class="hom-list-share">
                        <ul>
                            <li>
                                <a href="course-details.html"><i class="fa fa-bar-chart"></i> Book Now</a>
                            </li>
                            <li>
                                <a href="course-details.html"><i class="fa fa-eye"></i> ${course.availableSeats} Available</a>
                            </li>
                            <li>
                                <a href="course-details.html"><i class="fa fa-share-alt"></i> ${course.shares}</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </li>
    `).join("");
}
