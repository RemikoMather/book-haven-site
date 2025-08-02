// Common functionality for all pages
document.addEventListener('DOMContentLoaded', () => {
    // Newsletter form submission
    const newsletterForm = document.querySelector('.footer-newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = e.target.querySelector('input[type="email"]').value;
            alert(`Thank you for subscribing with ${email}! We'll keep you updated.`);
            e.target.reset();
        });
    }

    // Mobile menu toggle (if needed)
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Social media links
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const platform = e.currentTarget.querySelector('i').classList[1].split('-')[1];
            alert(`Redirecting to ${platform}...`);
        });
    });
});
