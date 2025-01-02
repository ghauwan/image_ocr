let cropper;

document.getElementById('imageInput').addEventListener('change', function(event) {
    const imageInput = event.target;
    const outputDiv = document.getElementById('output');
    const loadingMessage = document.getElementById('loadingMessage');
    const loadingSpinner = document.getElementById('loadingSpinner');

    if (imageInput.files.length === 0) {
        outputDiv.textContent = 'Please upload an image.';
        return;
    }

    const file = imageInput.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const img = new Image();
        img.src = event.target.result;

        img.onload = function() {
            // Clear previous output
            outputDiv.innerHTML = '';
            loadingMessage.style.display = 'none';
            loadingSpinner.style.display = 'none';

            // Create a new image element for cropping
            const cropperContainer = document.createElement('div');
            cropperContainer.style.width = '100%';
            cropperContainer.style.height = '500px'; // Set a fixed height for cropping
            outputDiv.appendChild(cropperContainer);

            const imgElement = document.createElement('img');
            imgElement.src = img.src;
            cropperContainer.appendChild(imgElement);

            // Initialize Cropper.js
            cropper = new Cropper(imgElement, {
                aspectRatio: NaN, // Allow free cropping
                viewMode: 1,
                autoCropArea: 1,
                responsive: true,
                background: false,
                zoomable: true,
                scalable: true,
                minCropBoxWidth: 50, // Minimum crop box width
                minCropBoxHeight: 50, // Minimum crop box height
                ready: function () {
                    // Set the initial zoom level to fit the image within the cropping area
                    const cropperInstance = this.cropper;
                    cropperInstance.setCropBoxData({
                        left: 0,
                        top: 0,
                        width: cropperInstance.getContainerData().width,
                        height: cropperInstance.getContainerData().height
                    });
                },
                zoom: function(event) {
                    // Adjust scroll position based on zoom level
                    const container = cropper.getContainerData();
                    const scale = event.detail.ratio;

                    // Dynamically adjust the vertical scroll based on the zoom
                    const scrollPosition = container.height * (scale - 1);
                    cropperContainer.scrollTop = scrollPosition;
                }
            });
        };
    };

    reader.readAsDataURL(file);
});

document.getElementById('extractButton').addEventListener('click', function() {
    const outputDiv = document.getElementById('output');
    const loadingMessage = document.getElementById('loadingMessage');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const textPanel = document.getElementById('textPanel');
    const languageSelect = document.getElementById('languageSelect');

    if (!cropper) {
        outputDiv.textContent = 'Please upload and crop an image first.';
        return;
    }

    // Get the cropped canvas
    const canvas = cropper.getCroppedCanvas();

    // Show loading spinner and message
    loadingSpinner.style.display = 'block';
    loadingMessage.style.display = 'block';
    loadingMessage.textContent = 'Extracting text, please wait...';
    outputDiv.innerHTML = ''; // Clear previous output
    textPanel.value = ''; // Clear the text panel

    // Get the selected language
    const selectedLanguage = languageSelect.value;

    // Convert the cropped canvas to a data URL
    canvas.toBlob(function(blob) {
        const img = new Image();
        const url = URL.createObjectURL(blob);
        img.src = url;

        Tesseract.recognize(
            img,
            selectedLanguage, // Use the selected language
            {
                logger: info => {
                    console.log(info); // Log progress to console
                    loadingMessage.textContent = `Extracting text... ${Math.round(info.progress * 100)}%`; // Update loading message
                }
            }
        ).then(({ data: { text } }) => {
            // Hide loading spinner and message
            loadingSpinner.style.display = 'none';
            loadingMessage.style.display = 'none';

            // Create a container for the cropped image
            const croppedImageContainer = document.createElement('div');
            croppedImageContainer.className = 'cropped-image-container'; // Add class for styling
            outputDiv.appendChild(croppedImageContainer); // Append container to output div

            // Display the cropped image in the output div
            const imgElement = document.createElement('img');
            imgElement.src = url;
            imgElement.alt = 'Cropped Image';
            croppedImageContainer.appendChild(imgElement); // Append image to the container

            // Populate text panel with extracted text
            textPanel.value = text; // Populate text panel with extracted text
        }).catch(err => {
            // Hide loading spinner and message
            loadingSpinner.style.display = 'none';
            loadingMessage.style.display = 'none';
            outputDiv.textContent = 'Error: ' + err.message;
        });
    });
});

// Copy text button functionality
document.getElementById('copyTextButton').addEventListener('click', function() {
    const textPanel = document.getElementById('textPanel');
    textPanel.select();
    document.execCommand('copy');
});

// Update the copyright year dynamically
document.getElementById('currentYear').textContent = new Date().getFullYear();
