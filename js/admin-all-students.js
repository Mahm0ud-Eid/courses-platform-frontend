// admin-all-students.js - Handles the all students page functionality

// Firebase configuration
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
      // User is signed in, load student data
      loadAllStudents();
    } else {
      // User is signed out, but still load for demo purposes
      console.log("Not logged in, but still loading student data for demo");
      loadAllStudents();
    }
  });
  
  // Setup search functionality
  setupSearchFunctionality();
  
  // Setup add student modal functionality
  setupAddStudentModal();
});

// Load all students from Firebase
async function loadAllStudents() {
  const db = firebase.firestore();
  const studentsTable = document.getElementById('students-table');
  if (!studentsTable) return;
  
  const tableBody = studentsTable.querySelector('tbody');
  
  try {
    // Show loading state
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
      
      console.log(`Found ${usersSnapshot.size} users with role="Student"`);
      
      if (!usersSnapshot.empty) {
        usersSnapshot.forEach(doc => {
          const data = doc.data();
          students.push({
            id: doc.id,
            name: data.name || data.displayName || data.fullName || 'N/A',
            department: data.department || 'N/A',
            year: data.year || data.academicYear || 'N/A',
            phoneNumber: data.phoneNumber || data.phone || 'N/A',
            universityID: data.universityID || data.studentID || data.id || 'N/A',
            email: data.email || 'N/A',
            source: 'users'
          });
        });
      }
    } catch (error) {
      console.error("Error fetching students from users collection:", error);
    }
    
    // If no students found in users collection, also check students collection
    if (students.length === 0) {
      try {
        const studentsSnapshot = await db.collection("students").get();
        
        console.log(`Found ${studentsSnapshot.size} students in students collection`);
        
        if (!studentsSnapshot.empty) {
          studentsSnapshot.forEach(doc => {
            const data = doc.data();
            students.push({
              id: doc.id,
              name: data.name || data.displayName || data.fullName || 'N/A',
              department: data.department || 'N/A',
              year: data.year || data.academicYear || 'N/A',
              phoneNumber: data.phoneNumber || data.phone || 'N/A',
              universityID: data.universityID || data.studentID || data.id || 'N/A',
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
        row.innerHTML = `
          <td>
            <span class="list-enq-name">${student.name}</span>
          </td>
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
          e.preventDefault();
          const studentId = this.getAttribute('data-id');
          const source = this.getAttribute('data-source');
          deleteStudent(db, studentId, source);
        });
      });
      
      console.log(`Loaded ${students.length} students successfully`);
      
    } else {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center">
            <p>No students found</p>
            <p class="text-muted">Students with role "Student" will appear here</p>
          </td>
        </tr>
      `;
    }
  } catch (error) {
    console.error("Error loading student details:", error);
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-danger">
          Error loading students: ${error.message}
        </td>
      </tr>
    `;
  }
}

// Function to delete a student
async function deleteStudent(db, studentId, source) {
  if (!studentId || !source) return;
  
  // Use SweetAlert2 for better confirmation dialog
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!'
  });
  
  if (result.isConfirmed) {
    try {
      // Delete from appropriate collection based on source
      const collection = source === 'users' ? 'users' : 'students';
      await db.collection(collection).doc(studentId).delete();
      
      // Show success message
      Swal.fire(
        'Deleted!',
        'Student has been deleted.',
        'success'
      );
      
      // Reload student data
      loadAllStudents();
      
    } catch (error) {
      console.error("Error deleting student:", error);
      Swal.fire(
        'Error!',
        `Error deleting student: ${error.message}`,
        'error'
      );
    }
  }
}

// Setup search functionality
function setupSearchFunctionality() {
  const searchInput = document.querySelector('input[placeholder*="Search by student name"]');
  const searchButton = document.querySelector('.btn-primary');
    if (searchInput && searchButton) {
    // Search on button click
    searchButton.addEventListener('click', performFilter);
    
    // Search on Enter key press
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault(); // Prevent form submission
        performFilter();
      }
    });
      // Real-time search as user types (with debounce)
    let searchTimeout;
    searchInput.addEventListener('input', function() {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(performFilter, 300); // Use performFilter instead of performSearch
    });
    
    // Add clear search functionality
    searchInput.addEventListener('keyup', function(e) {
      // If user presses Escape or clears the input, show all students
      if (e.key === 'Escape' || this.value.trim() === '') {
        this.value = '';
        performFilter(); // Use performFilter instead of performSearch
      }
    });
    
    console.log('Search functionality initialized');
  } else {
    console.error('Search elements not found:', { searchInput, searchButton });
  }
  
  // Setup department filter
  setupDepartmentFilter();
}

// Setup department filter functionality
function setupDepartmentFilter() {
  // Create department filter dropdown
  createDepartmentFilter();
}

// Create department filter dropdown
function createDepartmentFilter() {
  const searchSection = document.querySelector('.post-filter-section .row');
  
  if (searchSection) {
    // Add department filter column
    const filterColumn = document.createElement('div');
    filterColumn.className = 'col-md-6 mb-3';
    filterColumn.innerHTML = `
      <div class="input-group">
        <select class="form-control" id="departmentFilter">
          <option value="">All Departments</option>
          <option value="Information Technology">Information Technology</option>
          <option value="Mechatronics">Mechatronics</option>
          <option value="Autotronics">Autotronics</option>
          <option value="Renewable Energy">Renewable Energy</option>
          <option value="O&P">O&P</option>
        </select>
        <button class="btn btn-secondary" type="button" id="clearFilterBtn">
          <i class="fa fa-times"></i> Clear
        </button>
      </div>
    `;
    
    // Insert after the search column
    const searchColumn = searchSection.querySelector('.col-md-6');
    if (searchColumn) {
      searchColumn.parentNode.insertBefore(filterColumn, searchColumn.nextSibling);
    }
    
    // Add event listeners
    const departmentFilter = document.getElementById('departmentFilter');
    const clearFilterBtn = document.getElementById('clearFilterBtn');
    
    if (departmentFilter) {
      departmentFilter.addEventListener('change', performFilter);
    }    if (clearFilterBtn) {
      clearFilterBtn.addEventListener('click', function() {
        departmentFilter.value = '';
        document.querySelector('input[placeholder*="Search by student name"]').value = '';
        performFilter();
      });
    }
  }
}

// Perform department filter operation
function performFilter() {
  const searchInput = document.querySelector('input[placeholder*="Search by student name"]');
  const departmentFilter = document.getElementById('departmentFilter');
  
  const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const selectedDepartment = departmentFilter ? departmentFilter.value : '';
  
  const tableRows = document.querySelectorAll('#students-table tbody tr');
  
  console.log(`Filtering by first letter(s): "${searchTerm}" and department: "${selectedDepartment}"`);
  
  let visibleCount = 0;
  
  tableRows.forEach(row => {
    // Skip loading/error rows or rows with only one cell (colspan)
    if (row.querySelector('.spinner-border') || row.cells.length < 7) {
      return;
    }
    
    // Get name and department from cells
    const name = (row.cells[0]?.textContent || '').toLowerCase().trim();
    const department = (row.cells[1]?.textContent || '').trim();
    
    // Check if name STARTS WITH the search term (first letter search)
    const matchesName = searchTerm === '' || name.startsWith(searchTerm);
    const matchesDepartment = selectedDepartment === '' || department === selectedDepartment;
    
    // Show/hide row based on both criteria
    if (matchesName && matchesDepartment) {
      row.style.display = '';
      visibleCount++;
    } else {
      row.style.display = 'none';
    }
  });
  
  console.log(`Filter completed. ${visibleCount} students match the criteria.`);
}

// Perform search operation
function performSearch() {
  const searchInput = document.querySelector('input[placeholder*="Search students"]');
  
  if (!searchInput) {
    console.error('Search input not found');
    return;
  }
  
  const searchTerm = searchInput.value.toLowerCase().trim();
  const tableRows = document.querySelectorAll('#students-table tbody tr');
  
  console.log(`Searching by name for: "${searchTerm}"`);
  console.log(`Found ${tableRows.length} rows to search through`);
  
  let visibleCount = 0;
  
  tableRows.forEach(row => {
    // Skip loading/error rows or rows with only one cell (colspan)
    if (row.querySelector('.spinner-border') || row.cells.length < 7) {
      return;
    }
    
    // Get name from first cell only
    const name = (row.cells[0]?.textContent || '').toLowerCase();
    
    // Search ONLY by name
    const matchesSearch = searchTerm === '' || name.includes(searchTerm);
    
    // Show/hide row based on search term
    if (matchesSearch) {
      row.style.display = '';
      visibleCount++;
    } else {
      row.style.display = 'none';
    }
  });
  
  console.log(`Search completed. ${visibleCount} students match the name search.`);
  
  // Show a message if no results found
  if (visibleCount === 0 && searchTerm !== '') {
    console.log('No students found with that name');
  }
}

// Setup add student modal functionality
function setupAddStudentModal() {
  const saveStudentBtn = document.getElementById('saveStudentBtn');
  const addStudentForm = document.getElementById('addStudentForm');
  
  if (saveStudentBtn && addStudentForm) {
    saveStudentBtn.addEventListener('click', async function() {
      const formData = new FormData(addStudentForm);
      
      // Validate required fields
      const requiredFields = ['name', 'department', 'email', 'phone', 'id', 'year'];
      let isValid = true;
      
      for (const field of requiredFields) {
        if (!formData.get(field)) {
          isValid = false;
          break;
        }
      }
      
      if (!isValid) {
        Swal.fire('Error!', 'Please fill in all required fields.', 'error');
        return;
      }
      
      try {
        const db = firebase.firestore();
        
        // Create student data object
        const studentData = {
          name: formData.get('name'),
          department: formData.get('department'),
          email: formData.get('email'),
          phoneNumber: formData.get('phone'),
          universityID: formData.get('id'),
          year: formData.get('year'),
          role: 'Student',
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Add to users collection with role="Student"
        await db.collection('users').add(studentData);
        
        // Show success message
        Swal.fire('Success!', 'Student added successfully.', 'success');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addStudentModal'));
        modal.hide();
        
        // Reset form
        addStudentForm.reset();
        
        // Reload students
        loadAllStudents();
        
      } catch (error) {
        console.error('Error adding student:', error);
        Swal.fire('Error!', `Error adding student: ${error.message}`, 'error');
      }
    });
  }
}
