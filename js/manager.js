let dir = document.querySelector(".curr-path");
let instMgBtn = document.querySelector(".inst-mg-btn");
let dash = document.querySelector(".dash");
let stdDetails = document.querySelector(".std-details");
let cDetails = document.querySelector(".c-details");
let addInst = document.querySelector(".add-inst");
addInst.style.display = "none";

let instViewBtn = document.querySelector(".inst-view");
let instFName = document.querySelector(".inst-f-name");
let instLName = document.querySelector(".inst-l-name");
// let instName = document.querySelector(".inst-name");
let instEmail = document.querySelector(".inst-email");
let instPass = document.querySelector(".inst-pass");
let instPhone = document.querySelector(".inst-phone");
let instDesc = document.querySelector(".inst-desc");
let instImg = document.querySelector(".inst-img");

instMgBtn.addEventListener("click", function () {
  dir.innerHTML = "manage Instructors";
  dash.style.display = "none";
  stdDetails.style.display = "none";
  cDetails.style.display = "none";
  addInst.style.display = "block";
});

instViewBtn.addEventListener("click", function () {
  dir.innerHTML = "view Instructor";
  fetch(
    `https://uccd-etmsy.ondigitalocean.app/api/v1/manager/instructor/show?email=${instEmail.value}`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      // instFName.value = data.firstname || "";
      // instLName.value = data.lastname || "";
      instName.value = data.name || "";
      instPass.value = data.password || "";
      instPhone.value = data.phone || "";
      instDesc.value = data.description || "";
      // instImg.src = data.image || "";
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
});
