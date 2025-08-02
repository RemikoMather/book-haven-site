// Global Validator Utility
const Validator = {
    email(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    showError(element, message) {
        element.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        element.parentNode.appendChild(errorDiv);
    },

    clearError(element) {
        element.classList.remove('error');
        const errorDiv = element.parentNode.querySelector('.error-message');
        if (errorDiv) errorDiv.remove();
    },

    validateForm(form) {
        let isValid = true;
        const fields = form.querySelectorAll('input, textarea, select');
        
        fields.forEach(field => {
            this.clearError(field);
            
            if (field.required && !field.value.trim()) {
                this.showError(field, 'This field is required');
                isValid = false;
            }
            
            if (field.type === 'email' && field.value && !this.email(field.value)) {
                this.showError(field, 'Please enter a valid email address');
                isValid = false;
            }
        });

        return isValid;
    }
};

// Modal System
const Modal = {
    create(options) {
        // Remove any existing modals
        const existingModal = document.querySelector('.modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content wireframe-box">
                <div class="wireframe-label">${options.title || 'MODAL'}</div>
                <div class="modal-body">${options.content}</div>
                <div class="modal-footer">
                    ${options.footer || '<button class="btn" onclick="Modal.close(this)">Close</button>'}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
        return modal;
    },

    close(element) {
        const modal = element.closest('.modal');
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
};

// Make utilities available globally
window.Validator = Validator;
window.Modal = Modal;

// Page Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the footer on every page
    const footerContainer = document.getElementById('footer-container');
    if (footerContainer && window.Footer) {
        footerContainer.appendChild(Footer.init());
    }

    // Initialize cart if available
    if (window.Cart) {
        Cart.init();
    }

    // Initialize contact form if available
    if (window.ContactForm) {
        ContactForm.init();
    }

    // Initialize custom page if available
    if (window.CustomPage) {
        CustomPage.init();
    }
});
