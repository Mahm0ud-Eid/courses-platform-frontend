document.addEventListener("DOMContentLoaded", async function () {
    const userRole = localStorage.getItem("userRole");

    if (!userRole) {
        console.warn("User role not found, please log in.");
        return;
    }

    let apiUrl = "";
    if (userRole === "doctor") {
        apiUrl = "https://api.com/doctor/events";
    } else if (userRole === "student") {
        apiUrl = "https://api.com/student/events";
    } else {
        console.error("Unknown user role:", userRole);
        return;
    }

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error("Failed to fetch events data");
        }
        const eventsData = await response.json();
        displayEvents(eventsData);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
});

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
