function updateCharCount(input, counterId, maxCount) {
    const currentLength = input.value.length;
    const remaining = maxCount - currentLength;
    const counterElement = document.getElementById(counterId);

    if (currentLength > maxCount) {
        counterElement.style.color = "red";
    } else {
        counterElement.style.color = "#777";
    }

    counterElement.textContent = `Characters: ${currentLength}/${maxCount} (Remaining: ${Math.max(remaining, 0)})`;
}

function updateWordCount(editor, counterId) {
    const contentText = editor.root.innerText.trim(); // Extract text without HTML tags
    const words = contentText.split(/\s+/).filter(word => word.length > 0); // Split and filter empty words
    const wordCount = words.length;

    const counterElement = document.getElementById(counterId);
    counterElement.textContent = `Words: ${wordCount}`;
}

document.getElementById("postTitle").addEventListener("input", function () {
    updateCharCount(this, "titleCounter", 60);
});

document.getElementById("postSlug").addEventListener("input", function () {
    updateCharCount(this, "slugCounter", 60);
});

// Attach word counter to the Quill editor
quill.on('text-change', function () {
    updateWordCount(quill, "editorWordCounter");
});
