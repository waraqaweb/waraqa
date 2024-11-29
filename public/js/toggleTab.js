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

document.addEventListener('DOMContentLoaded', () => {
    // Attach event listeners to all tab buttons
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.id.split('-')[0]; // Extract 'posts', 'compose', etc.
            toggleTab(tabId);
        });
    });
});
