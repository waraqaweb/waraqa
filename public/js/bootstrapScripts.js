// Load Bootstrap dependencies
(function() {
    const scripts = [
        "https://code.jquery.com/jquery-3.5.1.slim.min.js",
        "https://cdn.jsdelivr.net/npm/@popperjs/core@2.5.2/dist/umd/popper.min.js",
        "https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"
    ];

    scripts.forEach(src => {
        const script = document.createElement('script');
        script.src = src;
        script.async = false; // Ensures scripts load in order
        document.head.appendChild(script);
    });
})();
