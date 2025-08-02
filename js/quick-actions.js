// Quick Actions functionality
class QuickActions {
    constructor() {
        this.toggle = document.querySelector('.quick-actions-toggle');
        this.menu = document.querySelector('.quick-actions-menu');
        this.setupListeners();
    }

    setupListeners() {
        if (!this.toggle || !this.menu) return;

        this.toggle.addEventListener('click', () => this.toggleMenu());
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.quick-actions')) {
                this.closeMenu();
            }
        });

        // Close menu when scrolling
        let lastScroll = window.scrollY;
        window.addEventListener('scroll', () => {
            if (window.scrollY !== lastScroll) {
                this.closeMenu();
                lastScroll = window.scrollY;
            }
        });
    }

    toggleMenu() {
        const isExpanded = this.toggle.getAttribute('aria-expanded') === 'true';
        this.toggle.setAttribute('aria-expanded', !isExpanded);
        this.menu.classList.toggle('active');
        
        // Rotate toggle icon
        const icon = this.toggle.querySelector('i');
        icon.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(45deg)';
    }

    closeMenu() {
        this.toggle.setAttribute('aria-expanded', 'false');
        this.menu.classList.remove('active');
        this.toggle.querySelector('i').style.transform = 'rotate(0deg)';
    }
}

// Initialize Quick Actions
document.addEventListener('DOMContentLoaded', () => {
    new QuickActions();
});
