// Firebase configuration for admin dashboard
// admin-dashboard.js - Handles dashboard counters and statistics

document.addEventListener('DOMContentLoaded', function() {
  // Check authentication status
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in, load dashboard data
      loadDashboardData();
    } else {
      // User is signed out, redirect to login or load demo data
      console.log("Not logged in, but still loading dashboard data for demo");
      loadDashboardData(); // For demonstration purposes
    }
  });
});

// Function to load dashboard data
function loadDashboardData() {
  const db = firebase.firestore();
  
  // Load course count
  updateCourseCount(db);
  
  // Load student count
  updateStudentCount(db);
  
  // Load admission count
  updateAdmissionCount(db);
  
  // Load student details table
  loadStudentDetails(db);
  
  // Setup smooth scroll to student table
  setupSmoothScroll();
}

// Setup smooth scrolling to student table
function setupSmoothScroll() {
  const scrollToStudentsBtn = document.querySelector('.scroll-to-students');
  if (scrollToStudentsBtn) {
    scrollToStudentsBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const studentsTable = document.getElementById('students-table');
      if (studentsTable) {
        studentsTable.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
}

// Update the course count from Firebase
async function updateCourseCount(db) {
  try {
    const courseCounter = document.querySelector('.dash-book.dash-b-1 h4');
    if (!courseCounter) return;
    
    // Show loading state
    courseCounter.textContent = "Loading...";
    
    // Count documents in the courses collection (excluding trashed courses)
    const coursesQuery = db.collection("courses").where("trashed", "!=", true);
    const snapshot = await coursesQuery.get();
    
    // Fallback for courses that don't have the trashed field
    const notTrashedCount = snapshot.size;
    
    // Get total courses without any filter as a fallback
    const totalQuery = db.collection("courses");
    const totalSnapshot = await totalQuery.get();
    const totalCount = totalSnapshot.size;
    
    // If filtering worked properly and got some results, use that count
    // Otherwise fall back to total count
    const finalCount = notTrashedCount > 0 ? notTrashedCount : totalCount;
    
    // Update the counter
    courseCounter.textContent = finalCount;
    console.log(`Updated course count: ${finalCount}`);
    
  } catch (error) {
    console.error("Error updating course count:", error);
    
    // Show error in counter
    const courseCounter = document.querySelector('.dash-book.dash-b-1 h4');
    if (courseCounter) {
      courseCounter.textContent = "Error";
    }
  }
}



// Update the student count from Firebase - prioritize users with role="student"
async function updateStudentCount(db) {
  try {
    const studentCounter = document.querySelector('.dash-book.dash-b-3 h4');
    if (!studentCounter) return;
    
    // Show loading state
    studentCounter.textContent = "Loading...";
    
    let totalStudents = 0;
    
    // First try the users collection with role="student" (preferred source)
    try {
      const usersQuery = db.collection("users").where("role", "==", "Student");
      const usersSnapshot = await usersQuery.get();
      console.log(`Found ${usersSnapshot.size} users with role="Student"`);
      totalStudents += usersSnapshot.size;
    } catch (usersError) {
      console.error("Error querying users collection:", usersError);
    }
    
    // Check if we also have a separate students collection (for backward compatibility)
    try {
      const studentsQuery = db.collection("students");
      const studentsSnapshot = await studentsQuery.get();
      
      // If we found students AND we also found users with role="student", 
      // we need to avoid double-counting. Prioritize the users collection data.
      if (studentsSnapshot.size > 0 && totalStudents === 0) {
        totalStudents = studentsSnapshot.size;
        console.log(`Found ${studentsSnapshot.size} students in students collection`);
      } else if (studentsSnapshot.size > 0) {
        console.log(`Found ${studentsSnapshot.size} in students collection, but using users with role="student" to avoid duplication`);
      }
    } catch (studentsError) {
      console.error("Error querying students collection:", studentsError);
    }
    
    // Update the counter
    studentCounter.textContent = totalStudents;
    console.log(`Updated student count: ${totalStudents}`);
    
  } catch (error) {
    console.error("Error updating student count:", error);
    
    // Show error in counter
    const studentCounter = document.querySelector('.dash-book.dash-b-3 h4');
    if (studentCounter) {
      studentCounter.textContent = "Error";
    }
  }
}


// Update the admission count from Firebase
async function updateAdmissionCount(db) {
  try {
    const admissionCounter = document.querySelector('.dash-book.dash-b-2 h4');
    if (!admissionCounter) return;
    
    // Show loading state
    admissionCounter.textContent = "Loading...";
    
    // Count documents in the admissions or enrollments collection
    let count = 0;
    
    // Try different collection names
    try {
      const admissionsSnapshot = await db.collection("admissions").get();
      count = admissionsSnapshot.size;
    } catch (e) {
      console.log("No admissions collection found, trying enrollments...");
      try {
        const enrollmentsSnapshot = await db.collection("enrollments").get();
        count = enrollmentsSnapshot.size;
      } catch (e2) {
        console.log("No enrollments collection found, trying courseEnrollments...");
        try {
          const courseEnrollmentsSnapshot = await db.collection("courseEnrollments").get();
          count = courseEnrollmentsSnapshot.size;
        } catch (e3) {
          console.error("Could not find any enrollment collection");
        }
      }
    }
    
    // Update the counter with the found count
    admissionCounter.textContent = count;
    console.log(`Updated admission count: ${count}`);
    
  } catch (error) {
    console.error("Error updating admission count:", error);
    
    // Show error in counter
    const admissionCounter = document.querySelector('.dash-book.dash-b-2 h4');
    if (admissionCounter) {
      admissionCounter.textContent = "Error";
    }
  }
}

// Load student details from Firebase
async function loadStudentDetails(db) {
  const studentsTable = document.getElementById('students-table');
  if (!studentsTable) return; // If table doesn't exist, exit
  
  const tableBody = studentsTable.querySelector('tbody');
  
  try {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p>Loading students...</p>
        </td>
      </tr>
    `;
    
    let students = [];
    
    // Get students from users collection with role="Student"
    try {
      const usersQuery = db.collection("users").where("role", "==", "Student");
      const usersSnapshot = await usersQuery.get();
      
      if (!usersSnapshot.empty) {
        usersSnapshot.forEach(doc => {
          const data = doc.data();
          students.push({
            id: doc.id,
            name: data.name || data.displayName || 'N/A',
            department: data.department || 'N/A',
            year: data.year || 'N/A',
            phoneNumber: data.phoneNumber || data.phone || 'N/A',
            universityID: data.universityID || data.studentID || 'N/A',
            email: data.email || 'N/A',
            source: 'users'
          });
        });
      }
    } catch (error) {
      console.error("Error fetching students from users collection:", error);
    }
    
    // If no students found in users collection, or we want to include both sources,
    // also check the students collection
    if (students.length === 0) {
      try {
        const studentsSnapshot = await db.collection("students").get();
        
        if (!studentsSnapshot.empty) {
          studentsSnapshot.forEach(doc => {
            const data = doc.data();
            students.push({
              id: doc.id,
              name: data.name || data.displayName || 'N/A',
              department: data.department || 'N/A',
              year: data.year || 'N/A',
              phoneNumber: data.phoneNumber || data.phone || 'N/A',
              universityID: data.universityID || data.studentID || 'N/A',
              email: data.email || 'N/A',
              source: 'students'
            });
          });
        }
      } catch (error) {
        console.error("Error fetching from students collection:", error);
      }
    }
    
    // Display students or show "No students found" message
    if (students.length > 0) {
      // Sort students by name
      students.sort((a, b) => a.name.localeCompare(b.name));
      
      // Clear loading message
      tableBody.innerHTML = '';
      
      // Add each student to the table
      students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `          <td>${student.name}</td>
          <td>${student.department}</td>
          <td>${student.year}</td>
          <td>${student.phoneNumber}</td>
          <td>${student.universityID}</td>
          <td>${student.email}</td>
          <td>
            <a href="admin-student-edit.html?id=${student.id}&source=${student.source}" class="ad-st-view">Edit</a>
            <a href="#" class="ad-st-view delete-student" data-id="${student.id}" data-source="${student.source}">Delete</a>
          </td>
        `;
        tableBody.appendChild(row);
      });
        // Add event listeners to delete links
      document.querySelectorAll('.delete-student').forEach(link => {
        link.addEventListener('click', function(e) {
          e.preventDefault(); // Prevent default link behavior
          const studentId = this.getAttribute('data-id');
          const source = this.getAttribute('data-source');
          deleteStudent(db, studentId, source);
        });
      });
      
    } else {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center">No students found</td>
        </tr>
      `;
    }
  } catch (error) {
    console.error("Error loading student details:", error);
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center">Error loading students: ${error.message}</td>
      </tr>
    `;
  }
}

// Function to delete a student
async function deleteStudent(db, studentId, source) {
  if (!studentId || !source) return;
  
  // Confirm deletion
  if (!confirm('Are you sure you want to delete this student?')) {
    return;
  }
  
  try {
    // Delete from appropriate collection based on source
    const collection = source === 'users' ? 'users' : 'students';
    await db.collection(collection).doc(studentId).delete();
    
    // Reload student data
    loadStudentDetails(db);
    
    // Also update the counter
    updateStudentCount(db);
    
    alert('Student deleted successfully');
  } catch (error) {
    console.error("Error deleting student:", error);
    alert(`Error deleting student: ${error.message}`);
  }
}
