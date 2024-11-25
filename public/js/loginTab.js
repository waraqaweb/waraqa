function showTab(tab) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    // Show the selected tab content
    document.getElementById(tab).classList.add('active');
    
    // Update tab buttons
    document.querySelectorAll('.tab-link').forEach(button => button.classList.remove('active'));
    document.querySelector(`[onclick="showTab('${tab}')"]`).classList.add('active');
}
