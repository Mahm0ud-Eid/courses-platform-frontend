// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCaUETFsFnRgSmNFIwEgyGWugfrK9zHbM0",
  authDomain: "uccd-f607e.firebaseapp.com",
  projectId: "uccd-f607e",
  storageBucket: "uccd-f607e.firebaseapp.com",
  messagingSenderId: "1037776187244",
  appId: "1:1037776187244:web:7d02b5edc4908dad390d49",
  measurementId: "G-B95Y1W5QWP",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM elements
const courseTableBody = document.querySelector('.table-desi tbody');
const searchInput = document.getElementById('searchInput') || document.createElement('input');
const searchButton = document.getElementById('searchButton');
const statusFilter = document.getElementById('statusFilter');
const cardViewBtn = document.getElementById('cardViewBtn');
const listViewBtn = document.getElementById('listViewBtn');
const courseCardsContainer = document.getElementById('courseCardsContainer');
const courseTableContainer = document.getElementById('courseTableContainer');

// Track all courses for filtering
let allCourses = [];

// Function to format dates from Firestore Timestamp
function formatDate(timestamp) {
  if (!timestamp) return 'N/A';
  
  try {
    // Check if timestamp is a Firestore Timestamp
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
    
    // If it's a string, try to parse it
    if (typeof timestamp === 'string') {
      return new Date(timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
    
    // Otherwise, try to convert directly
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
}

// Function to check if a course is active based on dates
function isCourseActive(startDate, endDate) {
  const now = new Date();
  let start = startDate;
  let end = endDate;
  
  // Convert Firebase timestamps to JavaScript Date objects if needed
  if (startDate instanceof Timestamp) {
    start = startDate.toDate();
  } else if (typeof startDate === 'string') {
    start = new Date(startDate);
  }
  
  if (endDate instanceof Timestamp) {
    end = endDate.toDate();
  } else if (typeof endDate === 'string') {
    end = new Date(endDate);
  }
  
  return now >= start && now <= end;
}

// Function to fetch instructor courses
async function fetchInstructorCourses() {
  try {
    // Check if user is authenticated
    const user = auth.currentUser;
    if (!user) {
      console.log('No user is signed in');
      redirectToLogin();
      return;
    }
    
    // Show loading indicators
    if (courseTableBody) {
      courseTableBody.innerHTML = '<tr><td colspan="8" class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></td></tr>';
    }
    
    if (courseCardsContainer) {
      courseCardsContainer.innerHTML = '<div class="col-12 text-center py-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
    }
    
    // Get current user's ID
    const instructorId = user.uid;
    
    // Query courses collection for courses where instructorId matches current user
    const coursesRef = collection(db, 'courses');
    const q = query(coursesRef, where('instructorId', '==', instructorId));
    const querySnapshot = await getDocs(q);
    
    // Check if there are courses
    if (querySnapshot.empty) {
      if (courseTableBody) {
        courseTableBody.innerHTML = '<tr><td colspan="8" class="text-center">No courses found.</td></tr>';
      }
      
      if (courseCardsContainer) {
        courseCardsContainer.innerHTML = '<div class="col-12 text-center py-5">No courses found.</div>';
      }
      return;
    }
    
    // Store all courses for filtering
    allCourses = [];
    querySnapshot.forEach((doc) => {
      allCourses.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Display courses
    displayCourses(allCourses);
    
  } catch (error) {
    console.error('Error fetching instructor courses:', error);
    const errorMessage = '<tr><td colspan="8" class="text-center text-danger">Error loading courses. Please try again later.</td></tr>';
    
    if (courseTableBody) {
      courseTableBody.innerHTML = errorMessage;
    }
    
    if (courseCardsContainer) {
      courseCardsContainer.innerHTML = '<div class="col-12 text-center text-danger py-5">Error loading courses. Please try again later.</div>';
    }
  }
}

// Function to display courses in both table and card views
function displayCourses(courses) {
  // Clear previous content
  if (courseTableBody) {
    courseTableBody.innerHTML = '';
  }
  
  if (courseCardsContainer) {
    courseCardsContainer.innerHTML = '';
  }
  
  if (courses.length === 0) {
    if (courseTableBody) {
      courseTableBody.innerHTML = '<tr><td colspan="8" class="text-center">No courses match your criteria.</td></tr>';
    }
    
    if (courseCardsContainer) {
      courseCardsContainer.innerHTML = '<div class="col-12 text-center py-5">No courses match your criteria.</div>';
    }
    return;
  }
  
  // Display courses in table view
  if (courseTableBody) {
    courses.forEach((course) => {
      // Determine course status
      const isActive = isCourseActive(course.courseStartDate, course.courseEndDate);
      const statusClass = isActive ? 'label-success' : 'label-default';
      const statusText = isActive ? 'Active' : 'Not Active';
      
      // Create row for the course
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>
          <a href="instructor-course-detail.html?id=${course.id}">${course.title || 'Untitled Course'}</a>
        </td>
        <td>${formatDate(course.courseStartDate)}</td>
        <td>${formatDate(course.courseEndDate)}</td>
        <td>${course.duration || 'N/A'}</td>
        <td>${course.currentStudents || '0'}</td>
        <td>${course.roomNumber || 'N/A'}</td>
        <td>
          <span class="label ${statusClass}">${statusText}</span>
        </td>
        <td>
          <a href="instructor-course-detail.html?id=${course.id}" class="btn btn-primary text-white">View</a>
          <a href="instructor-add-material.html?id=${course.id}" class="btn btn-warning text-dark">Add Material</a>
          <a href="instructor-attendance.html?id=${course.id}" class="btn btn-info text-white">Attendance</a>
        </td>
      `;
      
      courseTableBody.appendChild(row);
    });
  }
  
  // Display courses in card view
  if (courseCardsContainer) {
    courses.forEach((course) => {
      // Determine course status
      const isActive = isCourseActive(course.courseStartDate, course.courseEndDate);
      const statusClass = isActive ? 'bg-success' : 'bg-secondary';
      const statusText = isActive ? 'Active' : 'Not Active';
      
      // Create card for the course
      const cardCol = document.createElement('div');
      cardCol.className = 'col-md-4 mb-4';
      cardCol.innerHTML = `
        <div class="card h-100">
          <div class="card-header ${statusClass} text-white">
            <h5 class="mb-0">${course.title || 'Untitled Course'}</h5>
          </div>
          <div class="card-body">
            <ul class="list-group list-group-flush">
              <li class="list-group-item d-flex justify-content-between">
                <span>Start Date:</span>
                <strong>${formatDate(course.courseStartDate)}</strong>
              </li>
              <li class="list-group-item d-flex justify-content-between">
                <span>End Date:</span>
                <strong>${formatDate(course.courseEndDate)}</strong>
              </li>
              <li class="list-group-item d-flex justify-content-between">
                <span>Duration:</span>
                <strong>${course.duration || 'N/A'}</strong>
              </li>
              <li class="list-group-item d-flex justify-content-between">
                <span>Students:</span>
                <strong>${course.currentStudents || '0'}</strong>
              </li>
              <li class="list-group-item d-flex justify-content-between">
                <span>Room:</span>
                <strong>${course.roomNumber || 'N/A'}</strong>
              </li>
              <li class="list-group-item d-flex justify-content-between">
                <span>Status:</span>
                <span class="badge ${statusClass}">${statusText}</span>
              </li>
            </ul>
          </div>
          <div class="card-footer d-flex justify-content-between">
            <a href="instructor-course-detail.html?id=${course.id}" class="btn btn-primary">
              <i class="fa fa-eye"></i> View
            </a>
            <a href="instructor-add-material.html?id=${course.id}" class="btn btn-warning">
              <i class="fa fa-plus"></i> Add Material
            </a>
            <a href="instructor-attendance.html?id=${course.id}" class="btn btn-info">
              <i class="fa fa-check-square-o"></i>
            </a>
          </div>
        </div>
      `;
      
      courseCardsContainer.appendChild(cardCol);
    });
  }
}

// Function to filter courses based on search input and status filter
function filterCourses() {
  const searchTerm = searchInput.value.toLowerCase();
  const statusValue = statusFilter ? statusFilter.value : 'all';
  
  const filteredCourses = allCourses.filter(course => {
    // Filter by search term
    const courseTitle = (course.title || '').toLowerCase();
    const matchesSearch = courseTitle.includes(searchTerm);
    
    // Filter by status
    const isActive = isCourseActive(course.courseStartDate, course.courseEndDate);
    const matchesStatus = 
      statusValue === 'all' || 
      (statusValue === 'active' && isActive) || 
      (statusValue === 'inactive' && !isActive);
    
    return matchesSearch && matchesStatus;
  });
  
  // Display filtered courses
  displayCourses(filteredCourses);
}

// Function to switch between card and list views
function toggleView(viewType) {
  if (viewType === 'card') {
    if (courseCardsContainer) courseCardsContainer.style.display = 'flex';
    if (courseTableContainer) courseTableContainer.style.display = 'none';
    if (cardViewBtn) cardViewBtn.classList.add('active');
    if (listViewBtn) listViewBtn.classList.remove('active');
  } else {
    if (courseCardsContainer) courseCardsContainer.style.display = 'none';
    if (courseTableContainer) courseTableContainer.style.display = 'block';
    if (cardViewBtn) cardViewBtn.classList.remove('active');
    if (listViewBtn) listViewBtn.classList.add('active');
  }
}

// Function to redirect to login page
function redirectToLogin() {
  window.location.href = 'login.html';
}

// Set up event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Check authentication state
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, fetch courses
      fetchInstructorCourses();
    } else {
      // User is signed out, redirect to login
      redirectToLogin();
    }
  });
  
  // Search button click handler
  if (searchButton) {
    searchButton.addEventListener('click', filterCourses);
  }
  
  // Search input enter key handler
  if (searchInput) {
    searchInput.addEventListener('keyup', (event) => {
      if (event.key === 'Enter') {
        filterCourses();
      }
    });
  }
  
  // Status filter change handler
  if (statusFilter) {
    statusFilter.addEventListener('change', filterCourses);
  }
  
  // View toggle handlers
  if (cardViewBtn) {
    cardViewBtn.addEventListener('click', () => toggleView('card'));
  }
  
  if (listViewBtn) {
    listViewBtn.addEventListener('click', () => toggleView('list'));
  }
});
