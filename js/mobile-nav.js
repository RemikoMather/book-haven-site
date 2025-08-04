document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    // Only setup mobile nav if elements exist
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            const isExpanded = navLinks.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', isExpanded);
            
            // Change icon based on state
            const icon = menuToggle.querySelector('i');
            icon.className = isExpanded ? 'fas fa-times' : 'fas fa-bars';
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInside = navLinks.contains(event.target) || menuToggle.contains(event.target);
            if (!isClickInside && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.querySelector('i').className = 'fas fa-bars';
            }
        });
    }
});
