// Initialize Quill editor
const quill = new Quill('#editor', {
    theme: 'snow',
    modules: {
        toolbar: [
            ['bold', 'italic', 'underline'],
            ['blockquote', 'code-block'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'align': [] }],
            ['link', 'image'],
            [{ 'header': '1' }, { 'header': '2' }],
            ['clean']
        ]
    }
});

document.querySelector("form").addEventListener("submit", function(event) {
    document.getElementById("postBody").value = quill.root.innerHTML;
});
