document.addEventListener("DOMContentLoaded", () => {
    const images = document.querySelectorAll("img.post-thumbnail");

    images.forEach((img) => {
        img.addEventListener("error", () => {
            const fallback = img.getAttribute("data-fallback");
            if (fallback) {
                img.src = fallback;
            }
        });
    });
});
