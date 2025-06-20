// Firebase configuration for admin courses page
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
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

document.addEventListener('DOMContentLoaded', function() {
  // Check authentication status
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in, load courses
      loadCourses();
    } else {
      // User is signed out, redirect to login
      // window.location.href = "login.html";
      console.log("Not logged in, but still loading courses for demo");
      loadCourses(); // For demonstration purposes
    }
  });
});

// Function to load all courses
function loadCourses() {
  try {
    const db = firebase.firestore();
    
    // Show loading state
    const tableBody = document.querySelector(".table-hover tbody");
    if (tableBody) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="9" class="text-center">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p>Loading courses...</p>
          </td>
        </tr>
      `;
    }
    
    // Query courses collection
    // First, try without the "where" filter to help debug
    db.collection("courses").get()
      .then((querySnapshot) => {
        console.log(`Found ${querySnapshot.size} courses in database`);
        
        const courses = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          
          // Debug log to check date formats
          if (data.courseStartDate) {
            console.log(`Course ${doc.id} start date:`, data.courseStartDate);
          }
          if (data.courseEndDate) {
            console.log(`Course ${doc.id} end date:`, data.courseEndDate);
          }
            courses.push({ 
            id: doc.id,
            ...data,
            // Map fields from Firebase to our expected fields if needed
            title: data.title || data.name || 'Unnamed Course',
            category: data.category || '',
            instructor: data.instructor || data.instructorName || '',
            courseStartDate: data.courseStartDate || data.startDate || null,
            courseEndDate: data.courseEndDate || data.endDate || null,
            duration: data.duration || '',
            roomNumber: data.roomNumber || data.room || ''
          });
        });
        
        // Sort courses: Upcoming first, then Active, then Ended
        const sortedCourses = sortCoursesByStatus(courses);
        displayCourses(sortedCourses);
        
        // Hide loading spinner
        document.getElementById('preloader').style.display = 'none';
      })
      .catch((error) => {
        console.error("Error loading courses:", error);
        showNotification("Error loading courses. Please try again later.", "error");
      });
  } catch (error) {
    console.error("Error setting up Firestore:", error);
    showNotification("Error connecting to database. Please try again later.", "error");
  }
}

// Function to display courses in the table
function displayCourses(courses) {
  const tableBody = document.querySelector(".table-hover tbody");
  
  // Clear existing rows
  tableBody.innerHTML = "";
  
  // Check if there are courses
  if (courses.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="9" class="text-center">No courses found</td>
      </tr>
    `;
    return;
  }

  // Get current date for status comparison
  const currentDate = new Date();
  
  // Group courses by status for visual separation
  const upcomingCourses = courses.filter(c => c.statusText === "Upcoming");
  const activeCourses = courses.filter(c => c.statusText === "Active");
  const endedCourses = courses.filter(c => c.statusText === "Ended");
  const otherCourses = courses.filter(c => !["Upcoming", "Active", "Ended"].includes(c.statusText));
  
  // Display status counts
  console.log(`Displaying ${upcomingCourses.length} upcoming courses, ${activeCourses.length} active courses, ${endedCourses.length} ended courses`);
    // Section headers removed as requested// Display courses by sections - headers removed as requested
  if (upcomingCourses.length > 0) {
    // Section for upcoming courses (without header)
  }
  
  if (activeCourses.length > 0) {
    // Section for active courses (without header)
  }
  
  if (endedCourses.length > 0) {
    // Section for ended courses (without header)
  }
  if (otherCourses.length > 0) {
    // Section for other courses (without header)
  }
  // Function to render a course row
  const renderCourseRow = (course) => {
    // Parse dates for comparison - handle various date formats from Firebase
    const startDate = parseDateFromFirebase(course.courseStartDate);
    const endDate = parseDateFromFirebase(course.courseEndDate);
    
    // Use the status that was determined during sorting, or calculate it if not available
    let status = course.statusText || "Inactive";
    
    // Format dates for display
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
    
    // Create table row
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <a href="admin-course-details.html?id=${course.id}">
          <span class="list-enq-name">${course.title || 'Unnamed Course'}</span>
          <span class="list-enq-city">${course.location || ''}</span>
        </a>
      </td>
      <td>${course.category || ''}</td>
      <td>${course.instructor || ''}</td>
      <td>${formattedStartDate}</td>
      <td>${formattedEndDate}</td>
      <td>${course.duration || ''}</td>
      <td>${course.roomNumber || ''}</td>
      <td>
        <span class="label label-${getStatusClass(status)}">${status}</span>
      </td>
      <td>
        <a href="admin-add-courses.html?id=${course.id}&edit=true" class="ad-st-view">Edit</a>
        <a href="#" class="ad-st-view delete-course" data-id="${course.id}">Delete</a>
      </td>
    `;
    
    return row;
  };
  
  // Render each section's courses
  upcomingCourses.forEach(course => {
    tableBody.appendChild(renderCourseRow(course));
  });
  
  activeCourses.forEach(course => {
    tableBody.appendChild(renderCourseRow(course));
  });
  
  endedCourses.forEach(course => {
    tableBody.appendChild(renderCourseRow(course));
  });
  
  otherCourses.forEach(course => {
    tableBody.appendChild(renderCourseRow(course));
  });
  
  // Add event listeners for delete buttons
  attachDeleteEventListeners();
}

// Parse date from Firebase based on various possible formats
function parseDateFromFirebase(dateInput) {
  if (!dateInput) return null;
  
  // If it's already a Date object
  if (dateInput instanceof Date) return dateInput;
  
  // If it's a Firestore Timestamp
  if (dateInput && typeof dateInput.toDate === 'function') {
    return dateInput.toDate();
  }
  
  // If it's a timestamp number
  if (typeof dateInput === 'number') {
    return new Date(dateInput);
  }
  
  // If it's an ISO string or a custom format string
  if (typeof dateInput === 'string') {
    // Check if it's in "DD Month YYYY at HH:MM:SS UTC+X" format (from screenshot)
    const match = dateInput.match(/(\d+)\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})\s+at\s+(\d{2}):(\d{2}):(\d{2})\s+UTC([+-]\d+)/i);
    
    if (match) {
      const day = parseInt(match[1], 10);
      const month = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ].indexOf(match[2]);
      const year = parseInt(match[3], 10);
      const hour = parseInt(match[4], 10);
      const minute = parseInt(match[5], 10);
      const second = parseInt(match[6], 10);
      
      return new Date(Date.UTC(year, month, day, hour, minute, second));
    }
    
    // Try standard date parsing
    const date = new Date(dateInput);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  console.warn('Unable to parse date:', dateInput);
  return null;
}

// Format date to display format (Month Day, Year)
function formatDate(date) {
  if (!date || isNaN(date)) return 'Invalid Date';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Get appropriate Bootstrap status class based on status
function getStatusClass(status) {
  switch(status) {
    case 'Active':
      return 'success';
    case 'Upcoming':
      return 'info';
    case 'Ended':
      return 'danger';
    default:
      return 'secondary';
  }
}

// Function to sort courses by status (Upcoming first, then Active, then Ended)
function sortCoursesByStatus(courses) {
  const currentDate = new Date();
  
  // First, determine the status for each course
  courses.forEach(course => {
    const startDate = parseDateFromFirebase(course.courseStartDate);
    const endDate = parseDateFromFirebase(course.courseEndDate);
    
    if (startDate && endDate && !isNaN(startDate) && !isNaN(endDate)) {
      if (currentDate >= startDate && currentDate <= endDate) {
        course.statusPriority = 2; // Active
        course.statusText = "Active";
      } else if (currentDate < startDate) {
        course.statusPriority = 1; // Upcoming
        course.statusText = "Upcoming";
      } else {
        course.statusPriority = 3; // Ended
        course.statusText = "Ended";
      }
    } else {
      course.statusPriority = 4; // Invalid dates (lowest priority)
      course.statusText = "Inactive";
    }
  });
  
  // Sort based on the status priority
  return courses.sort((a, b) => a.statusPriority - b.statusPriority);
}

// Attach event listeners to delete buttons
function attachDeleteEventListeners() {
  const deleteButtons = document.querySelectorAll('.delete-course');
  deleteButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const courseId = this.getAttribute('data-id');
      
      if (confirm('Are you sure you want to move this course to trash?')) {
        try {
          const db = firebase.firestore();
          
          // Instead of deleting, move to trash by updating a field
          db.collection("courses").doc(courseId).update({
            trashed: true,
            trashedAt: new Date()
          })
          .then(() => {
            // Reload courses after update
            loadCourses();
            showNotification('Course moved to trash successfully.', 'success');
          })
          .catch((error) => {
            console.error("Error moving course to trash:", error);
            showNotification('Error moving course to trash. Please try again.', 'error');
          });
        } catch (error) {
          console.error("Error in delete process:", error);
          showNotification('Error processing request. Please try again.', 'error');
        }
      }
    });
  });
}

// Show notifications 
function showNotification(message, type = 'info') {
  // Create a notification element
  const notification = document.createElement('div');
  notification.className = `alert alert-${type} alert-dismissible fade show`;
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.zIndex = '1050';
  notification.style.maxWidth = '300px';
  
  notification.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  
  // Add to document
  document.body.appendChild(notification);
  
  // Remove after 5 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 150);
  }, 5000);
}
