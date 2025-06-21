// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
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
const courseTitle = document.getElementById('course-title');
const courseDescription = document.getElementById('course-description');
const courseStartDate = document.getElementById('course-start-date');
const courseEndDate = document.getElementById('course-end-date');
const courseDuration = document.getElementById('course-duration');
const courseStudents = document.getElementById('course-students');
const courseRoom = document.getElementById('course-room');
const courseStatus = document.getElementById('course-status');
const addMaterialLink = document.getElementById('add-material-link');
const attendanceLink = document.getElementById('attendance-link');
const materialsTable = document.getElementById('materials-table');
const studentsTable = document.getElementById('students-table');

// Get the course ID from the URL
function getCourseIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

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

// Function to load and display course details
async function loadCourseDetails() {
  const courseId = getCourseIdFromURL();
  
  if (!courseId) {
    showError('No course ID provided');
    return;
  }
  
  try {
    // Check if user is authenticated
    const user = auth.currentUser;
    if (!user) {
      console.log('No user is signed in');
      redirectToLogin();
      return;
    }
    
    // Get course document reference
    const courseRef = doc(db, 'courses', courseId);
    const courseSnap = await getDoc(courseRef);
    
    if (!courseSnap.exists()) {
      showError('Course not found');
      return;
    }
    
    const courseData = courseSnap.data();
    
    // Verify this course belongs to the current instructor
    if (courseData.instructorId !== user.uid) {
      showError('You do not have permission to view this course');
      return;
    }
    
    // Display course information
    displayCourseInfo(courseId, courseData);
    
    // Load materials
    if (courseData.materials && Array.isArray(courseData.materials)) {
      displayMaterials(courseData.materials);
    } else {
      loadMaterialsFromCollection(courseId);
    }
    
    // Load students
    loadStudents(courseId, courseData);
    
  } catch (error) {
    console.error('Error loading course details:', error);
    showError('Failed to load course details. Please try again later.');
  }
}

// Function to display course information
function displayCourseInfo(courseId, course) {
  // Set course title and description
  courseTitle.textContent = course.title || 'Untitled Course';
  courseDescription.textContent = course.description || 'No description available';
  
  // Set course details
  courseStartDate.textContent = formatDate(course.courseStartDate);
  courseEndDate.textContent = formatDate(course.courseEndDate);
  courseDuration.textContent = course.duration || 'Not specified';
  courseStudents.textContent = course.currentStudents || '0';
  courseRoom.textContent = course.roomNumber || 'Not assigned';
  
  // Determine course status
  const isActive = isCourseActive(course.courseStartDate, course.courseEndDate);
  courseStatus.innerHTML = isActive 
    ? '<span class="badge bg-success">Active</span>' 
    : '<span class="badge bg-secondary">Not Active</span>';
  
  // Update links
  addMaterialLink.href = `instructor-add-material.html?id=${courseId}`;
  attendanceLink.href = `instructor-attendance.html?id=${courseId}`;
}

// Function to display materials
function displayMaterials(materials) {
  materialsTable.innerHTML = '';
  
  if (!materials || materials.length === 0) {
    materialsTable.innerHTML = '<tr><td colspan="5" class="text-center">No materials available</td></tr>';
    return;
  }
  
  materials.forEach((material, index) => {
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td>${material.title || 'Untitled Material'}</td>
      <td>${material.type || 'Document'}</td>
      <td>${formatDate(material.uploadDate) || 'Unknown'}</td>
      <td>${material.size || 'N/A'}</td>
      <td>
        <a href="${material.url}" class="btn btn-sm btn-primary" target="_blank">
          <i class="fa fa-download"></i> Download
        </a>
        <button class="btn btn-sm btn-danger delete-material" data-index="${index}">
          <i class="fa fa-trash"></i> Delete
        </button>
      </td>
    `;
    
    materialsTable.appendChild(row);
  });
  
  // Add event listeners for delete buttons
  document.querySelectorAll('.delete-material').forEach(button => {
    button.addEventListener('click', function() {
      const materialIndex = this.getAttribute('data-index');
      // Implement delete functionality here
      alert(`Delete material at index ${materialIndex}`);
    });
  });
}

// Function to load materials from a separate collection if they exist
async function loadMaterialsFromCollection(courseId) {
  try {
    const materialsRef = collection(db, 'courses', courseId, 'materials');
    const materialsSnapshot = await getDocs(materialsRef);
    
    if (materialsSnapshot.empty) {
      materialsTable.innerHTML = '<tr><td colspan="5" class="text-center">No materials available</td></tr>';
      return;
    }
    
    materialsTable.innerHTML = '';
    materialsSnapshot.forEach((doc) => {
      const material = doc.data();
      const row = document.createElement('tr');
      
      row.innerHTML = `
        <td>${material.title || 'Untitled Material'}</td>
        <td>${material.type || 'Document'}</td>
        <td>${formatDate(material.uploadDate) || 'Unknown'}</td>
        <td>${material.size || 'N/A'}</td>
        <td>
          <a href="${material.url}" class="btn btn-sm btn-primary" target="_blank">
            <i class="fa fa-download"></i> Download
          </a>
          <button class="btn btn-sm btn-danger delete-material" data-id="${doc.id}">
            <i class="fa fa-trash"></i> Delete
          </button>
        </td>
      `;
      
      materialsTable.appendChild(row);
    });
    
    // Add event listeners for delete buttons
    document.querySelectorAll('.delete-material').forEach(button => {
      button.addEventListener('click', function() {
        const materialId = this.getAttribute('data-id');
        // Implement delete functionality here
        alert(`Delete material with ID ${materialId}`);
      });
    });
    
  } catch (error) {
    console.error('Error loading materials:', error);
    materialsTable.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error loading materials</td></tr>';
  }
}

// Function to load students
async function loadStudents(courseId, courseData) {
  try {
    // Try to get students from a students subcollection
    const studentsRef = collection(db, 'courses', courseId, 'students');
    const studentsSnapshot = await getDocs(studentsRef);
    
    if (!studentsSnapshot.empty) {
      // Display students from subcollection
      studentsTable.innerHTML = '';
      studentsSnapshot.forEach((doc) => {
        const student = doc.data();
        addStudentRow(student, doc.id);
      });
      return;
    }
    
    // If no subcollection, try to get students from a separate collection
    const allStudentsRef = collection(db, 'students');
    const q = query(allStudentsRef, where('enrolledCourses', 'array-contains', courseId));
    const allStudentsSnapshot = await getDocs(q);
    
    if (!allStudentsSnapshot.empty) {
      // Display students from main collection
      studentsTable.innerHTML = '';
      allStudentsSnapshot.forEach((doc) => {
        const student = doc.data();
        addStudentRow(student, doc.id);
      });
      return;
    }
    
    // If no students found in either location
    studentsTable.innerHTML = '<tr><td colspan="5" class="text-center">No students enrolled</td></tr>';
    
  } catch (error) {
    console.error('Error loading students:', error);
    studentsTable.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error loading students</td></tr>';
  }
}

// Function to add a student row to the table
function addStudentRow(student, studentId) {
  const row = document.createElement('tr');
  
  row.innerHTML = `
    <td>${student.studentId || studentId}</td>
    <td>${student.name || 'Unknown'}</td>
    <td>${student.email || 'No email'}</td>
    <td>${student.phone || 'No phone'}</td>
    <td>
      <a href="admin-student-details.html?id=${studentId}" class="btn btn-sm btn-primary">
        <i class="fa fa-eye"></i> View
      </a>
    </td>
  `;
  
  studentsTable.appendChild(row);
}

// Function to show error message
function showError(message) {
  courseTitle.textContent = 'Error';
  courseDescription.textContent = message;
  courseDescription.classList.add('text-danger');
  
  // Hide loading indicators and show error message in tables
  const errorRow = '<tr><td colspan="5" class="text-center text-danger">Error: ' + message + '</td></tr>';
  materialsTable.innerHTML = errorRow;
  studentsTable.innerHTML = errorRow;
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
      // User is signed in, load course details
      loadCourseDetails();
    } else {
      // User is signed out, redirect to login
      redirectToLogin();
    }
  });
});
