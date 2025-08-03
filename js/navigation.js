class Navigation {
    constructor() {
        this.nav = document.querySelector('.nav-container');
        this.menuButton = document.querySelector('.menu-toggle');
        this.navMenu = document.querySelector('.nav-menu');
        this.dropdowns = document.querySelectorAll('.nav-dropdown');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Mobile menu toggle
        this.menuButton?.addEventListener('click', () => this.toggleMenu());

        // Handle dropdowns
        this.dropdowns?.forEach(dropdown => {
            const trigger = dropdown.querySelector('.dropdown-trigger');
            trigger?.addEventListener('click', (e) => this.toggleDropdown(e, dropdown));
        });

        // Close menu on outside click
        document.addEventListener('click', (e) => this.handleOutsideClick(e));

        // Handle escape key
        document.addEventListener('keydown', (e) => this.handleEscapeKey(e));

        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    toggleMenu() {
        const isExpanded = this.menuButton.getAttribute('aria-expanded') === 'true';
        this.menuButton.setAttribute('aria-expanded', !isExpanded);
        this.navMenu.classList.toggle('nav-menu--active');
        
        // Trap focus within menu when open
        if (!isExpanded) {
            this.trapFocus(this.navMenu);
        }
    }

    toggleDropdown(event, dropdown) {
        event.preventDefault();
        const trigger = dropdown.querySelector('.dropdown-trigger');
        const content = dropdown.querySelector('.dropdown-content');
        const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

        // Close other dropdowns
        this.dropdowns.forEach(other => {
            if (other !== dropdown) {
                const otherTrigger = other.querySelector('.dropdown-trigger');
                const otherContent = other.querySelector('.dropdown-content');
                otherTrigger.setAttribute('aria-expanded', 'false');
                otherContent.classList.remove('dropdown-content--active');
            }
        });

        // Toggle current dropdown
        trigger.setAttribute('aria-expanded', !isExpanded);
        content.classList.toggle('dropdown-content--active');
    }

    handleOutsideClick(event) {
        if (
            !event.target.closest('.nav-menu') && 
            !event.target.closest('.menu-toggle') &&
            this.navMenu.classList.contains('nav-menu--active')
        ) {
            this.toggleMenu();
        }
    }

    handleEscapeKey(event) {
        if (event.key === 'Escape') {
            this.navMenu.classList.remove('nav-menu--active');
            this.menuButton.setAttribute('aria-expanded', 'false');
            this.dropdowns.forEach(dropdown => {
                const trigger = dropdown.querySelector('.dropdown-trigger');
                const content = dropdown.querySelector('.dropdown-content');
                trigger.setAttribute('aria-expanded', 'false');
                content.classList.remove('dropdown-content--active');
            });
        }
    }

    handleResize() {
        if (window.innerWidth > 768) {
            this.navMenu.classList.remove('nav-menu--active');
            this.menuButton.setAttribute('aria-expanded', 'false');
        }
    }

    trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'a[href], button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])'
        );
        
        if (focusableElements.length === 0) return;

        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        element.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        lastFocusable.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        firstFocusable.focus();
                        e.preventDefault();
                    }
                }
            }
        });

        firstFocusable.focus();
    }
}

// Initialize navigation
document.addEventListener('DOMContentLoaded', () => {
    new Navigation();
});
