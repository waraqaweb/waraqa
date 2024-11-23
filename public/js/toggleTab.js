function toggleTab(tab) {
    document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
    document.querySelectorAll('.tabs button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tab).style.display = 'block';
    document.getElementById(tab + '-btn').classList.add('active');
}
