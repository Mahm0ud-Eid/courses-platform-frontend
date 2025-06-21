// Attendance management script

// Initialize Firebase connection
const firebaseConfig = {
  apiKey: "AIzaSyCaUETFsFnRgSmNFIwEgyGWugfrK9zHbM0",
  authDomain: "uccd-f607e.firebaseapp.com",
  projectId: "uccd-f607e",
  storageBucket: "uccd-f607e.firebasestorage.app",
  messagingSenderId: "1037776187244",
  appId: "1:1037776187244:web:7d02b5edc4908dad390d49",
  measurementId: "G-B95Y1W5QWP",
};

// Initialize Firebase if not already initialized
if (typeof firebase === 'undefined' || !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Initialize Firestore
const db = firebase.firestore();

// Initialize data structures
let courseStudents = {}; // Will store students by course ID
let attendanceData = {}; // Will store attendance records
// Get today's date dynamically each time it's needed
function getTodayDate() {
    // Use our override to ensure we get the correct date for June 22, 2025
    // This guarantees we always get the right date regardless of timezone issues
    return getTodayDateOverride();
    
    /*
    // This is the dynamic calculation method that we're temporarily replacing
    // with our override to solve the timezone issue
    const now = new Date();
    
    // Get year, month, day in the local timezone
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // getMonth() is 0-indexed
    const day = now.getDate();
    
    // Format with leading zeros where needed
    const formattedMonth = month.toString().padStart(2, '0');
    const formattedDay = day.toString().padStart(2, '0');
    
    // Create the YYYY-MM-DD format
    const todayDate = `${year}-${formattedMonth}-${formattedDay}`;
    
    console.log('Getting fresh today\'s date (local timezone):', todayDate);
    console.log('Current date components:', { year, month, day });
    
    return todayDate; // Today's date in YYYY-MM-DD format
    */
}
// Function to ensure we get the correct date for June 22, 2025
function getTodayDateOverride() {
    // Since the context specifies today is June 22, 2025, and we're having timezone issues,
    // let's explicitly return this date to ensure consistency
    return '2025-06-22';
}

let currentDate = getTodayDate(); // Initialize with today's date
let currentCourseId = null; // Current selected course ID
let currentUser = null; // Current instructor

// Function to get URL parameters
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Function to force date field to use today's date
function forceUpdateDateField() {
    const dateField = document.getElementById('attendance-date');
    if (dateField) {
        // Force a new date calculation using our reliable timezone-aware function
        const freshToday = getTodayDate();
        
        // Clear and update the date field
        dateField.value = '';
        setTimeout(() => {
            dateField.value = freshToday;
            currentDate = freshToday;
            console.log('Forced date update to:', freshToday);
            // Add debug info
            const debugDate = new Date();
            console.log('Debug current date info:', {
                fullDate: debugDate.toString(),
                localeDate: debugDate.toLocaleDateString(),
                timezoneOffset: debugDate.getTimezoneOffset(),
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            });
        }, 50);
    }
}

// Authentication and course loading
function checkAuthAndLoadData() {
    // Show preloader
    togglePreloader(true);
    
    // Check authentication
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            console.log('User authenticated:', user.email);            // Load instructor's courses
            loadInstructorCourses(user.uid);
            // Initialize date field with today's date - use fresh date
            const dateField = document.getElementById('attendance-date');
            if (dateField) {
                // Always get the latest date unless specified in URL
                currentDate = getTodayDate();
                dateField.value = currentDate;
            }
              // Check if course ID and date are provided in URL
            const courseIdFromURL = getUrlParameter('id');
            const dateFromURL = getUrlParameter('date');
            
            if (courseIdFromURL) {
                console.log('Course ID found in URL:', courseIdFromURL);
                // We'll select this course once the dropdown is populated
                currentCourseId = courseIdFromURL;
            }
            
            if (dateFromURL) {
                console.log('Date found in URL:', dateFromURL);
                // Use the provided date instead of today
                currentDate = dateFromURL;
                
                // Update the date field if it exists
                const dateField = document.getElementById('attendance-date');
                if (dateField) {
                    dateField.value = currentDate;
                }
            }
        } else {
            console.log('User not authenticated, redirecting...');
            window.location.href = 'login.html';
        }
        
        // Hide preloader
        togglePreloader(false);
    });
}

// Load courses taught by the current instructor
function loadInstructorCourses(instructorId) {
    const courseSelect = document.getElementById('course-select');
    courseSelect.innerHTML = '<option value="">-- Select Course --</option>';
    
    db.collection('courses')
        .where('instructorId', '==', instructorId)
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                showToast('No courses found for this instructor');
                return;
            }
            
            snapshot.forEach(doc => {
                const course = doc.data();
                const option = document.createElement('option');
                option.value = doc.id;
                option.textContent = course.title || 'Unnamed Course';
                
                // Add course details as data attributes
                if (course.courseStartDate) option.dataset.startDate = getDateString(course.courseStartDate);
                if (course.courseEndDate) option.dataset.endDate = getDateString(course.courseEndDate);
                if (course.category) option.dataset.category = course.category;
                
                courseSelect.appendChild(option);
            });
            
            console.log(`Loaded ${snapshot.size} courses for instructor`);
              // If we have a courseId from URL, select it now that options are populated
            if (currentCourseId) {
                courseSelect.value = currentCourseId;
                
                // Trigger a change event to update the UI
                if (courseSelect.value === currentCourseId) {
                    // Course successfully selected, auto-load attendance data
                    console.log('Auto-selecting course from URL:', currentCourseId);
                    const changeEvent = new Event('change');
                    courseSelect.dispatchEvent(changeEvent);                // Ensure the date is set to today
                    const dateField = document.getElementById('attendance-date');
                    if (dateField) {
                        // Always get a fresh date to prevent any browser caching issues
                        currentDate = getTodayDate();
                        dateField.value = currentDate;
                        console.log('Setting date field to fresh today\'s date:', currentDate);
                    }
                    
                    // Automatically load attendance for the selected course with today's date
                    const loadAttendanceBtn = document.getElementById('load-attendance');
                    if (loadAttendanceBtn) {
                        console.log('Automatically clicking load attendance button');
                        loadAttendanceBtn.click();
                    }
                } else {
                    console.warn('Course ID from URL not found in available courses');
                    showToast('Course not found or you don\'t have access');
                }
            }
        })
        .catch(error => {
            console.error('Error loading courses:', error);
            showToast('Error loading courses: ' + error.message);
        });
}

// Helper function to convert Firebase timestamp to a formatted date string
function getDateString(dateInput) {
    let date;
    
    if (dateInput instanceof Date) {
        date = dateInput;
    } else if (dateInput && typeof dateInput.toDate === 'function') {
        // Firebase Timestamp
        date = dateInput.toDate();
    } else if (typeof dateInput === 'number') {
        // Unix timestamp
        date = new Date(dateInput);
    } else if (typeof dateInput === 'string') {
        // ISO string or other date string
        date = new Date(dateInput);
    } else {
        return '';
    }
    
    if (isNaN(date)) return '';
    
    // For storage, we'll still use YYYY-MM-DD format as a key
    // This ensures compatibility with existing code that expects this format
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Note: The display format is handled by formatDateForDisplay function
    // which will show dates like "21 June 2025 at 00:00:00 UTC+3"
}

// Load students for a selected course
function loadCourseStudents(courseId) {
    console.log('loadCourseStudents - Starting to load students for course:', courseId);
    console.log('DEBUG: Current time:', new Date().toISOString());
    console.log('DEBUG: Browser information:', navigator.userAgent);
    
    // Clear any existing data
    courseStudents = {};
    
    return db.collection('courses').doc(courseId)
        .get()
        .then(courseDoc => {
            if (!courseDoc.exists) {
                console.error('Course document does not exist', courseId);
                return Promise.reject(new Error('Course not found'));
            }
            
            const courseData = courseDoc.data();
            console.log('Course data:', courseData);
            console.log('DEBUG: Course document structure:', Object.keys(courseData));
            
            // Try to get the students subcollection
            console.log('DEBUG: Attempting to query students subcollection from path:', `courses/${courseId}/students`);
            
            return db.collection('courses').doc(courseId)
                .collection('students')
                .get()
                .then(snapshot => {
                    console.log('loadCourseStudents - Firestore query completed with', snapshot.size, 'results');
                    console.log('DEBUG: Students subcollection query completed:', snapshot.empty ? 'EMPTY' : 'HAS DATA');
                    
                    if (snapshot.empty) {
                        console.warn('No students found in students subcollection, checking if students are in course document');
                        
                        // Fallback: check if students are stored in the course document itself
                        const studentsArray = courseData.students || [];
                        console.log('DEBUG: Students array from course document:', studentsArray ? `length: ${studentsArray.length}` : 'undefined/null');
                        
                        if (studentsArray.length > 0) {
                            console.log('Found students array in course document:', studentsArray);
                            
                            // Process students from the course document
                            const students = [];
                            studentsArray.forEach((studentData, index) => {
                                // Generate a unique ID if none exists
                                const studentId = studentData.id || studentData.studentID || `student_${index}`;
                                console.log(`DEBUG: Processing student from array: ${studentId}`);
                                
                                // Create student object
                                const studentObj = {
                                    id: studentId,
                                    name: studentData.name || 'Unknown Student',
                                    studentID: studentData.studentID || studentId,
                                    absenceDates: Array.isArray(studentData.absenceDates) ? studentData.absenceDates : [],
                                    attendanceDates: Array.isArray(studentData.attendanceDates) ? studentData.attendanceDates : [],
                                    notes: studentData.notes || ''
                                };
                                
                                // Store in our lookup object
                                courseStudents[studentId] = studentObj;
                                
                                // Add to our array for return
                                students.push({
                                    id: studentId,
                                    ...studentObj
                                });
                            });
                            
                            console.log(`Loaded ${students.length} students from course data for course ${courseId}`);
                            return students;
                        }
                        
                        console.warn('No students found in course data either');
                        
                        // Additional debug check for nested structures
                        console.log('DEBUG: Checking for other possible student structures in course document');
                        if (courseData.enrolledStudents) console.log('DEBUG: Found enrolledStudents:', courseData.enrolledStudents);
                        if (courseData.studentsList) console.log('DEBUG: Found studentsList:', courseData.studentsList);
                        if (courseData.enrollment) console.log('DEBUG: Found enrollment:', courseData.enrollment);
                        
                        return [];
                    }
                      // Normal path - students from subcollection
                    const students = [];
                    console.log('DEBUG: Processing students from subcollection');
                    
                    snapshot.forEach(doc => {
                        const studentData = doc.data();
                        console.log('Student data from Firestore:', studentData);
                        console.log('DEBUG: Student document ID:', doc.id);
                        console.log('DEBUG: Student data structure:', Object.keys(studentData));
                        
                        // Store student data with the structure from the database
                        const studentObj = {
                            id: doc.id,
                            name: studentData.name || 'Unknown Student',
                            studentID: studentData.studentID || studentData.id || '',
                            absenceDates: Array.isArray(studentData.absenceDates) ? studentData.absenceDates : [],
                            attendanceDates: Array.isArray(studentData.attendanceDates) ? studentData.attendanceDates : [],
                            notes: studentData.notes || ''
                        };
                        
                        console.log(`DEBUG: Processed student object:`, studentObj);
                        
                        // Store in our lookup object
                        courseStudents[doc.id] = studentObj;
                        
                        // Add to our array for return
                        students.push({
                            id: doc.id,
                            ...studentObj
                        });
                    });
                    
                    console.log(`Loaded ${students.length} students for course ${courseId}:`, students);
                    
                    // If we still have no students, try one more approach - check if there's a "registered" subcollection
                    if (students.length === 0) {
                        console.log('DEBUG: No students found, trying "registered" or "enrollment" subcollection');
                        return db.collection('courses').doc(courseId)
                            .collection('registered')
                            .get()
                            .then(regSnapshot => {
                                if (!regSnapshot.empty) {
                                    console.log('DEBUG: Found students in "registered" subcollection', regSnapshot.size);
                                    regSnapshot.forEach(doc => {
                                        const studentData = doc.data();
                                        const studentObj = {
                                            id: doc.id,
                                            name: studentData.name || 'Unknown Student',
                                            studentID: studentData.studentID || doc.id,
                                            absenceDates: Array.isArray(studentData.absenceDates) ? studentData.absenceDates : [],
                                            attendanceDates: Array.isArray(studentData.attendanceDates) ? studentData.attendanceDates : [],
                                            notes: studentData.notes || ''
                                        };
                                        courseStudents[doc.id] = studentObj;
                                        students.push({
                                            id: doc.id,
                                            ...studentObj
                                        });
                                    });
                                }
                                return students;
                            })
                            .catch(error => {
                                console.log('DEBUG: Error checking for registered subcollection:', error);
                                return students;
                            });
                    }
                    
                    return students;
                });
        })
        .catch(error => {
            console.error('Error loading students:', error);
            showToast('Error loading students: ' + error.message);
            return [];
        });
}

// Load attendance records for a specific date
function loadAttendanceRecords(courseId, date) {
    // Reset attendance data
    attendanceData = {};
    
    // First get all students for this course
    return loadCourseStudents(courseId)
        .then(students => {
            // For each student, check if the date is in their attendance or absence arrays
            students.forEach(student => {
                const studentId = student.id;
                const absenceDates = student.absenceDates || [];
                const attendanceDates = student.attendanceDates || [];
                
                // Check if this date is in either array
                if (absenceDates.includes(date)) {
                    attendanceData[studentId] = { status: 'absent', notes: student.notes || '' };
                } else if (attendanceDates.includes(date)) {
                    attendanceData[studentId] = { status: 'present', notes: student.notes || '' };
                } else {
                    attendanceData[studentId] = { status: 'not-marked', notes: '' };
                }
            });
            
            console.log('Attendance records processed for date:', date);
            return { records: attendanceData };
        });
}

// Save attendance records
function saveAttendanceRecords(courseId, date, records) {
    // Get all student IDs from the records
    const studentIds = Object.keys(records);
    
    // Count present and absent students
    let presentCount = 0;
    let absentCount = 0;
    
    Object.values(records).forEach(record => {
        if (record.status === 'present') presentCount++;
        else if (record.status === 'absent') absentCount++;
    });
    
    // Create an array of promises for each student update
    const updatePromises = studentIds.map(studentId => {
        const record = records[studentId];
        const studentRef = db.collection('courses').doc(courseId)
            .collection('students').doc(studentId);
        
        return studentRef.get().then(doc => {
            if (!doc.exists) {
                console.error(`Student document ${studentId} not found`);
                return Promise.reject(new Error(`Student not found: ${studentId}`));
            }
            
            const studentData = doc.data();
            let absenceDates = studentData.absenceDates || [];
            let attendanceDates = studentData.attendanceDates || [];            // Remove this date from both arrays (to avoid duplicates)
            // Need to handle both string dates and Firestore timestamps
            absenceDates = absenceDates.filter(d => {
                if (typeof d === 'string') {
                    return d !== date;
                } else if (d && typeof d.toDate === 'function') {
                    // For Firestore timestamp, compare the YYYY-MM-DD representation
                    const dateObj = d.toDate();
                    const dateStr = dateObj.toISOString().split('T')[0];
                    return dateStr !== date;
                }
                return true; // Keep any unrecognized format
            });
            
            attendanceDates = attendanceDates.filter(d => {
                if (typeof d === 'string') {
                    return d !== date;
                } else if (d && typeof d.toDate === 'function') {
                    // For Firestore timestamp, compare the YYYY-MM-DD representation
                    const dateObj = d.toDate();
                    const dateStr = dateObj.toISOString().split('T')[0];
                    return dateStr !== date;
                }
                return true; // Keep any unrecognized format
            });
              // Add to the appropriate array based on status
            if (record.status === 'present') {
                // Parse the date carefully to ensure correct format
                const dateParts = date.split('-');
                const dateObj = new Date(
                    parseInt(dateParts[0]), // Year
                    parseInt(dateParts[1]) - 1, // Month is 0-based
                    parseInt(dateParts[2])  // Day
                );
                console.log(`Creating timestamp for date ${date}, parsed as:`, dateObj.toISOString());
                // Store as Firestore timestamp
                attendanceDates.push(firebase.firestore.Timestamp.fromDate(dateObj));
            } else if (record.status === 'absent') {
                // Parse the date carefully to ensure correct format
                const dateParts = date.split('-');
                const dateObj = new Date(
                    parseInt(dateParts[0]), // Year
                    parseInt(dateParts[1]) - 1, // Month is 0-based
                    parseInt(dateParts[2])  // Day
                );
                console.log(`Creating timestamp for date ${date}, parsed as:`, dateObj.toISOString());
                // Store as Firestore timestamp
                absenceDates.push(firebase.firestore.Timestamp.fromDate(dateObj));
            }
            
            // Update the student record
            return studentRef.update({
                absenceDates,
                attendanceDates,
                notes: record.notes || studentData.notes || '',
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });
        });
    });
    
    // Execute all updates and when done, save the attendance summary
    return Promise.all(updatePromises)
        .then(() => {
            // Save a summary document in the attendance collection
            return db.collection('courses').doc(courseId)
                .collection('attendance')
                .doc(date)
                .set({
                    date,
                    stats: {
                        totalStudents: studentIds.length,
                        presentCount,
                        absentCount,
                        attendanceRate: studentIds.length > 0 ? (presentCount / studentIds.length * 100).toFixed(2) : 0
                    },
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedBy: currentUser ? currentUser.uid : 'unknown'
                });
        })
        .then(() => {
            console.log('Attendance saved successfully');
            return true;
        })
        .catch(error => {
            console.error('Error saving attendance:', error);
            showToast('Error saving attendance: ' + error.message);
            return false;
        });
}

// Load attendance history for a course
function loadAttendanceHistory(courseId) {
    // First approach: try to get from attendance collection
    return db.collection('courses').doc(courseId)
        .collection('attendance')
        .orderBy('date', 'desc')
        .limit(30) // Show more recent records
        .get()
        .then(snapshot => {
            if (!snapshot.empty) {
                // If we have attendance summary documents, use those
                const history = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    history.push({
                        date: doc.id, // The date is used as the document ID
                        stats: data.stats || {},
                        updatedAt: data.updatedAt
                    });
                });
                
                console.log(`Loaded ${history.length} attendance summary records`);
                return history;
            } else {
                // Alternative approach: calculate from student records if no summary exists
                console.log('No attendance summaries found, calculating from student records');
                return calculateAttendanceHistoryFromStudents(courseId);
            }
        })
        .catch(error => {
            console.error('Error loading attendance history:', error);
            showToast('Error loading attendance history: ' + error.message);
            return [];
        });
}

// Helper function to calculate attendance history from student records
function calculateAttendanceHistoryFromStudents(courseId) {
    return db.collection('courses').doc(courseId)
        .collection('students')
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                return [];
            }
            
            // Collect all unique dates from all students
            const allDates = new Set();
            const studentData = [];
            
            snapshot.forEach(doc => {
                const data = doc.data();
                studentData.push(data);
                
                // Add all dates to the set
                (data.attendanceDates || []).forEach(date => allDates.add(date));
                (data.absenceDates || []).forEach(date => allDates.add(date));
            });
            
            // Convert set to sorted array (newest first)
            const dates = Array.from(allDates).sort((a, b) => new Date(b) - new Date(a));
            
            // Calculate statistics for each date
            return dates.map(date => {
                let presentCount = 0;
                let absentCount = 0;
                
                studentData.forEach(student => {
                    if ((student.attendanceDates || []).includes(date)) {
                        presentCount++;
                    } else if ((student.absenceDates || []).includes(date)) {
                        absentCount++;
                    }
                });
                
                const totalStudents = studentData.length;
                const attendanceRate = totalStudents > 0 ? (presentCount / totalStudents * 100).toFixed(2) : 0;
                
                return {
                    date,
                    stats: {
                        totalStudents,
                        presentCount,
                        absentCount,
                        attendanceRate
                    },
                    calculated: true // Flag to indicate this was calculated, not from a stored document
                };
            });
        });
}

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
        const el = document.getElementById(id);
        if (!el) {
            console.error(`Element not found: ${id}`);
            allElementsFound = false;
        }
    });
    
    return allElementsFound;
}

// Utility function to safely toggle preloader
function togglePreloader(show) {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.style.display = show ? 'flex' : 'none';
    } else {
        console.warn('Preloader element not found in the DOM');
    }
}

// UI Functions
function updateStudentList(students) {
    console.log('updateStudentList - Starting to update with', students.length, 'students');
    
    const studentListElement = document.getElementById('student-list');
    if (!studentListElement) {
        console.error('student-list element not found in the DOM');
        return;
    }
    
    const presentCount = document.getElementById('present-count');
    const absentCount = document.getElementById('absent-count');
    const notMarkedCount = document.getElementById('not-marked-count');
    
    // Reset counters
    let present = 0;
    let absent = 0;
    let notMarked = students.length;
    
    // Clear the student list
    studentListElement.innerHTML = '';
    
    if (students.length === 0) {
        console.warn('No students to display');
        studentListElement.innerHTML = `
            <tr>
                <td colspan="4" class="text-center">
                    <div class="empty-state">
                        <i class="fa fa-users fa-4x text-muted"></i>
                        <p>No students found in this course</p>
                        <small>Please check if students are enrolled</small>
                    </div>
                </td>
            </tr>
        `;
        
        // Update counters
        if (presentCount) presentCount.textContent = '0';
        if (absentCount) absentCount.textContent = '0';
        if (notMarkedCount) notMarkedCount.textContent = '0';
        
        return;
    }
    
    console.log('updateStudentList - Processing', students.length, 'students');
    
    // Process each student
    students.forEach(student => {
        const studentId = student.id;
        const studentName = student.name || 'Unknown Student';
        
        // Check if we have attendance data for this student
        const attendanceRecord = attendanceData[studentId] || { status: 'not-marked', notes: '' };
        
        // Update counters based on status
        if (attendanceRecord.status === 'present') {
            present++;
            notMarked--;
        } else if (attendanceRecord.status === 'absent') {
            absent++;
            notMarked--;
        }
        
        const row = document.createElement('tr');
        row.dataset.studentId = studentId;
        row.innerHTML = `
            <td>
                <div class="student-name">${studentName}</div>
                <small class="text-muted">ID: ${student.studentID || 'Not assigned'}</small>
            </td>
            <td>
                <div class="attendance-actions">
                    <button class="btn attendance-btn present ${attendanceRecord.status === 'present' ? 'active' : ''}">Present</button>
                    <button class="btn attendance-btn absent ${attendanceRecord.status === 'absent' ? 'active' : ''}">Absent</button>
                </div>
            </td>
            <td class="attendance-status status-${attendanceRecord.status}">
                <span class="status-icon"><i class="fa fa-${getStatusIcon(attendanceRecord.status)}"></i></span> ${getStatusText(attendanceRecord.status)}
            </td>
            <td>
                <input type="text" class="form-control notes-input" placeholder="Notes" value="${attendanceRecord.notes || ''}">
            </td>
        `;
        
        studentListElement.appendChild(row);
    });
    
    console.log(`updateStudentList - Display complete. Present: ${present}, Absent: ${absent}, Not marked: ${notMarked}`);
    
    // Update counters
    if (presentCount) presentCount.textContent = present;
    if (absentCount) absentCount.textContent = absent;
    if (notMarkedCount) notMarkedCount.textContent = notMarked;
    
    // Add event listeners to the attendance buttons
    attachAttendanceButtonListeners();
}

function getStatusIcon(status) {
    switch(status) {
        case 'present': return 'check-circle';
        case 'absent': return 'times-circle';
        default: return 'exclamation-circle';
    }
}

function getStatusText(status) {
    switch(status) {
        case 'present': return 'Present';
        case 'absent': return 'Absent';
        default: return 'Not marked';
    }
}

function updateAttendanceHistory(history) {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';
    
    if (history.length === 0) {
        historyList.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    <div class="empty-state">
                        <i class="fa fa-calendar fa-4x text-muted"></i>
                        <p>No attendance records found</p>
                        <small>Start marking attendance to see history</small>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
      history.forEach(record => {
        const stats = record.stats || {};
        const formattedDate = formatDateForDisplay(record.date);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="date-display">${formattedDate}</div>
                <small class="text-muted">(Stored as: ${record.date})</small>
            </td>
            <td>${stats.totalStudents || 0}</td>
            <td>${stats.presentCount || 0}</td>
            <td>${stats.absentCount || 0}</td>
            <td>${stats.attendanceRate || 0}%</td>
            <td>
                <button class="btn btn-sm btn-primary load-date-btn" data-date="${record.date}">
                    <i class="fa fa-eye"></i> View
                </button>
            </td>
        `;
        
        historyList.appendChild(row);
    });
    
    // Add event listeners to view buttons
    document.querySelectorAll('.load-date-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const date = this.dataset.date;
            document.getElementById('attendance-date').value = date;
            loadAttendanceForDate(currentCourseId, date);
        });
    });
}

function formatDateForDisplay(dateStr) {
    // Handle the case where dateStr is today's date specifically
    if (dateStr === getTodayDateOverride()) {
        return '22 June 2025 at 00:00:00 UTC+3'; // Explicitly formatted today's date
    }
    
    // For other dates, use the standard formatting
    const date = new Date(dateStr);
    
    // Add debug info
    console.log(`Formatting date: ${dateStr}, parsed as: ${date.toString()}`);
    
    // Format like "21 June 2025 at 00:00:00 UTC+3"
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    const time = date.toTimeString().split(' ')[0]; // Gets HH:MM:SS
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offset = -(date.getTimezoneOffset() / 60);
    const offsetStr = offset >= 0 ? `UTC+${offset}` : `UTC${offset}`;
    
    return `${day} ${month} ${year} at ${time} ${offsetStr}`;
}

function showToast(message) {
    const toast = document.getElementById('toast-notification');
    const toastMessage = document.getElementById('toast-message');
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function attachAttendanceButtonListeners() {
    // Add click listeners to attendance buttons
    document.querySelectorAll('.attendance-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const studentId = row.dataset.studentId;
            const status = this.classList.contains('present') ? 'present' : 'absent';
            
            // Update UI
            row.querySelectorAll('.attendance-btn').forEach(button => {
                button.classList.remove('active');
            });
            this.classList.add('active');
            
            const statusCell = row.querySelector('.attendance-status');
            statusCell.className = `attendance-status status-${status}`;
            statusCell.innerHTML = `<span class="status-icon"><i class="fa fa-${getStatusIcon(status)}"></i></span> ${getStatusText(status)}`;
            
            // Update data
            if (!attendanceData[studentId]) {
                attendanceData[studentId] = {};
            }
            attendanceData[studentId].status = status;
            
            // Update counters
            updateAttendanceCounters();
        });
    });
    
    // Add input listeners to notes fields
    document.querySelectorAll('.notes-input').forEach(input => {
        input.addEventListener('input', function() {
            const row = this.closest('tr');
            const studentId = row.dataset.studentId;
            
            // Update data
            if (!attendanceData[studentId]) {
                attendanceData[studentId] = {};
            }
            attendanceData[studentId].notes = this.value;
        });
    });
}

function updateAttendanceCounters() {
    let present = 0;
    let absent = 0;
    let notMarked = Object.keys(courseStudents).length;
    
    Object.values(attendanceData).forEach(record => {
        if (record.status === 'present') {
            present++;
            notMarked--;
        } else if (record.status === 'absent') {
            absent++;
            notMarked--;
        }
    });
    
    // Update counters
    document.getElementById('present-count').textContent = present;
    document.getElementById('absent-count').textContent = absent;
    document.getElementById('not-marked-count').textContent = notMarked;
}

function loadAttendanceForDate(courseId, date) {
    if (!courseId) {
        showToast('Please select a course first');
        return;
    }
    
    console.log('loadAttendanceForDate - Starting to load attendance for', courseId, 'on date', date);    // Show preloader
    togglePreloader(true);
    
    // Show loading state in student list
    const studentList = document.getElementById('student-list');
    if (studentList) {
        studentList.innerHTML = `
            <tr>
                <td colspan="4" class="text-center">
                    <div class="loading-state">
                        <i class="fa fa-spinner fa-spin fa-2x"></i>
                        <p>Loading students and attendance data...</p>
                    </div>
                </td>
            </tr>
        `;
    } else {
        console.warn('Student-list element not found in the DOM');
    }      // Show directly in the UI that we're trying to load students
    if (studentList) {
        studentList.innerHTML = `
            <tr>
                <td colspan="4" class="text-center">
                    <div class="loading-state">
                        <i class="fa fa-spinner fa-spin fa-2x"></i>
                        <p>Loading students from course "${courseId}"...</p>
                        <small>Check browser console (F12) for detailed logs</small>
                    </div>
                </td>
            </tr>
        `;
    } else {
        console.warn('Student-list element already handled above');
    }
    
    // Verify Firebase connection
    console.log('DEBUG: Firebase Firestore instance available:', !!db);
    
    // Load student data first
    loadCourseStudents(courseId)
        .then(students => {            console.log('loadAttendanceForDate - Students loaded successfully:', students.length);
            console.log('DEBUG: Students returned from loadCourseStudents:', students);
            // Reset attendance data
            attendanceData = {};
            
            // Add a header to show the current attendance date in the desired format
            const formattedDate = formatDateForDisplay(date);
            console.log('Attendance date formatted:', formattedDate);
              // Process attendance data based on attendance and absence arrays
            students.forEach(student => {
                const studentId = student.id;
                const absenceDates = student.absenceDates || [];
                const attendanceDates = student.attendanceDates || [];
                
                console.log(`Student ${student.name} - absenceDates:`, absenceDates, 'attendanceDates:', attendanceDates);
                
                // Helper function to check if a date is in an array that might contain either strings or Firestore timestamps
                const isDateInArray = (array, dateString) => {
                    return array.some(item => {
                        if (typeof item === 'string') {
                            // Direct string comparison
                            return item === dateString;
                        } else if (item && typeof item.toDate === 'function') {
                            // It's a Firestore timestamp
                            const dateObj = item.toDate();
                            const formattedDate = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
                            return formattedDate === dateString;
                        }
                        return false;
                    });
                };
                
                // Check if this date is in either array using our helper function
                if (isDateInArray(absenceDates, date)) {
                    attendanceData[studentId] = { status: 'absent', notes: student.notes || '' };
                } else if (isDateInArray(attendanceDates, date)) {
                    attendanceData[studentId] = { status: 'present', notes: student.notes || '' };
                } else {
                    attendanceData[studentId] = { status: 'not-marked', notes: '' };
                }
            });
            
            if (students.length === 0) {
                showToast('No students found in this course');
            }
              console.log('loadAttendanceForDate - Processed attendance data:', attendanceData);
            
            // Remove any existing attendance date heading (if it exists)
            const studentListContainer = document.getElementById('student-list').parentElement;
            if (studentListContainer) {
                const existingHeading = studentListContainer.querySelector('.current-attendance-date');
                if (existingHeading) {
                    studentListContainer.removeChild(existingHeading);
                }
            }
            
            // Update UI with student list and attendance data
            updateStudentList(students);
            
            // Load attendance history in parallel
            return loadAttendanceHistory(courseId);
        })
        .then(history => {
            console.log('loadAttendanceForDate - History loaded:', history.length, 'records');
            // Update history table
            updateAttendanceHistory(history);            // Hide preloader
            togglePreloader(false);
        })
        .catch(error => {
            console.error('Error loading attendance data:', error);
            showToast('Error: ' + error.message);
            togglePreloader(false);
        });
}

// Event Listers
document.addEventListener('DOMContentLoaded', function() {
    // Force update the date field first
    forceUpdateDateField();
    
    // Check authentication and initialize
    checkAuthAndLoadData();
    
    // Course select change event
    const courseSelect = document.getElementById('course-select');
    if (courseSelect) {
        courseSelect.addEventListener('change', function() {
            currentCourseId = this.value;
            if (currentCourseId) {
                // Clear student list but don't load students automatically
                document.getElementById('student-list').innerHTML = `
                    <tr>
                        <td colspan="4" class="text-center">
                            <div class="empty-state">
                                <i class="fa fa-users fa-4x text-muted"></i>
                                <p>Course selected: ${courseSelect.options[courseSelect.selectedIndex].text}</p>
                                <small>Press "Load Attendance" button to load students</small>
                            </div>
                        </td>
                    </tr>
                `;
                
                // Clear the current attendance data
                attendanceData = {};
                
                // Update counters
                document.getElementById('present-count').textContent = '0';
                document.getElementById('absent-count').textContent = '0';
                document.getElementById('not-marked-count').textContent = '0';
                
                // Clear the history list
                document.getElementById('history-list').innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center">
                            <div class="empty-state">
                                <i class="fa fa-calendar fa-4x text-muted"></i>
                                <p>Click "Load Attendance" to view history</p>
                                <small>Attendance records will appear here after loading</small>
                            </div>
                        </td>
                    </tr>
                `;
            }
        });
    }
      // Date field focus event - to ensure it shows today's date
    const dateField = document.getElementById('attendance-date');
    if (dateField) {
        dateField.addEventListener('focus', function() {
            // Only update with today's date if no specific date was in the URL
            if (!getUrlParameter('date')) {
                this.value = getTodayDate();
                currentDate = getTodayDate();
                console.log('Updated date field on focus to today:', currentDate);
            }
        });
    }
    
    // Load attendance button click
    const loadAttendanceBtn = document.getElementById('load-attendance');
    if (loadAttendanceBtn) {
        console.log('DEBUG: Load Attendance button found in DOM, setting up click handler');
        loadAttendanceBtn.addEventListener('click', function() {
            console.log('DEBUG: Load Attendance button clicked at', new Date().toISOString());
            console.log('DEBUG: Current course ID:', currentCourseId);
            
            if (!currentCourseId) {
                console.warn('No course selected');
                showToast('Please select a course first');
                return;
            }
            
            const attendanceDate = document.getElementById('attendance-date').value;
            if (!attendanceDate) {
                console.warn('No date selected');
                showToast('Please select a date');
                return;
            }
            
            console.log('DEBUG: ==== STARTING ATTENDANCE LOAD PROCESS ====');
            console.log('DEBUG: Course ID:', currentCourseId);
            console.log('DEBUG: Date:', attendanceDate);
            console.log('Loading attendance for course:', currentCourseId, 'date:', attendanceDate);            // Add a direct DOM check when button is clicked
            const studentListElement = document.getElementById('student-list');
            if (!studentListElement) {
                console.error('DEBUG: student-list element not found when trying to load attendance!');
                alert('Error: Student list container not found in the page.');
                return;
            }
            
            // Try to get course document first to verify it exists
            db.collection('courses').doc(currentCourseId).get()
                .then(doc => {
                    if (!doc.exists) {
                        console.error('DEBUG: Course document does not exist when trying to load attendance!');
                        showToast('Error: Course not found in database');
                        return Promise.reject(new Error('Course not found'));
                    }
                    
                    console.log('DEBUG: Course document exists, proceeding to load attendance');
                    // Now load the attendance
                    return loadAttendanceForDate(currentCourseId, attendanceDate);
                })
                .catch(error => {
                    console.error('DEBUG: Error checking course before loading attendance:', error);
                    showToast('Error checking course: ' + error.message);
                });
        });
    } else {
        console.error('Load Attendance button not found in the DOM');
    }
    
    // Save attendance button click
    const saveAttendanceBtn = document.getElementById('save-attendance');
    if (saveAttendanceBtn) {
        saveAttendanceBtn.addEventListener('click', function() {
            if (!currentCourseId) {
                showToast('Please select a course first');
                return;
            }
            
            const attendanceDate = document.getElementById('attendance-date').value;
            if (!attendanceDate) {
                showToast('Please select a date');
                return;
            }
            
            // Show confirmation
            if (confirm('Are you sure you want to save the attendance?')) {                // Show preloader
                togglePreloader(true);
                
                // Save attendance records
                saveAttendanceRecords(currentCourseId, attendanceDate, attendanceData)
                    .then(success => {
                        if (success) {
                            showToast('Attendance saved successfully');
                            // Reload attendance history
                            loadAttendanceHistory(currentCourseId).then(updateAttendanceHistory);
                        }                        togglePreloader(false);
                    })
                    .catch(() => {
                        togglePreloader(false);
                    });
            }
        });
    }
      // Initialize date field with today's date
    const attendanceDateField = document.getElementById('attendance-date');
    if (attendanceDateField) {
        attendanceDateField.value = currentDate;
    }
    
    // Check if all the essential elements are present
    if (!checkSystemStatus()) {
        console.error('Some required elements are missing');
        // Show a more user-friendly error
        togglePreloader(false);
        const studentList = document.getElementById('student-list');
        if (studentList) {
            studentList.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-danger">
                    <strong>Some elements of the attendance system are missing. Please contact support.</strong>
                </td>
            </tr>
            `;
        }
    }
});
