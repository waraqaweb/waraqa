// Include additional fonts
const Font = Quill.import('formats/font');
Font.whitelist = ['default', 'arial', 'georgia', 'helvetica', 'courier', 'comic', 'impact', 'times'];
Quill.register(Font, true);
// Initialize Quill editor
const quill = new Quill('#editor', {
    theme: 'snow',
    modules: {
        toolbar: [
            // Font and size options
            [{ 'font': Font.whitelist }, { 'size': [] }],
            
            // Text formatting options
            ['bold', 'italic', 'underline', 'strike'], // toggle buttons for text style
            
            // Text color and background color
            [{ 'color': [] }, { 'background': [] }],
            
            // Block formatting options
            [{ 'script': 'sub' }, { 'script': 'super' }], // superscript/subscript
            [{ 'header': '1' }, { 'header': '2' }, { 'header': [1,2,3, 4, 5, 6, false] }], // headers
            [{ 'list': 'ordered' }, { 'list': 'bullet' }], // ordered/unordered list
            [{ 'indent': '-1' }, { 'indent': '+1' }], // outdent/indent
            [{ 'direction': 'rtl' }], // text direction
            
            // Alignment options
            [{ 'align': [] }], // text alignment
            
            // Block elements
            ['blockquote', 'code-block'],
            
            // Inline links, images, and videos
            ['link', 'image', 'video'],
            // Clear formatting
            ['clean'] // remove formatting
        ],
        
    }
});

// Save Quill content in the form submission
document.querySelector("form").addEventListener("submit", function(event) {
    document.getElementById("postBody").value = quill.root.innerHTML;
});
