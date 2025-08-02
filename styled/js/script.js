// Global initialization for Book Haven site
const BookHaven = {
    init() {
        this.setupMobileMenu();
    },

    setupMobileMenu() {
        const menuToggle = document.querySelector('.nav-toggle');
        const menu = document.querySelector('.nav-menu');

        if (menuToggle && menu) {
            menuToggle.addEventListener('click', () => {
                menu.classList.toggle('active');
            });
        }
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    BookHaven.init();
});
