/**
 * Profile page translations addon
 * This file contains additional translation functions for the profile page
 */

// Function to translate profile-specific elements
function translateProfileElements(lang) {
    if (!translations || !translations[lang]) return;
    
    // Translate section headers in profile page
    const sectionHeaders = {
        'Personal Information': translations[lang].personalInfo,
        'Account Security': translations[lang].accountSecurity,
        'المعلومات الشخصية': translations[lang].personalInfo,
        'أمان الحساب': translations[lang].accountSecurity
    };
    
    document.querySelectorAll('.section-header h4').forEach(header => {
        // Get text without the icon
        const text = header.textContent.trim().replace(/\s*\n\s*|\s*<i[^>]*>.*?<\/i>\s*/gi, '').trim();
        if (sectionHeaders[text]) {
            // Preserve the icon
            const icon = header.querySelector('i');
            if (icon) {
                header.innerHTML = icon.outerHTML + ' ' + sectionHeaders[text];
            } else {
                header.textContent = sectionHeaders[text];
            }
        }
    });
    
    // Translate profile-specific elements
    const profileLabels = {
        'Full Name': translations[lang].fullName,
        'Student ID': translations[lang].studentId,
        'Email Address': translations[lang].emailAddress,
        'Phone Number': translations[lang].phoneNumber,
        'Date of Birth': translations[lang].dateOfBirth,
        'Gender': translations[lang].gender,
        'Address': translations[lang].address,
        'Account Status': translations[lang].accountStatus,
        'Last Login': translations[lang].lastLogin,
        'Password': translations[lang].password,
        'Two-Factor Auth': translations[lang].twoFactorAuth,
        // Arabic items for reverse mapping
        'الاسم الكامل': translations[lang].fullName,
        'رقم الطالب': translations[lang].studentId,
        'البريد الإلكتروني': translations[lang].emailAddress,
        'رقم الهاتف': translations[lang].phoneNumber,
        'تاريخ الميلاد': translations[lang].dateOfBirth,
        'الجنس': translations[lang].gender,
        'العنوان': translations[lang].address,
        'حالة الحساب': translations[lang].accountStatus,
        'آخر تسجيل دخول': translations[lang].lastLogin,
        'كلمة المرور': translations[lang].password,
        'المصادقة الثنائية': translations[lang].twoFactorAuth
    };
      // Apply translations to profile details table
    document.querySelectorAll('.profile-details td:first-child').forEach(cell => {
        const text = cell.textContent.trim();
        if (profileLabels[text]) {
            cell.textContent = profileLabels[text];
        }
    });
      // Format and handle phone number for different regions
    const phoneCell = Array.from(document.querySelectorAll('.profile-details td')).find(cell => 
        cell.previousElementSibling && 
        cell.previousElementSibling.textContent.trim() === (lang === 'ar' ? 'رقم الهاتف' : 'Phone Number')
    );
    
    if (phoneCell && phoneCell.querySelector('a')) {
        const phoneLink = phoneCell.querySelector('a');
        // Keep the href the same but adjust display format based on language
        if (lang === 'ar') {
            // For Arabic, set direction to LTR to prevent number reversal
            phoneLink.setAttribute('dir', 'ltr');
            phoneLink.classList.add('d-inline-block');
        } else {
            // For English, remove direction attribute if it exists
            phoneLink.removeAttribute('dir');
        }
    }
    
    // Translate buttons and miscellaneous elements
    document.querySelectorAll('.edit-profile-btn').forEach(btn => {
        const icon = btn.querySelector('i');
        if (icon) {
            btn.innerHTML = icon.outerHTML + ' ' + translations[lang].editProfile;
        } else {
            btn.textContent = translations[lang].editProfile;
        }
    });
    
    document.querySelectorAll('.btn-outline-primary').forEach(btn => {
        if (btn.textContent.trim() === 'Change Password' || btn.textContent.trim() === 'تغيير كلمة المرور') {
            btn.textContent = translations[lang].changePassword;
        } else if (btn.textContent.trim() === 'Enable 2FA' || btn.textContent.trim() === 'تفعيل المصادقة الثنائية') {
            btn.textContent = translations[lang].enable2FA;
        } else if (btn.textContent.trim() === 'Browse Courses' || btn.textContent.trim() === 'تصفح الدورات') {
            btn.textContent = translations[lang].browseCourses;
        }
    });
    
    // Translate tooltip for profile photo change
    const avatarEdit = document.querySelector('.avatar-edit');
    if (avatarEdit) {
        avatarEdit.setAttribute('title', translations[lang].changePhoto);
    }
      // Translate courses and certificates labels in profile stats
    document.querySelectorAll('.stat-item p').forEach(item => {
        if (item.textContent.trim() === 'Courses' || item.textContent.trim() === 'الدورات') {
            item.textContent = translations[lang].courses;
        } else if (item.textContent.trim() === 'Certificates' || item.textContent.trim() === 'الشهادات') {
            item.textContent = translations[lang].certificates;
        }
    });

    // Translate change password modal elements
    translateChangePasswordModal(lang);
}

// Function to translate change password modal elements
function translateChangePasswordModal(lang) {
    if (!translations || !translations[lang]) return;

    // Translate modal title
    const modalTitle = document.querySelector('#changePasswordModalLabel');
    if (modalTitle) {
        const icon = modalTitle.querySelector('i');
        if (icon) {
            modalTitle.innerHTML = icon.outerHTML + ' ' + translations[lang].changePassword;
        } else {
            modalTitle.textContent = translations[lang].changePassword;
        }
    }

    // Translate form labels
    const labelMappings = {
        'currentPassword': translations[lang].currentPassword,
        'newPassword': translations[lang].newPassword,
        'confirmPassword': translations[lang].confirmNewPassword
    };

    Object.keys(labelMappings).forEach(id => {
        const label = document.querySelector(`label[for="${id}"]`);
        if (label) {
            label.textContent = labelMappings[id];
        }
    });

    // Translate password requirements text
    const requirementsText = document.querySelector('#changePasswordForm .form-text');
    if (requirementsText) {
        requirementsText.textContent = translations[lang].passwordRequirements;
    }

    // Translate modal buttons
    const cancelBtn = document.querySelector('#changePasswordModal .btn-secondary');
    if (cancelBtn) {
        cancelBtn.textContent = translations[lang].cancel;
    }

    const saveBtn = document.querySelector('#savePasswordBtn');
    if (saveBtn) {
        const icon = saveBtn.querySelector('i');
        if (icon) {
            saveBtn.innerHTML = icon.outerHTML + ' ' + translations[lang].changePassword;
        } else {
            saveBtn.textContent = translations[lang].changePassword;
        }
    }
}
