// Admin Navigation JS
document.addEventListener("DOMContentLoaded", function() {
  // Make the tabs work properly
  initializeTabs();
  
  // Add in-page navigation for sidebar
  setupSidebarNavigation();
  
  // Add form validation
  setupFormValidation();
  
  // Add image preview functionality
  setupImagePreview();
});

// Tab functionality
function initializeTabs() {
  // Show first tab by default
  $(".tab-pane:first").show();
  $(".nav-tabs li:first").addClass("active");
  
  // Tab click handler
  $(".nav-tabs a").click(function(e) {
    e.preventDefault();
    
    // Remove active class from all tabs
    $(".nav-tabs li").removeClass("active");
    
    // Add active class to clicked tab
    $(this).parent().addClass("active");
    
    // Hide all tab content
    $(".tab-pane").hide();
    
    // Show the selected tab content
    $($(this).attr("href")).show();
  });
}

// Setup sidebar navigation
function setupSidebarNavigation() {
  // For courses links
  $(".courses-nav-link").click(function(e) {
    e.preventDefault();
    const target = $(this).attr("data-target");
    window.location.href = target;
  });
  
  // For events links
  $(".events-nav-link").click(function(e) {
    e.preventDefault();
    const target = $(this).attr("data-target");
    window.location.href = target;
  });
  
  // For students links
  $(".students-nav-link").click(function(e) {
    e.preventDefault();
    const target = $(this).attr("data-target");
    window.location.href = target;
  });
  
  // For import/export links
  $(".import-export-nav-link").click(function(e) {
    e.preventDefault();
    const target = $(this).attr("data-target");
    window.location.href = target;
  });
}

// Form validation
function setupFormValidation() {
  // Submit event for all forms
  $("form").on("submit", function(e) {
    let isValid = true;
    
    // Check required fields
    $(this).find('input[required], textarea[required], select[required]').each(function() {
      if($(this).val() === '') {
        isValid = false;
        $(this).addClass('is-invalid');
      } else {
        $(this).removeClass('is-invalid');
      }
    });
    
    if(!isValid) {
      e.preventDefault();
      alert("Please fill in all required fields");
    }
  });
}

// Image preview functionality
function setupImagePreview() {
  // When a file is selected
  $('input[type="file"]').on('change', function() {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        // Create image preview if it doesn't exist
        if (!$('.image-preview').length) {
          $('<div class="image-preview mt-3"><img src="' + e.target.result + '" class="img-fluid" /></div>').insertAfter('.admin-upload-btn');
        } else {
          // Update existing preview
          $('.image-preview img').attr('src', e.target.result);
        }
      }
      reader.readAsDataURL(file);
    }
  });
}
