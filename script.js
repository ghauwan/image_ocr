document.getElementById('extractButton').addEventListener('click', function() {
    const imageInput = document.getElementById('imageInput');
    const outputDiv = document.getElementById('output');
    const loadingMessage = document.getElementById('loadingMessage');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const textPanel = document.getElementById('textPanel');
    const languageSelect = document.getElementById('languageSelect');

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
            // Show loading spinner and message
            loadingSpinner.style.display = 'block';
            loadingMessage.style.display = 'block';
            loadingMessage.textContent = 'Extracting text, please wait...';
            outputDiv.innerHTML = ''; // Clear previous output
            textPanel.value = ''; // Clear the text panel

            // Get the selected language
            const selectedLanguage = languageSelect.value;

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

                // Display the image in the output div
                const imgElement = document.createElement('img');
                imgElement.src = img.src;
                imgElement.alt = 'Uploaded Image';
                imgElement.style.maxWidth = '100%'; // Responsive image
                imgElement.style.marginBottom = '20px'; // Add margin for spacing
                outputDiv.appendChild(imgElement); // Append image to output div

                // Populate text panel with extracted text
                textPanel.value = text; // Populate text panel with extracted text
            }).catch(err => {
                // Hide loading spinner and message
                loadingSpinner.style.display = 'none';
                loadingMessage.style.display = 'none';
                outputDiv.textContent = 'Error: ' + err.message;
            });
        };
    };

    reader.readAsDataURL(file);
});

// Copy text button functionality
document.getElementById('copyTextButton').addEventListener('click', function() {
    const textPanel = document.getElementById('textPanel');
    textPanel.select();
    document.execCommand('copy');
    
});

// Update the copyright year dynamically
document.getElementById('currentYear').textContent = new Date().getFullYear();

