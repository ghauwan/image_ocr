let cropper;

document.addEventListener("DOMContentLoaded", function() {
    const imageInput = document.getElementById("imageInput");
    const outputDiv = document.getElementById("output");
    const loadingMessage = document.getElementById("loadingMessage");
    const loadingSpinner = document.getElementById("loadingSpinner");
    const textPanel = document.getElementById("textPanel");
    const languageSelect = document.getElementById("languageSelect");

    // Load previously uploaded image from localStorage
    const savedImageData = localStorage.getItem("uploadedImage");
    if (savedImageData) {
        loadImage(savedImageData);
    }

    // Event listener for image upload
    imageInput.addEventListener("change", function(event) {
        if (imageInput.files.length === 0) {
            outputDiv.textContent = "Please upload an image.";
            return;
        }

        const file = imageInput.files[0];
        const reader = new FileReader();

        reader.onload = function(event) {
            const imageData = event.target.result;
            localStorage.setItem("uploadedImage", imageData); // Save image to localStorage
            loadImage(imageData);
        };

        reader.readAsDataURL(file);
    });

    function loadImage(imageData) {
        const img = new Image();
        img.src = imageData;

        img.onload = function() {
            // Clear previous output
            outputDiv.innerHTML = "";
            loadingMessage.style.display = "none";
            loadingSpinner.style.display = "none";

            // Create a new image element for cropping
            const cropperContainer = document.createElement("div");
            cropperContainer.style.width = "110%";
            cropperContainer.style.height = "600px";
            outputDiv.appendChild(cropperContainer);

            const imgElement = document.createElement("img");
            imgElement.src = img.src;
            cropperContainer.appendChild(imgElement);

            // Initialize Cropper.js
            if (cropper) {
                cropper.destroy(); // Destroy the previous cropper instance
            }

            cropper = new Cropper(imgElement, {
                aspectRatio: NaN,
                viewMode: 1,
                autoCropArea: 1,
                responsive: true,
                background: false,
                zoomable: true,
                scalable: true,
                minCropBoxWidth: 50,
                minCropBoxHeight: 50
            });
        };
    }

    document.getElementById("extractButton").addEventListener("click", function() {
        if (!cropper) {
            outputDiv.textContent = "Please upload and crop an image first.";
            return;
        }

        const canvas = cropper.getCroppedCanvas();

        // Show loading spinner and message
        loadingSpinner.style.display = "block";
        loadingMessage.style.display = "block";
        loadingMessage.textContent = "Extracting text, please wait...";
        outputDiv.innerHTML = "";
        textPanel.value = "";

        const selectedLanguage = languageSelect.value;

        canvas.toBlob(function(blob) {
            const img = new Image();
            const url = URL.createObjectURL(blob);
            img.src = url;

            Tesseract.recognize(img, selectedLanguage, {
                config: '+ equ + psm 6',
                logger: info => {
                    console.log(info);
                    loadingMessage.textContent = `Extracting text... ${Math.round(info.progress * 100)}%`;
                }
            })
            .then(({ data: { text } }) => {
                // Hide loading spinner and message
                loadingSpinner.style.display = "none";
                loadingMessage.style.display = "none";

                // Display the cropped image in the output div
                const imgElement = document.createElement("img");
                imgElement.src = url;
                imgElement.alt = "Cropped Image";
                imgElement.style.maxWidth = "100%"; // Ensure image fits within the container
                imgElement.style.height = "auto";
                outputDiv.appendChild(imgElement);

                // Populate text panel with extracted text
                textPanel.value = text;
            })
            .catch(err => {
                loadingSpinner.style.display = "none";
                loadingMessage.style.display = "none";
                outputDiv.textContent = "Error: " + err.message;
            });
        });
    });

    // Copy text button functionality
    document.getElementById("copyTextButton").addEventListener("click", function() {
        textPanel.select();
        document.execCommand("copy");
    });

    // Update the copyright year dynamically
    document.getElementById("currentYear").textContent = new Date().getFullYear();
});