document.addEventListener('DOMContentLoaded', () => {
    // Function to show the selected tab
    function showTab(tab) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        // Show the selected tab content
        document.getElementById(tab).classList.add('active');
        
        // Update tab buttons
        document.querySelectorAll('.tab-link').forEach(button => button.classList.remove('active'));
        const correspondingButton = document.querySelector(`[data-tab="${tab}"]`);
        if (correspondingButton) {
            correspondingButton.classList.add('active');
        }
    }

    // Add event listeners to all elements with data-tab attributes
    document.querySelectorAll('[data-tab]').forEach(element => {
        element.addEventListener('click', () => {
            const tab = element.getAttribute('data-tab');
            showTab(tab);
        });
    });
});
