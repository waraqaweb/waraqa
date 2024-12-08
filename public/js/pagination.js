document.addEventListener('DOMContentLoaded', () => {
    // Function to handle the previous page logic
    function prevPage(section) {
        console.log(`Previous page for section: ${section}`);
        // Add logic for loading the previous page of the section
        // Example: Update the DOM or make an API call
    }

    // Function to handle the next page logic
    function nextPage(section) {
        console.log(`Next page for section: ${section}`);
        // Add logic for loading the next page of the section
        // Example: Update the DOM or make an API call
    }

    // Add event listeners for the "Prev" and "Next" buttons
    document.querySelectorAll('.prev-page-btn').forEach(button => {
        button.addEventListener('click', () => {
            const section = button.getAttribute('data-section');
            prevPage(section);
        });
    });

    document.querySelectorAll('.next-page-btn').forEach(button => {
        button.addEventListener('click', () => {
            const section = button.getAttribute('data-section');
            nextPage(section);
        });
    });

    // Example toggleTab function (if needed for tab switching)
    function toggleTab(tab) {
        // Hide all tab content
        document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');

        // Remove the active class from all buttons
        document.querySelectorAll('.tabs button').forEach(btn => btn.classList.remove('active'));

        // Show the selected tab content
        document.getElementById(tab).style.display = 'block';

        // Add the active class to the clicked button
        document.getElementById(tab + '-btn').classList.add('active');
    }

    // Attach event listeners for tab buttons
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.id.split('-')[0]; // Extract 'posts', 'compose', etc.
            toggleTab(tabId);
        });
    });
});
