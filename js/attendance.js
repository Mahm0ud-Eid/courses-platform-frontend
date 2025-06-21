// Attendance management script

// Initialize data structures
let courseStudents = {}; // Will store students by course ID
let attendanceData = {}; // Will store attendance records
let currentDate = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD format

// Debugging functions
function checkSystemStatus() {
    console.log('Checking attendance system status...');
    
    // Check DOM elements
    const elements = [
        'course-select', 
        'attendance-date', 
        'load-attendance', 
        'save-attendance', 
        'student-list',
        'history-list',
        'present-count',
        'absent-count',
        'not-marked-count'
    ];
    
    let allElementsFound = true;
    
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            console.log(`✅ Element #${id} found`);
        } else {
            console.log(`❌ Element #${id} NOT found`);
            allElementsFound = false;
        }
    });
    
    console.log('Data structures:', {
        courseStudentsInitialized: Object.keys(courseStudents).length > 0,
        attendanceDataInitialized: Object.keys(attendanceData).length > 0
    });
    
    return allElementsFound;
}

// Set the default date to today
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded for Attendance System');
    
    try {
        // Set today's date as default
        const dateElement = document.getElementById('attendance-date');
        if (dateElement) {
            dateElement.value = currentDate;
        } else {
            console.error('Attendance date element not found');
        }
        
        // Initialize event listeners
        initializeEventListeners();
        
        // Mock data for demonstration
        initializeMockData();
        
        // Check system status
        const systemStatus = checkSystemStatus();
        console.log('System status check complete. All elements found:', systemStatus);
        
        // Hide preloader if it exists
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.style.display = 'none';
        }
    } catch (error) {
        console.error('Error initializing attendance system:', error);
        alert('There was an error loading the attendance system. Please try refreshing the page.');
    }
});

function initializeEventListeners() {
    try {
        // Course selection change
        const courseSelect = document.getElementById('course-select');
        if (courseSelect) {
            courseSelect.addEventListener('change', function() {
                const courseId = this.value;
                if (courseId) {
                    loadCourseStudents(courseId);
                    loadAttendanceHistory(courseId);
                } else {
                    clearStudentList();
                    clearAttendanceHistory();
                }
            });
        } else {
            console.error('Course select element not found');
        }
        
        // Date selection change
        const dateSelect = document.getElementById('attendance-date');
        if (dateSelect) {
            dateSelect.addEventListener('change', function() {
                currentDate = this.value;
            });
        } else {
            console.error('Date select element not found');
        }
        
        // Load attendance button click
        const loadButton = document.getElementById('load-attendance');
        if (loadButton) {
            loadButton.addEventListener('click', function() {
                const courseId = document.getElementById('course-select').value;
                if (courseId) {
                    loadAttendanceForDate(courseId, currentDate);
                } else {
                    alert('Please select a course first');
                }
            });
        } else {
            console.error('Load attendance button not found');
        }
        
        // Save attendance button click
        const saveButton = document.getElementById('save-attendance');
        if (saveButton) {
            saveButton.addEventListener('click', function() {
                const courseId = document.getElementById('course-select').value;
                if (courseId) {
                    saveAttendance(courseId, currentDate);
                } else {
                    alert('Please select a course first');
                }
            });
        } else {
            console.error('Save attendance button not found');
        }
        
        console.log('All attendance event listeners initialized successfully');
    } catch (error) {
        console.error('Error setting up event listeners:', error);
    }
}

// Load mock data for demonstration
function initializeMockData() {
    // Mock students data for each course
    courseStudents = {
        "1": [
            { id: "S1001", name: "John Smith", email: "john.smith@example.com" },
            { id: "S1002", name: "Emily Johnson", email: "emily.johnson@example.com" },
            { id: "S1003", name: "Michael Brown", email: "michael.brown@example.com" },
            { id: "S1004", name: "Sarah Davis", email: "sarah.davis@example.com" },
            { id: "S1005", name: "David Wilson", email: "david.wilson@example.com" }
        ],
        "2": [
            { id: "S2001", name: "Jennifer Lee", email: "jennifer.lee@example.com" },
            { id: "S2002", name: "Robert Martinez", email: "robert.martinez@example.com" },
            { id: "S2003", name: "Lisa Anderson", email: "lisa.anderson@example.com" },
            { id: "S2004", name: "James Taylor", email: "james.taylor@example.com" }
        ],
        "3": [
            { id: "S3001", name: "Patricia Thomas", email: "patricia.thomas@example.com" },
            { id: "S3002", name: "Daniel Jackson", email: "daniel.jackson@example.com" },
            { id: "S3003", name: "Nancy White", email: "nancy.white@example.com" },
            { id: "S3004", name: "Mark Harris", email: "mark.harris@example.com" },
            { id: "S3005", name: "Karen Martin", email: "karen.martin@example.com" },
            { id: "S3006", name: "Paul Thompson", email: "paul.thompson@example.com" }
        ]
    };
    
    // Mock attendance history data
    attendanceData = {
        "1": {
            "2025-06-20": {
                "S1001": { status: "present", notes: "" },
                "S1002": { status: "present", notes: "" },
                "S1003": { status: "absent", notes: "Sick leave" },
                "S1004": { status: "present", notes: "" },
                "S1005": { status: "present", notes: "" }
            },
            "2025-06-19": {
                "S1001": { status: "present", notes: "" },
                "S1002": { status: "absent", notes: "Family emergency" },
                "S1003": { status: "present", notes: "" },
                "S1004": { status: "present", notes: "" },
                "S1005": { status: "present", notes: "" }
            }
        },
        "2": {
            "2025-06-20": {
                "S2001": { status: "present", notes: "" },
                "S2002": { status: "present", notes: "" },
                "S2003": { status: "present", notes: "" },
                "S2004": { status: "absent", notes: "Doctor appointment" }
            }
        },
        "3": {
            "2025-06-18": {
                "S3001": { status: "present", notes: "" },
                "S3002": { status: "present", notes: "" },
                "S3003": { status: "absent", notes: "" },
                "S3004": { status: "present", notes: "" },
                "S3005": { status: "present", notes: "" },
                "S3006": { status: "present", notes: "" }
            }
        }
    };
}

function loadCourseStudents(courseId) {
    // Get students for the selected course
    const students = courseStudents[courseId] || [];
    
    // Clear and populate the student list
    const studentListElement = document.getElementById('student-list');
    studentListElement.innerHTML = '';
    
    if (students.length === 0) {
        studentListElement.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    <div class="empty-state">
                        <i class="fa fa-users fa-3x text-muted"></i>
                        <p>No students found for this course</p>
                    </div>
                </td>
            </tr>`;
        return;
    }
    
    students.forEach((student, index) => {
        const row = document.createElement('tr');
        row.dataset.studentId = student.id;
        row.className = index % 2 === 0 ? 'even-row' : 'odd-row';
        
        row.innerHTML = `
            <td><span class="student-id-badge">${student.id}</span></td>
            <td>
                <div class="student-name">${student.name}</div>
            </td>
            <td>${student.email}</td>
            <td>                <div class="attendance-actions">
                    <button type="button" class="btn attendance-btn present" onclick="markAttendance('${student.id}', 'present')">
                        <i class="fa fa-check-circle"></i> Present
                    </button>
                    <button type="button" class="btn attendance-btn absent" onclick="markAttendance('${student.id}', 'absent')">
                        <i class="fa fa-times-circle"></i> Absent
                    </button>
                </div>
            </td>
            <td class="attendance-status status-not-marked"><span class="status-icon"><i class="fa fa-exclamation-circle"></i></span> Not marked</td>
            <td>
                <input type="text" class="form-control notes-input" placeholder="Add notes (optional)">
            </td>
        `;
        
        studentListElement.appendChild(row);
    });
    
    // Update attendance count
    updateAttendanceCounts();
}

function loadAttendanceForDate(courseId, date) {
    // Check if attendance data exists for this course and date
    const courseAttendance = attendanceData[courseId] || {};
    const dateAttendance = courseAttendance[date] || {};
    
    // Get all student rows
    const studentRows = document.querySelectorAll('#student-list tr[data-student-id]');
    
    // Reset all rows first
    studentRows.forEach(row => {
        const studentId = row.dataset.studentId;
        const presentBtn = row.querySelector('.attendance-btn.present');
        const absentBtn = row.querySelector('.attendance-btn.absent');
        const statusCell = row.querySelector('.attendance-status');
        const notesInput = row.querySelector('.notes-input');
        
        // Remove active class from buttons
        presentBtn.classList.remove('active');
        absentBtn.classList.remove('active');        // Reset status
        statusCell.innerHTML = '<span class="status-icon"><i class="fa fa-exclamation-circle"></i></span> Not marked';
        statusCell.classList.remove('status-present', 'status-absent');
        statusCell.classList.add('status-not-marked');
        
        // Clear notes
        notesInput.value = '';
        
        // If we have attendance data for this student on this date, apply it
        if (dateAttendance[studentId]) {
            const status = dateAttendance[studentId].status;
            const notes = dateAttendance[studentId].notes || '';
              if (status === 'present') {
                presentBtn.classList.add('active');
                statusCell.innerHTML = '<span class="status-icon"><i class="fa fa-check-circle"></i></span> Present';
                statusCell.classList.add('status-present');
            } else if (status === 'absent') {
                absentBtn.classList.add('active');
                statusCell.innerHTML = '<span class="status-icon"><i class="fa fa-times-circle"></i></span> Absent';
                statusCell.classList.add('status-absent');
            }
            
            notesInput.value = notes;
        }
    });
    
    // Update the counts
    updateAttendanceCounts();
}

function markAttendance(studentId, status) {
    try {
        console.log(`Marking attendance for student ${studentId} as ${status}`);
        
        // Find the student row
        const studentRow = document.querySelector(`#student-list tr[data-student-id="${studentId}"]`);
        if (!studentRow) {
            console.error(`Student row not found for ID: ${studentId}`);
            return;
        }
        
        // Get the elements
        const presentBtn = studentRow.querySelector('.attendance-btn.present');
        const absentBtn = studentRow.querySelector('.attendance-btn.absent');
        const statusCell = studentRow.querySelector('.attendance-status');
        
        if (!presentBtn || !absentBtn || !statusCell) {
            console.error('Could not find all required elements in student row');
            return;
        }
        
        // Add animation class
        studentRow.classList.add('row-highlight');
        setTimeout(() => {
            studentRow.classList.remove('row-highlight');
        }, 500);
          // Reset button states
        presentBtn.classList.remove('active');
        absentBtn.classList.remove('active');
        statusCell.classList.remove('status-present', 'status-absent', 'status-not-marked');
          // Set the new status
        if (status === 'present') {
            presentBtn.classList.add('active');
            statusCell.innerHTML = '<span class="status-icon"><i class="fa fa-check-circle"></i></span> Present';
            statusCell.classList.add('status-present');
            
            // Animation for visual feedback
            presentBtn.classList.add('btn-pulse');
            statusCell.classList.add('btn-pulse');
            setTimeout(() => {
                presentBtn.classList.remove('btn-pulse');
                statusCell.classList.remove('btn-pulse');
            }, 700);
            
        } else if (status === 'absent') {
            absentBtn.classList.add('active');
            statusCell.innerHTML = '<span class="status-icon"><i class="fa fa-times-circle"></i></span> Absent';
            statusCell.classList.add('status-absent');
            
            // Animation for visual feedback
            absentBtn.classList.add('btn-pulse');
            statusCell.classList.add('btn-pulse');
            setTimeout(() => {
                absentBtn.classList.remove('btn-pulse');
                statusCell.classList.remove('btn-pulse');
            }, 700);
        }
        
        // Update the counts
        updateAttendanceCounts();
    } catch (error) {
        console.error('Error marking attendance:', error);
    }
}



function updateAttendanceCounts() {
    // Get counts
    const totalRows = document.querySelectorAll('#student-list tr[data-student-id]').length;
    const presentCount = document.querySelectorAll('#student-list .attendance-status.status-present').length;
    const absentCount = document.querySelectorAll('#student-list .attendance-status.status-absent').length;
    const notMarkedCount = totalRows - presentCount - absentCount;
    
    // Update the counters
    document.getElementById('present-count').textContent = presentCount;
    document.getElementById('absent-count').textContent = absentCount;
    document.getElementById('not-marked-count').textContent = notMarkedCount;
}

function saveAttendance(courseId, date) {
    // Initialize the structure if it doesn't exist
    if (!attendanceData[courseId]) {
        attendanceData[courseId] = {};
    }
    
    // Create or update the attendance record for this date
    attendanceData[courseId][date] = {};
    
    // Get all student rows
    const studentRows = document.querySelectorAll('#student-list tr[data-student-id]');
    
    // Process each student's attendance
    let hasUnmarkedAttendance = false;
    
    studentRows.forEach(row => {
        const studentId = row.dataset.studentId;
        const presentBtn = row.querySelector('.attendance-btn.present');
        const absentBtn = row.querySelector('.attendance-btn.absent');
        const notesInput = row.querySelector('.notes-input');
        
        let status = null;
        if (presentBtn.classList.contains('active')) {
            status = 'present';
        } else if (absentBtn.classList.contains('active')) {
            status = 'absent';
        } else {
            hasUnmarkedAttendance = true;
        }
        
        if (status) {
            // Save the attendance status and notes
            attendanceData[courseId][date][studentId] = {
                status: status,
                notes: notesInput.value.trim()
            };
        }
    });
    
    // Warn if any attendance is not marked
    if (hasUnmarkedAttendance) {
        if (!confirm('Some students have no attendance marked. Continue saving?')) {
            return;
        }
    }
    
    // In a real system, we would save to a database here
    
    // Update the attendance history
    loadAttendanceHistory(courseId);
    
    // Show success message
    alert('Attendance saved successfully!');
}

function loadAttendanceHistory(courseId) {
    // Get attendance data for this course
    const courseAttendance = attendanceData[courseId] || {};
    const dates = Object.keys(courseAttendance).sort().reverse(); // Sort by date, most recent first
    
    // Get the history list element
    const historyListElement = document.getElementById('history-list');
    historyListElement.innerHTML = '';
    
    if (dates.length === 0) {
        historyListElement.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    <div class="empty-state">
                        <i class="fa fa-calendar fa-3x text-muted"></i>
                        <p>No attendance records found for this course</p>
                        <small>Records will appear here after you save attendance</small>
                    </div>
                </td>
            </tr>`;
        return;
    }
    
    // Process each date
    dates.forEach((date, index) => {
        const dateAttendance = courseAttendance[date];
        const studentIds = Object.keys(dateAttendance);
        
        // Calculate statistics
        const totalStudents = studentIds.length;
        let presentCount = 0;
        
        studentIds.forEach(studentId => {
            if (dateAttendance[studentId].status === 'present') {
                presentCount++;
            }
        });
        
        const absentCount = totalStudents - presentCount;
        const attendancePercentage = totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : '0.0';
        
        // Create the history row
        const row = document.createElement('tr');
        row.className = index % 2 === 0 ? 'even-row' : 'odd-row';
        
        // Calculate class for the percentage
        let percentageClass = 'percentage-average';
        if (attendancePercentage >= 90) percentageClass = 'percentage-high';
        else if (attendancePercentage < 70) percentageClass = 'percentage-low';
        
        row.innerHTML = `
            <td>
                <div class="history-date">
                    <strong>${formatDate(date)}</strong>
                    <div class="date-indicator"></div>
                </div>
            </td>
            <td>${totalStudents}</td>
            <td><span class="badge bg-success">${presentCount}</span></td>
            <td><span class="badge bg-danger">${absentCount}</span></td>
            <td><div class="percentage-badge ${percentageClass}">${attendancePercentage}%</div></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-info view-btn" onclick="loadAttendanceForDateFromHistory('${courseId}', '${date}')">
                        <i class="fa fa-eye"></i> View
                    </button>
                    <button class="btn btn-sm btn-danger delete-btn" onclick="deleteAttendanceRecord('${courseId}', '${date}')">
                        <i class="fa fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        historyListElement.appendChild(row);
    });
}

function loadAttendanceForDateFromHistory(courseId, date) {
    // Set the date in the date picker
    document.getElementById('attendance-date').value = date;
    currentDate = date;
    
    // Load the attendance data
    loadAttendanceForDate(courseId, date);
}

function deleteAttendanceRecord(courseId, date) {
    if (confirm(`Are you sure you want to delete the attendance record for ${formatDate(date)}?`)) {
        // In a real system, we would delete from a database here
        
        // Delete from our local storage
        if (attendanceData[courseId] && attendanceData[courseId][date]) {
            delete attendanceData[courseId][date];
        }
        
        // Update the history
        loadAttendanceHistory(courseId);
    }
}

function clearStudentList() {
    const studentListElement = document.getElementById('student-list');
    studentListElement.innerHTML = `
        <tr>
            <td colspan="6" class="text-center">
                <div class="empty-state">
                    <i class="fa fa-users fa-3x text-muted"></i>
                    <p>Please select a course and date to view students</p>
                    <small>Use the dropdown and date picker above to get started</small>
                </div>
            </td>
        </tr>`;
    
    // Reset counters
    document.getElementById('present-count').textContent = '0';
    document.getElementById('absent-count').textContent = '0';
    document.getElementById('not-marked-count').textContent = '0';
}

function clearAttendanceHistory() {
    const historyListElement = document.getElementById('history-list');
    historyListElement.innerHTML = `
        <tr>
            <td colspan="6" class="text-center">
                <div class="empty-state">
                    <i class="fa fa-calendar fa-3x text-muted"></i>
                    <p>Select a course to view attendance history</p>
                </div>
            </td>
        </tr>`;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}
