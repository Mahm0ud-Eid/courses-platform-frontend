/**
 * Language and Theme Switcher
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize language and theme from localStorage or defaults
    const currentLang = localStorage.getItem('language') || 'en';
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    // Set initial language
    if (currentLang === 'ar') {
        document.documentElement.lang = 'ar';
        document.body.classList.add('rtl');
        updateLanguageButton('ar');
        applyTranslations('ar');
    } else {
        document.documentElement.lang = 'en';
        document.body.classList.remove('rtl');
        updateLanguageButton('en');
        applyTranslations('en');
    }
    
    // Set initial theme
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        updateThemeButton('dark');
    } else {
        document.body.classList.remove('dark-mode');
        updateThemeButton('light');
    }
    
    // Language toggle button click handler
    document.getElementById('language-toggle').addEventListener('click', function() {
        const currentLang = document.documentElement.lang;
        if (currentLang === 'en') {
            // Switch to Arabic
            document.documentElement.lang = 'ar';
            document.body.classList.add('rtl');
            localStorage.setItem('language', 'ar');
            updateLanguageButton('ar');
            applyTranslations('ar');
        } else {
            // Switch to English
            document.documentElement.lang = 'en';
            document.body.classList.remove('rtl');
            localStorage.setItem('language', 'en');
            updateLanguageButton('en');
            applyTranslations('en');
        }
    });
    
    // Theme toggle button click handler
    document.getElementById('theme-toggle').addEventListener('click', function() {
        if (document.body.classList.contains('dark-mode')) {
            // Switch to light mode
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
            updateThemeButton('light');
        } else {
            // Switch to dark mode
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
            updateThemeButton('dark');
        }
    });
    
    // Update language button appearance
    function updateLanguageButton(lang) {
        const button = document.getElementById('language-toggle');
        if (lang === 'ar') {
            button.innerHTML = 'English';
            button.setAttribute('title', 'Switch to English');
        } else {
            button.innerHTML = 'العربية';
            button.setAttribute('title', 'Switch to Arabic');
        }
    }
    
    // Update theme button appearance
    function updateThemeButton(theme) {
        const button = document.getElementById('theme-toggle');
        if (theme === 'dark') {
            button.innerHTML = '<i class="bi bi-sun"></i>';
            button.setAttribute('title', 'Switch to Light Mode');
        } else {
            button.innerHTML = '<i class="bi bi-moon"></i>';
            button.setAttribute('title', 'Switch to Dark Mode');
        }
    }    function applyTranslations(lang) {
        if (!translations || !translations[lang]) return;
        
        // Translate navigation items
        const navItems = {
            'Home': translations[lang].home,
            'About': translations[lang].about,
            'Courses': translations[lang].courses,
            'Trainers': translations[lang].trainers,
            'Events': translations[lang].events,
            'Dashboard': translations[lang].dashboard,
            'Contact': translations[lang].contact,
            // Arabic navigation items for reverse mapping
            'الرئيسية': translations[lang].home,
            'حول': translations[lang].about,
            'الدورات': translations[lang].courses,
            'المدربون': translations[lang].trainers,
            'الفعاليات': translations[lang].events,
            'لوحة التحكم': translations[lang].dashboard,
            'اتصل بنا': translations[lang].contact
        };
        
        document.querySelectorAll('#navmenu a').forEach(link => {
            const text = link.textContent.trim().replace(/\s*\n\s*|\s*<br\s*\/?>\s*/gi, '');
            if (navItems[text]) {
                // Handle special case for Home with <br> tag
                if (text === 'Home' || text === 'الرئيسية') {
                    if (link.innerHTML.includes('<br')) {
                        link.innerHTML = translations[lang].home + '<br>';
                    } else {
                        link.textContent = translations[lang].home;
                    }
                } else {
                    link.textContent = navItems[text];
                }
            }
        });
        
        // Translate dashboard navigation items
        const dashboardNavItems = {
            'Dashboard': translations[lang].myDashboard,
            'My Profile': translations[lang].myProfile,
            'My Courses': translations[lang].myCourses,
            'Exams & Results': translations[lang].examsResults,
            'Schedule': translations[lang].schedule,
            'Notifications': translations[lang].notifications,
            'Settings': translations[lang].settings,
            'Logout': translations[lang].logout,
            // Arabic items for reverse mapping
            'لوحة التحكم': translations[lang].myDashboard,
            'الملف الشخصي': translations[lang].myProfile,
            'دوراتي': translations[lang].myCourses,
            'الاختبارات والنتائج': translations[lang].examsResults,
            'الجدول الزمني': translations[lang].schedule,
            'الإشعارات': translations[lang].notifications,
            'الإعدادات': translations[lang].settings,
            'تسجيل الخروج': translations[lang].logout
        };
        
        document.querySelectorAll('.dashboard-nav .nav-link').forEach(link => {
            const text = link.textContent.trim().replace(/\s*\n\s*|\s*<i[^>]*>.*?<\/i>\s*/gi, '').trim();
            if (dashboardNavItems[text]) {
                // Preserve the icon
                const icon = link.querySelector('i');
                if (icon) {
                    link.innerHTML = icon.outerHTML + ' ' + dashboardNavItems[text];
                } else {
                    link.textContent = dashboardNavItems[text];
                }
            }
        });
        
        // Translate dashboard section headers
        const dashboardHeaders = {
            'Welcome Back': translations[lang].welcomeBack,
            'Enrolled Courses': translations[lang].enrolledCourses,
            'Course Status': translations[lang].courseStatus,
            'Upcoming Schedule': translations[lang].upcomingSchedule,
            // Arabic items for reverse mapping
            'مرحبًا بعودتك': translations[lang].welcomeBack,
            'الدورات المسجلة': translations[lang].enrolledCourses,
            'حالة الدورة': translations[lang].courseStatus,
            'الجدول القادم': translations[lang].upcomingSchedule
        };
          document.querySelectorAll('.section-header h4').forEach(header => {
            const text = header.textContent.trim().replace(/\s*\n\s*|\s*<i[^>]*>.*?<\/i>\s*/gi, '').trim();
            // Special case for "Welcome Back, [Name]!"
            if (text.startsWith('Welcome Back') || text.startsWith('مرحبًا بعودتك')) {
                const nameMatch = text.match(/Welcome Back,\s*([^!]+)!/) || text.match(/مرحبًا بعودتك,\s*([^!]+)!/);
                if (nameMatch && nameMatch[1]) {
                    const name = nameMatch[1];
                    const icon = header.querySelector('i');
                    if (icon) {
                        header.innerHTML = icon.outerHTML + ' ' + translations[lang].welcomeBack + ', ' + name + '!';
                    } else {
                        header.textContent = translations[lang].welcomeBack + ', ' + name + '!';
                    }
                }
            } else if (dashboardHeaders[text]) {
                // Preserve the icon
                const icon = header.querySelector('i');
                if (icon) {
                    header.innerHTML = icon.outerHTML + ' ' + dashboardHeaders[text];
                } else {
                    header.textContent = dashboardHeaders[text];
                }
            }
        });
          // Translate dashboard buttons and stats
        const dashboardStatsLabels = document.querySelectorAll('.stats-card p');
        if (dashboardStatsLabels.length >= 1) {
            dashboardStatsLabels.forEach(label => {
                if (label.textContent.trim() === 'Active Courses' || label.textContent.trim() === 'الدورات النشطة') {
                    label.textContent = translations[lang].activeCourses;
                } else if (label.textContent.trim() === 'Certificates' || label.textContent.trim() === 'الشهادات') {
                    label.textContent = translations[lang].certificates;
                } else if (label.textContent.trim() === 'Upcoming Classes' || label.textContent.trim() === 'الدروس القادمة') {
                    label.textContent = translations[lang].upcomingClasses;
                } else if (label.textContent.trim() === 'Study Time' || label.textContent.trim() === 'وقت الدراسة') {
                    label.textContent = translations[lang].studyTime;
                }
            });
        }
        
        // Translate dashboard buttons
        const viewAllCoursesBtn = document.getElementById('view-all-courses');
        if (viewAllCoursesBtn) {
            if (viewAllCoursesBtn.textContent.trim() === 'View All Courses' || viewAllCoursesBtn.textContent.trim() === 'عرض جميع الدورات') {
                viewAllCoursesBtn.textContent = translations[lang].viewAllCourses;
            } else {
                viewAllCoursesBtn.textContent = translations[lang].viewFewerCourses;
            }
        }
          const browseCoursesBtn = document.querySelector('.section-header a[href="courses.html"]');
        if (browseCoursesBtn) {
            browseCoursesBtn.textContent = translations[lang].browseCourses;
        }
        
        const viewCalendarBtn = document.querySelector('.section-header a[href="db-time-line.html"]');
        if (viewCalendarBtn) {
            viewCalendarBtn.textContent = translations[lang].viewFullCalendar;
        }
        
        // Translate course durations in "Days XX" format
        document.querySelectorAll('.course-duration').forEach(duration => {
            const durationText = duration.textContent.trim();
            if (durationText.includes('Days') || durationText.includes('يوم')) {
                const daysNumber = durationText.match(/\d+/)[0];
                duration.textContent = translations[lang].days + ' ' + daysNumber;
            }
        });
          // Filter buttons for course status
        const allBtn = document.getElementById('all-btn');
        if (allBtn) allBtn.textContent = translations[lang].all;
        
        const activeBtn = document.getElementById('active-btn');
        if (activeBtn) activeBtn.textContent = translations[lang].active;
        
        const completedBtn = document.getElementById('completed-btn');
        if (completedBtn) completedBtn.textContent = translations[lang].completed;
        
        // Translate status badges
        document.querySelectorAll('.status-badge').forEach(badge => {
            if (badge.textContent.trim().toLowerCase() === 'active' || badge.textContent.trim() === 'نشط') {
                badge.textContent = translations[lang].active;
            } else if (badge.textContent.trim().toLowerCase() === 'completed' || badge.textContent.trim() === 'مكتمل') {
                badge.textContent = translations[lang].completed;
            }
        });// Translate sign in button
        const signInBtn = document.querySelector('.btn-getstarted');
        if (signInBtn) {
            // Check both English and Arabic texts to handle switching between languages
            if (signInBtn.textContent.trim() === 'Sign In' || signInBtn.textContent.trim() === 'تسجيل الدخول') {
                signInBtn.textContent = translations[lang].signIn;
            } else if (signInBtn.textContent.trim().includes('Sign out') || signInBtn.textContent.trim().includes('تسجيل الخروج')) {
                const icon = signInBtn.querySelector('i');
                if (icon) {
                    signInBtn.innerHTML = icon.outerHTML + ' ' + translations[lang].signOut;
                } else {
                    signInBtn.textContent = translations[lang].signOut;
                }
            } else if (signInBtn.textContent.trim() === 'Get Started' || signInBtn.textContent.trim() === 'ابدأ الآن') {
                signInBtn.textContent = translations[lang].getStarted;
            }
        }
        
        // Translate dashboard elements
        // Export dropdown
        const exportButton = document.querySelector('#reportDropdown');
        if (exportButton) {
            const icon = exportButton.querySelector('i');
            if (icon) {
                exportButton.innerHTML = icon.outerHTML + ' ' + translations[lang].export;
            } else {
                exportButton.textContent = translations[lang].export;
            }
        }
        
        // Export dropdown items
        document.querySelectorAll('.dropdown-menu .dropdown-item').forEach(item => {
            if (item.textContent.trim() === 'PDF Report' || item.textContent.trim() === 'تقرير PDF') {
                item.textContent = translations[lang].pdfReport;
            } else if (item.textContent.trim() === 'Excel Sheet' || item.textContent.trim() === 'جدول اكسل') {
                item.textContent = translations[lang].excelSheet;
            } else if (item.textContent.trim() === 'Print' || item.textContent.trim() === 'طباعة') {
                item.textContent = translations[lang].print;
            }
        });
        
        // View details link
        document.querySelectorAll('.alert-link').forEach(link => {
            if (link.textContent.trim() === 'View details' || link.textContent.trim() === 'عرض التفاصيل') {
                link.textContent = translations[lang].viewDetails;
            }
        });
        
        // Dashboard welcome message
        const welcomeMessage = document.querySelector('.dashboard-section > p');
        if (welcomeMessage && (welcomeMessage.innerHTML.includes('Welcome to your personalized') || welcomeMessage.innerHTML.includes('مرحبًا بك في لوحة التعلم'))) {
            welcomeMessage.innerHTML = translations[lang].welcomeMessage;
        }
        
        // Course status table headers
        const tableHeaders = {
            'Course': translations[lang].course,
            'Instructor': translations[lang].instructor,
            'Start Date': translations[lang].startDate,
            'End Date': translations[lang].endDate,
            'Status': translations[lang].status,
            // Arabic items for reverse mapping
            'الدورة': translations[lang].course,
            'المعلم': translations[lang].instructor,
            'تاريخ البدء': translations[lang].startDate,
            'تاريخ الانتهاء': translations[lang].endDate,
            'الحالة': translations[lang].status
        };
        
        document.querySelectorAll('.status-table th').forEach(header => {
            const text = header.textContent.trim();
            if (tableHeaders[text]) {
                header.textContent = tableHeaders[text];
            }
        });
        
        // Translate course badges
        document.querySelectorAll('.course-badge').forEach(badge => {
            if (badge.textContent.trim() === 'In Progress' || badge.textContent.trim() === 'قيد التقدم') {
                badge.textContent = translations[lang].inProgress;
            } else if (badge.textContent.trim() === 'Active' || badge.textContent.trim() === 'نشط') {
                badge.textContent = translations[lang].active;
            } else if (badge.textContent.trim() === 'Completed' || badge.textContent.trim() === 'مكتمل') {
                badge.textContent = translations[lang].completed;
            }
        });
        
        // Timeline dates
        document.querySelectorAll('.timeline-date').forEach(date => {
            // For "Today" text
            if (date.textContent.startsWith('Today') || date.textContent.startsWith('اليوم')) {
                const dateText = date.textContent.split('-')[1].trim();
                date.textContent = translations[lang].today + ' - ' + dateText;
            }
        });
        
        // Translate hero section
        const heroTitle = document.querySelector('#hero h2');
        if (heroTitle) {
            heroTitle.innerHTML = translations[lang].heroTitle;
        }
        
        const heroSubtitle = document.querySelector('#hero p');
        if (heroSubtitle) {
            heroSubtitle.textContent = translations[lang].heroSubtitle;
        }
        
        const getStartedBtn = document.querySelector('#hero .btn-get-started');
        if (getStartedBtn) {
            getStartedBtn.textContent = translations[lang].getStarted;
        }
        
        // Translate about section
        const aboutTitle = document.querySelector('#about h3');
        if (aboutTitle) {
            aboutTitle.textContent = translations[lang].aboutTitle;
        }
        
        const aboutDesc = document.querySelector('#about p.fst-italic');
        if (aboutDesc) {
            aboutDesc.textContent = translations[lang].aboutDesc;
        }
        
        const aboutItems = document.querySelectorAll('#about ul li span');
        if (aboutItems.length >= 3) {
            aboutItems[0].textContent = translations[lang].aboutItem1;
            aboutItems[1].textContent = translations[lang].aboutItem2;
            aboutItems[2].textContent = translations[lang].aboutItem3;
        }
        
        const readMoreBtn = document.querySelector('#about .read-more span');
        if (readMoreBtn) {
            readMoreBtn.textContent = translations[lang].readMore;
        }
        
        // Translate stats section
        const statsLabels = document.querySelectorAll('#counts .stats-item p');
        if (statsLabels.length >= 4) {
            statsLabels[0].textContent = translations[lang].students;
            statsLabels[1].textContent = translations[lang].courses;
            statsLabels[2].textContent = translations[lang].events;
            statsLabels[3].textContent = translations[lang].trainers;
        }
        
        // Translate why us section
        const whyTitle = document.querySelector('#why-us .why-box h3');
        if (whyTitle) {
            whyTitle.textContent = translations[lang].whyTitle;
        }
        
        const whyDesc = document.querySelector('#why-us .why-box p');
        if (whyDesc) {
            whyDesc.textContent = translations[lang].whyDesc;
        }
        
        const learnMoreBtn = document.querySelector('#why-us .more-btn span');
        if (learnMoreBtn) {
            learnMoreBtn.textContent = translations[lang].learnMore;
        }
          // Translate footer
        const footerSections = document.querySelectorAll('.footer h4');
        footerSections.forEach(section => {
            const text = section.textContent.trim();
            if (text === 'Useful Links' || text === 'روابط مفيدة') {
                section.textContent = translations[lang].usefulLinks;
            } else if (text === 'Our Services' || text === 'خدماتنا') {
                section.textContent = translations[lang].ourServices;
            } else if (text === 'Our Newsletter' || text === 'النشرة الإخبارية') {
                section.textContent = translations[lang].newsletter;
                const newsletterDesc = section.nextElementSibling;
                if (newsletterDesc && newsletterDesc.tagName === 'P') {
                    newsletterDesc.textContent = translations[lang].newsletterDesc;
                }
            }
        });
        
        // Translate subscribe button
        const subscribeBtn = document.querySelector('.newsletter-form input[type="submit"]');
        if (subscribeBtn) {
            subscribeBtn.value = translations[lang].subscribe;
        }
        
        // Translate copyright
        const copyright = document.querySelector('.copyright p');
        if (copyright) {
            copyright.innerHTML = translations[lang].copyright;
        }
        
        // Translate dashboard elements if they exist
        // Dashboard titles and labels
        const dashboardSectionTitles = document.querySelectorAll('.section-header h4');
        if (dashboardSectionTitles.length > 0) {
            const dashboardTitleMap = {
                'Welcome Back': lang === 'ar' ? 'مرحباً بعودتك' : 'Welcome Back',
                'Enrolled Courses': lang === 'ar' ? 'الدورات المسجلة' : 'Enrolled Courses',
                'Course Status': lang === 'ar' ? 'حالة الدورات' : 'Course Status',
                'Upcoming Schedule': lang === 'ar' ? 'الجدول القادم' : 'Upcoming Schedule'
            };
            
            dashboardSectionTitles.forEach(title => {
                for (const [key, value] of Object.entries(dashboardTitleMap)) {
                    if (title.textContent.includes(key)) {
                        title.textContent = title.textContent.replace(key, value);
                        break;
                    }
                }
            });
        }
        
        // Dashboard buttons
        const dashboardButtons = document.querySelectorAll('.dashboard-section .btn');
        if (dashboardButtons.length > 0) {
            const buttonTextMap = {
                'Browse Courses': lang === 'ar' ? 'تصفح الدورات' : 'Browse Courses',
                'View All Courses': lang === 'ar' ? 'عرض جميع الدورات' : 'View All Courses',
                'View Fewer Courses': lang === 'ar' ? 'عرض دورات أقل' : 'View Fewer Courses',
                'View Full Calendar': lang === 'ar' ? 'عرض التقويم الكامل' : 'View Full Calendar'
            };
            
            dashboardButtons.forEach(button => {
                for (const [key, value] of Object.entries(buttonTextMap)) {
                    if (button.textContent.trim() === key) {
                        button.textContent = value;
                        break;
                    }
                }
            });
        }
    }
});
