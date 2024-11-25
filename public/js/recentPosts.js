document.addEventListener("DOMContentLoaded", () => {
    const recentPosts = document.querySelectorAll(".recent-post-box:not(.most-recent)");

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("animate");
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, { threshold: 0.1 }); // Trigger animation when 10% of element is in view

    recentPosts.forEach(post => observer.observe(post));
});
