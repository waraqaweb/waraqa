// Initialize CKEditor on the bio textarea
ClassicEditor
    .create(document.querySelector('#bio'), {
        toolbar: [
            'heading', '|', 'bold', 'italic', 'link', '|', 'fontColor', 'fontSize', '|', 'alignment', '|', 'bulletedList', 'numberedList', '|', 'blockQuote', '|', 'undo', 'redo'
        ],
        language: 'en'
    })
    .catch(error => {
        console.error(error);
    });
