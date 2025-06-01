/**
 * Sidebar Collapsible Initialization (Accordion Style with faster animation)
 */
$(document).ready(function () {
  $(".collapsible-body").hide();

  $(".collapsible-header").click(function (e) {
    e.preventDefault();

    const isActive = $(this).hasClass("active");

    $(".collapsible-body").slideUp(150);
    $(".collapsible-header").removeClass("active");

    if (!isActive) {
      $(this).next(".collapsible-body").slideDown(150);
      $(this).addClass("active");
    }
  });
});
