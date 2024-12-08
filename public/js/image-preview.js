// image-preview.js
const imageInput = document.getElementById('image');
const previewContainer = document.getElementById('imagePreviewContainer');
const previewImage = document.getElementById('imagePreview');

imageInput.addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            previewImage.src = e.target.result;
            previewContainer.style.display = 'block'; // Show the preview container
        };
        reader.readAsDataURL(file); // Convert image to Base64
    } else {
        previewContainer.style.display = 'none'; // Hide the preview if no file is selected
    }
});
