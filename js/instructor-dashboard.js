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
const courseCountElement = document.querySelector('.dash-b-1 h4');
const materialCountElement = document.querySelector('.dash-b-2 h4');
const loadingIndicator = document.createElement('div');
loadingIndicator.className = 'text-center p-5';
loadingIndicator.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>';

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

// Function to fetch and display instructor courses
async function fetchInstructorCourses() {
  try {
    // Check if user is authenticated
    const user = auth.currentUser;
    if (!user) {
      console.log('No user is signed in');
      redirectToLogin();
      return;
    }
    
    // Show loading indicator
    courseTableBody.innerHTML = '';
    courseTableBody.appendChild(loadingIndicator);
    
    // Get current user's ID
    const instructorId = user.uid;
    
    // Query courses collection for courses where instructorId matches current user
    const coursesRef = collection(db, 'courses');
    const q = query(coursesRef, where('instructorId', '==', instructorId));
    const querySnapshot = await getDocs(q);
    
    // Remove loading indicator
    loadingIndicator.remove();
    
    // Check if there are courses
    if (querySnapshot.empty) {
      courseTableBody.innerHTML = '<tr><td colspan="8" class="text-center">No courses found.</td></tr>';
      courseCountElement.textContent = '0';
      return;
    }
    
    // Count courses and materials
    let courseCount = 0;
    let materialCount = 0;
    
    // Clear previous content
    courseTableBody.innerHTML = '';
    
    // Process each course
    querySnapshot.forEach((doc) => {
      const course = doc.data();
      courseCount++;
      
      // If the course has materials, count them
      if (course.materials && Array.isArray(course.materials)) {
        materialCount += course.materials.length;
      }
      
      // Determine course status
      const isActive = isCourseActive(course.courseStartDate, course.courseEndDate);
      const statusClass = isActive ? 'label-success' : 'label-default';
      const statusText = isActive ? 'Active' : 'Not Active';
      
      // Create row for the course
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>
          <a href="instructor-course-detail.html?id=${doc.id}">${course.title || 'Untitled Course'}</a>
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
          <a href="instructor-course-detail.html?id=${doc.id}" class="btn btn-primary text-white">View</a>
          <a href="instructor-add-material.html?id=${doc.id}" class="btn btn-warning text-dark">Add Material</a>
        </td>
      `;
      
      courseTableBody.appendChild(row);
    });
    
    // Update course and material counts in the dashboard
    courseCountElement.textContent = courseCount.toString();
    materialCountElement.textContent = materialCount.toString();
    
  } catch (error) {
    console.error('Error fetching instructor courses:', error);
    loadingIndicator.remove();
    courseTableBody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">Error loading courses. Please try again later.</td></tr>';
  }
}

// Function to redirect to login page
function redirectToLogin() {
  window.location.href = 'login.html';
}

// Check authentication state when page loads
document.addEventListener('DOMContentLoaded', () => {
  // Set up authentication listener
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, fetch courses
      fetchInstructorCourses();
    } else {
      // User is signed out, redirect to login
      redirectToLogin();
    }
  });
});
