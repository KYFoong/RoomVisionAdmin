import { logOut } from "./logout.js";

fetch("sidebar.html")
.then(response => response.text())
.then(data => {
    document.getElementById("sidebar-container").innerHTML = data;
    document.querySelector("#logOut").addEventListener("click", logOut);

    const toggleBtn = document.getElementById('toggleSidebar');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');

    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed) {
        sidebar.classList.add('collapsed');
        if (mainContent) {
            mainContent.style.marginLeft = '60px';
            mainContent.style.width = 'calc(100% - 60px)';
        }
    
        // Hide sidebar text
        const texts = sidebar.querySelectorAll('.nav-link span, .footer span, .title');
        texts.forEach(el => {
            el.style.display = 'none';
        });
    } else {
        if (mainContent) {
            mainContent.style.marginLeft = '250px';
            mainContent.style.width = 'calc(100% - 250px)';
        }
    }

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
            mainContent.style.marginLeft = sidebar.classList.contains('collapsed') ? '60px' : '250px';
            mainContent.style.width = sidebar.classList.contains('collapsed') ? 'calc(100% - 60px)' : 'calc(100% - 250px)';

            // hange icon
            // toggleBtn.textContent = sidebar.classList.contains('collapsed') ? '▶' : '☰';

            // toggle text visibility
            const texts = sidebar.querySelectorAll('.nav-link span, .footer span, .title');
            texts.forEach(el => {
                el.style.display = sidebar.classList.contains('collapsed') ? 'none' : 'inline';
            });
        });
    }
})
.catch(error => console.error("Error loading sidebar", error));