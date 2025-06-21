document.addEventListener('DOMContentLoaded', function() {
  const fileInput = document.getElementById("file-input");
  const filesList = document.getElementById("files-list");
  const numOfFiles = document.getElementById("num-of-files");
  
  if (fileInput && filesList && numOfFiles) {
    fileInput.addEventListener("change", () => {
      filesList.innerHTML = "";
      
      if (fileInput.files.length === 0) {
        numOfFiles.textContent = "No Files Chosen";
      } else if (fileInput.files.length === 1) {
        numOfFiles.textContent = "1 File Selected";
      } else {
        numOfFiles.textContent = `${fileInput.files.length} Files Selected`;
      }
      
      for (const file of fileInput.files) {
        let listItem = document.createElement("li");
        listItem.classList.add("file-item");
        
        let fileName = file.name;
        let fileSize = (file.size / 1024).toFixed(1);
        let sizeUnit = "KB";
        
        if (fileSize >= 1024) {
          fileSize = (fileSize / 1024).toFixed(1);
          sizeUnit = "MB";
        }
        
        listItem.innerHTML = `
          <span class="file-name">${fileName}</span>
          <span class="file-size">${fileSize} ${sizeUnit}</span>
        `;
        
        filesList.appendChild(listItem);
      }
    });
  }
});
