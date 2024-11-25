// Initialize CKEditor on the textarea
ClassicEditor
    .create(document.querySelector('#postBody'), {
        toolbar: [
            'heading', '|', 'bold', 'italic', 'link', '|', 'fontColor', 'fontSize', '|', 'alignment', '|', 'bulletedList', 'numberedList', '|', 'blockQuote', '|', 'undo', 'redo'
        ],
        language: 'en'
    })
    .catch(error => {
        console.error(error);
    });
