let sbTog = document.querySelector(".sd-tog");

sbTog.addEventListener("click", function () {
  let sidebar = document.querySelector(".sb2-1");
  let mainContent = document.querySelector(".sb2-2");

  if (sbTog.classList.contains("expand")) {
    sbTog.classList.remove("expand");
    sidebar.style.display = "block";
    mainContent.style.width = "80%";
    mainContent.style.marginLeft = "20%";
  } else {
    sbTog.classList.add("expand");
    sidebar.style.display = "none";
    mainContent.style.width = "100%";
    mainContent.style.marginLeft = "0px";
  }
});
