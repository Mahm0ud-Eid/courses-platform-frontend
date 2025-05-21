(function () {
  "use strict";

  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  function toggleScrolled() {
    const selectBody = document.querySelector("body");
    const selectHeader = document.querySelector("#header");
    if (
      !selectHeader.classList.contains("scroll-up-sticky") &&
      !selectHeader.classList.contains("sticky-top") &&
      !selectHeader.classList.contains("fixed-top")
    )
      return;
    window.scrollY > 100
      ? selectBody.classList.add("scrolled")
      : selectBody.classList.remove("scrolled");
  }

  document.addEventListener("scroll", toggleScrolled);
  window.addEventListener("load", toggleScrolled);

  /**
   * Mobile nav toggle
   */
  const mobileNavToggleBtn = document.querySelector(".mobile-nav-toggle");

  function mobileNavToogle() {
    document.querySelector("body").classList.toggle("mobile-nav-active");
    mobileNavToggleBtn.classList.toggle("bi-list");
    mobileNavToggleBtn.classList.toggle("bi-x");
  }
  mobileNavToggleBtn.addEventListener("click", mobileNavToogle);

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll("#navmenu a").forEach((navmenu) => {
    navmenu.addEventListener("click", () => {
      if (document.querySelector(".mobile-nav-active")) {
        mobileNavToogle();
      }
    });
  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll(".navmenu .toggle-dropdown").forEach((navmenu) => {
    navmenu.addEventListener("click", function (e) {
      e.preventDefault();
      this.parentNode.classList.toggle("active");
      this.parentNode.nextElementSibling.classList.toggle("dropdown-active");
      e.stopImmediatePropagation();
    });
  });

  /**
   * Preloader
   */
  const preloader = document.querySelector("#preloader");
  if (preloader) {
    window.addEventListener("load", () => {
      preloader.remove();
    });
  }

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector(".scroll-top");

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100
        ? scrollTop.classList.add("active")
        : scrollTop.classList.remove("active");
    }
  }
  scrollTop.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  window.addEventListener("load", toggleScrollTop);
  document.addEventListener("scroll", toggleScrollTop);

  
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function (swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);
})();


document.addEventListener('DOMContentLoaded', function () {
    const filterBtns = document.querySelectorAll('.post-filter-btn');
    const posts = document.querySelectorAll('.post-container');
    const noPostsMessage = document.getElementById('no-posts-message');

    // Enable comment input functionality
    const commentInputs = document.querySelectorAll('.comment-input');
    commentInputs.forEach(input => {
        const submitBtn = input.nextElementSibling;

        input.addEventListener('input', function () {
            submitBtn.disabled = !this.value.trim();
        });

        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter' && this.value.trim()) {
                addComment(this);
            }
        });

        submitBtn.addEventListener('click', function () {
            addComment(input);
        });
    });

    // Add click event to filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            // Remove active class from all buttons
            filterBtns.forEach(btn => btn.classList.remove('active'));

            // Add active class to clicked button
            this.classList.add('active');

            // Get filter value
            const filterValue = this.getAttribute('data-filter');
            let visiblePosts = 0;

            // Filter posts
            posts.forEach(post => {
                if (filterValue === 'all' || post.getAttribute('data-category') === filterValue) {
                    post.style.display = 'block';
                    visiblePosts++;
                } else {
                    post.style.display = 'none';
                }
            });

            // Show/hide no posts message
            if (visiblePosts === 0) {
                noPostsMessage.style.display = 'block';
            } else {
                noPostsMessage.style.display = 'none';
            }
        });
    });    // Initialize translated counts
    document.querySelectorAll('[data-key="likesCount"], [data-key="commentsCount"]').forEach(element => {
        const count = parseInt(element.getAttribute('data-count'));
        updateTranslatedCount(element, count, element.getAttribute('data-key'));
    });
    
    // Set translated comment placeholders
    document.querySelectorAll('.comment-input').forEach(input => {
        const lang = localStorage.getItem('language') || 'en';
        input.placeholder = translations[lang].commentPlaceholder;
    });
});

// Toggle like function
function toggleLike(button) {
    button.classList.toggle('liked');
    const likesCount = button.closest('.post-actions').previousElementSibling.querySelector('.post-reactions span');
    let count = parseInt(likesCount.getAttribute('data-count'));

    if (button.classList.contains('liked')) {
        count++;
    } else {
        count--;
    }

    likesCount.setAttribute('data-count', count);
    updateTranslatedCount(likesCount, count, 'likesCount');
}

// Focus comment input function
function focusCommentInput(button) {
    const commentInput = button.closest('.post-container').querySelector('.comment-input');
    commentInput.focus();
}

// Add comment function
function addComment(inputElement) {
    const commentText = inputElement.value.trim();
    if (!commentText) return;

    const commentsContainer = inputElement.closest('.comments-container');
    const commentForm = inputElement.closest('.comment-form');
    const currentUserAvatar = commentForm.querySelector('.comment-avatar').src;

    // Create new comment
    const newComment = document.createElement('div');
    newComment.className = 'comment';
    newComment.innerHTML = `
        <img src="${currentUserAvatar}" alt="You" class="comment-avatar">
        <div class="comment-content">
            <div class="comment-author">You</div>
            <div class="comment-text">${commentText}</div>
            <div class="comment-actions">
                <span class="comment-action">Like</span>
                <span class="comment-action">Reply</span>
                <span>Just now</span>
            </div>
        </div>
    `;

    // Insert before the comment form
    commentsContainer.insertBefore(newComment, commentForm);

    // Clear the input
    inputElement.value = '';
    inputElement.nextElementSibling.disabled = true;    // Update comment count
    const postStats = commentsContainer.closest('.post-container').querySelector('.post-stats');
    const commentCount = postStats.querySelector('div:last-child');
    const currentCount = parseInt(commentCount.getAttribute('data-count'));
    const newCount = currentCount + 1;
    commentCount.setAttribute('data-count', newCount);
    updateTranslatedCount(commentCount, newCount, 'commentsCount');
}

// Update translated count function
function updateTranslatedCount(element, count, translationKey) {
    const lang = localStorage.getItem('language') || 'en';
    const translation = translations[lang][translationKey].replace('%n', count);
    element.textContent = translation;
}
