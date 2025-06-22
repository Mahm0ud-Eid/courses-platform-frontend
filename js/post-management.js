/**
 * Post Management functionality for admin-post-all.html
 */

document.addEventListener("DOMContentLoaded", function () {
    // Initialize post management
    initPostManagement();
});

/**
 * Initialize post management functionality
 */
function initPostManagement() {
    setupSearchFilter();
    setupDeleteButtons();
    setupBulkActions();
    setupPagination();
}

/**
 * Setup search and filter functionality
 */
function setupSearchFilter() {
    // Search functionality
    const searchButton = document.querySelector(".post-filter-section .btn-primary");
    const searchInput = document.querySelector(".post-filter-section input[type='text']");
    
    if (searchButton && searchInput) {
        searchButton.addEventListener("click", function() {
            const searchTerm = searchInput.value.toLowerCase().trim();
            filterPosts(searchTerm);
        });
        
        // Add enter key support
        searchInput.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                const searchTerm = searchInput.value.toLowerCase().trim();
                filterPosts(searchTerm);
            }
        });
    }
    
    // Category filter
    const categoryFilter = document.getElementById("categoryFilter");
    if (categoryFilter) {
        categoryFilter.addEventListener("change", function() {
            applyFilters();
        });
    }
    
    // Status filter
    const statusFilter = document.getElementById("statusFilter");
    if (statusFilter) {
        statusFilter.addEventListener("change", function() {
            applyFilters();
        });
    }
}

/**
 * Filter posts based on search term, category and status
 */
function applyFilters() {
    const searchTerm = document.querySelector(".post-filter-section input[type='text']").value.toLowerCase().trim();
    const category = document.getElementById("categoryFilter").value;
    const status = document.getElementById("statusFilter").value;
    
    const rows = document.querySelectorAll(".table tbody tr");
    
    rows.forEach(row => {
        const title = row.querySelector("td:nth-child(3)").textContent.toLowerCase();
        const rowCategory = row.querySelector("td:nth-child(5)").textContent;
        const rowStatus = row.querySelector("td:nth-child(6) span").textContent;
        
        const matchesSearch = searchTerm === "" || title.includes(searchTerm);
        const matchesCategory = category === "" || rowCategory === category;
        const matchesStatus = status === "" || rowStatus === status;
        
        if (matchesSearch && matchesCategory && matchesStatus) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}

/**
 * Filter posts based on search term
 */
function filterPosts(searchTerm) {
    applyFilters();
}

/**
 * Setup delete buttons for posts
 */
function setupDeleteButtons() {
    const deleteButtons = document.querySelectorAll(".ad-st-view.bg-danger");
    
    deleteButtons.forEach(button => {
        button.addEventListener("click", function(e) {
            e.preventDefault();
            const row = this.closest("tr");
            const postTitle = row.querySelector("td:nth-child(3)").textContent;
            
            if (confirm(`Are you sure you want to delete the post "${postTitle}"?`)) {
                // In a real application, this would send an API request to delete the post
                // For demonstration purposes, we'll just remove the row from the table
                row.remove();
                showNotification("Post deleted successfully", "success");
            }
        });
    });
}

/**
 * Setup bulk actions functionality
 */
function setupBulkActions() {
    const bulkActionSelect = document.querySelector(".bulk-actions select");
    const bulkActionButton = document.querySelector(".bulk-actions button");
    
    // Add checkboxes to the table only if not explicitly disabled
    const table = document.querySelector(".table");
    console.log("Table has data-no-checkboxes attribute:", !!table?.getAttribute('data-no-checkboxes'));
    
    // Skip adding checkboxes if the table has the data-no-checkboxes attribute
    if (table && table.getAttribute('data-no-checkboxes') !== "true") {
        // Add checkbox to header
        const headerRow = table.querySelector("thead tr");
        const checkboxHeader = document.createElement("th");
        checkboxHeader.innerHTML = '<input type="checkbox" id="selectAll">';
        headerRow.insertBefore(checkboxHeader, headerRow.firstChild);
          // Add checkboxes to each row (skip any row with colspan attributes as those are likely headers/messages)
        const rows = table.querySelectorAll("tbody tr");
        rows.forEach((row, index) => {
            if (!row.querySelector('td[colspan]')) {
                const checkboxCell = document.createElement("td");
                checkboxCell.innerHTML = `<input type="checkbox" class="post-checkbox" data-id="${index + 1}">`;
                row.insertBefore(checkboxCell, row.firstChild);
            }
        });
        
        // Select all checkbox functionality
        const selectAllCheckbox = document.getElementById("selectAll");
        selectAllCheckbox.addEventListener("change", function() {
            const checkboxes = document.querySelectorAll(".post-checkbox");
            checkboxes.forEach(checkbox => {
                checkbox.checked = selectAllCheckbox.checked;
            });
        });
    }
    
    // Apply bulk action button
    if (bulkActionButton && bulkActionSelect) {
        bulkActionButton.addEventListener("click", function() {
            const action = bulkActionSelect.value;
            const selectedPosts = document.querySelectorAll(".post-checkbox:checked");
            
            if (action === "") {
                alert("Please select an action");
                return;
            }
            
            if (selectedPosts.length === 0) {
                alert("Please select at least one post");
                return;
            }
            
            let confirmMessage = "";
            switch(action) {
                case "publish":
                    confirmMessage = "Are you sure you want to publish the selected posts?";
                    break;
                case "draft":
                    confirmMessage = "Are you sure you want to move the selected posts to draft?";
                    break;
                case "delete":
                    confirmMessage = "Are you sure you want to delete the selected posts?";
                    break;
            }
            
            if (confirm(confirmMessage)) {
                // Handle based on action
                if (action === "delete") {
                    selectedPosts.forEach(checkbox => {
                        const row = checkbox.closest("tr");
                        row.remove();
                    });
                    showNotification("Selected posts deleted successfully", "success");
                } else {
                    // For publish and draft actions (in a real app, this would make API calls)
                    const statusClass = action === "publish" ? "label-success" : "label-warning";
                    const statusText = action === "publish" ? "Published" : "Draft";
                    
                    selectedPosts.forEach(checkbox => {
                        const row = checkbox.closest("tr");
                        const statusCell = row.querySelector("td:nth-child(7) span"); // Adjust index because we added a checkbox column
                        statusCell.className = `label ${statusClass}`;
                        statusCell.textContent = statusText;
                    });
                    
                    const actionText = action === "publish" ? "published" : "moved to draft";
                    showNotification(`Selected posts ${actionText} successfully`, "success");
                }
            }
        });
    }
}

/**
 * Setup pagination functionality
 */
function setupPagination() {
    const paginationLinks = document.querySelectorAll(".pagination .page-link");
    
    paginationLinks.forEach(link => {
        link.addEventListener("click", function(e) {
            e.preventDefault();
            
            // In a real application, this would load different pages of content
            // For demonstration purposes, we'll just update the active page
            if (!this.parentElement.classList.contains("disabled")) {
                document.querySelector(".pagination .active").classList.remove("active");
                
                if (this.textContent !== "Previous" && this.textContent !== "Next") {
                    this.parentElement.classList.add("active");
                } else if (this.textContent === "Next") {
                    const activePage = parseInt(document.querySelector(".pagination .active a").textContent);
                    const nextPageItem = document.querySelector(`.pagination li a[href="#"]:not(.page-item):contains('${activePage + 1}')`);
                    if (nextPageItem) {
                        nextPageItem.parentElement.classList.add("active");
                    }
                } else if (this.textContent === "Previous") {
                    const activePage = parseInt(document.querySelector(".pagination .active a").textContent);
                    const prevPageItem = document.querySelector(`.pagination li a[href="#"]:not(.page-item):contains('${activePage - 1}')`);
                    if (prevPageItem) {
                        prevPageItem.parentElement.classList.add("active");
                    }
                }
                
                showNotification("Page changed successfully", "info");
            }
        });
    });
}

/**
 * Show notification
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success, error, info)
 */
function showNotification(message, type = "info") {
    // Check if notification container exists, if not create it
    let notificationContainer = document.getElementById("notification-container");
    if (!notificationContainer) {
        notificationContainer = document.createElement("div");
        notificationContainer.id = "notification-container";
        notificationContainer.style.position = "fixed";
        notificationContainer.style.top = "20px";
        notificationContainer.style.right = "20px";
        notificationContainer.style.zIndex = "9999";
        document.body.appendChild(notificationContainer);
    }
    
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `alert alert-${type} alert-dismissible fade show`;
    notification.role = "alert";
    notification.style.minWidth = "300px";
    notification.style.marginBottom = "10px";
    
    // Add content
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Add to container
    notificationContainer.appendChild(notification);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        notification.classList.remove("show");
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}
