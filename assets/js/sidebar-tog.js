let sbTog = document.querySelector(".sd-tog");

sbTog.addEventListener("click", function () {
  let sidebar = document.querySelector(".sb2-1");
  let mainContent = document.querySelector(".sb2-2");
  let path = document.querySelector(".path");

  if (window.innerWidth > 992) {
    sidebar.classList.toggle("active");
    mainContent.classList.toggle("shifted");
  } else {
    sidebar.classList.toggle("active");
    // path.classList.toggle("shifted");
  }

  // if (sidebar.classList.contains("active")) {
  //   sidebar.classList.remove("active");
  //   mainContent.classList.remove("shifted");
  //   sbTog.classList.remove("expand");
  // } else {
  //   sidebar.classList.add("active");
  //   sbTog.classList.add("expand");
  //   if (window.innerWidth > 992) {
  //     mainContent.classList.add("shifted");
  //   }
  // }
});
