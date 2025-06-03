document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('toggleSidebar');
    const sidebar = document.querySelector('.sidebar');

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');

            toggleBtn.textContent = sidebar.classList.contains('collapsed') ? '▶' : '☰';

            const texts = sidebar.querySelectorAll('.nav-link span, .footer span, .title');
            texts.forEach(el => {
                el.style.display = sidebar.classList.contains('collapsed') ? 'none' : 'inline';
            });
        });
    }
});