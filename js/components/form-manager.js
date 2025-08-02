// Form Manager with validation and auto-save
const FormManager = {
    init() {
        this.setupForms();
        this.setupAutoSave();
    },

    setupForms() {
        document.querySelectorAll('form[data-validate]').forEach(form => {
            form.setAttribute('novalidate', true);
            form.addEventListener('submit', this.handleSubmit.bind(this));
            
            // Real-time validation
            form.querySelectorAll('input, textarea, select').forEach(field => {
                field.addEventListener('blur', () => this.validateField(field));
                field.addEventListener('input', () => this.handleInput(field));
            });
        });
    },

    setupAutoSave() {
        document.querySelectorAll('form[data-autosave]').forEach(form => {
            const formId = form.id || `form-${Math.random().toString(36).substr(2, 9)}`;
            form.id = formId;

            // Restore saved data if exists
            const savedData = localStorage.getItem(`formData_${formId}`);
            if (savedData) {
                this.restoreFormData(form, JSON.parse(savedData));
            }

            // Setup auto-save
            let saveTimeout;
            form.addEventListener('input', () => {
                clearTimeout(saveTimeout);
                saveTimeout = setTimeout(() => this.saveFormData(form), 1000);
            });
        });
    },

    saveFormData(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        localStorage.setItem(`formData_${form.id}`, JSON.stringify(data));
    },

    restoreFormData(form, data) {
        Object.entries(data).forEach(([name, value]) => {
            const field = form.querySelector(`[name="${name}"]`);
            if (field) {
                field.value = value;
                this.validateField(field);
            }
        });

        // Show restoration notice
        BookHaven.showModal({
            title: 'Form Data Restored',
            content: `
                <p>We've restored your previously entered data.</p>
                <p>You can continue where you left off.</p>
            `
        });
    },

    clearSavedData(formId) {
        localStorage.removeItem(`formData_${formId}`);
    },

    async handleSubmit(event) {
        event.preventDefault();
        const form = event.target;
        
        if (await this.validateForm(form)) {
            const submitButton = form.querySelector('[type="submit"]');
            if (submitButton) BookHaven.showLoading(submitButton);

            try {
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                
                // Handle different form types
                switch (form.dataset.formType) {
                    case 'contact':
                        await this.handleContactSubmit(data);
                        break;
                    case 'newsletter':
                        await this.handleNewsletterSubmit(data);
                        break;
                    case 'review':
                        await this.handleReviewSubmit(data);
                        break;
                    case 'custom-service':
                        await this.handleCustomServiceSubmit(data);
                        break;
                    default:
                        console.error('Unknown form type');
                        return;
                }

                // Clear saved data on successful submission
                if (form.id) this.clearSavedData(form.id);
                
                form.reset();
            } catch (error) {
                BookHaven.showModal({
                    title: 'Error',
                    content: `<p>${error.message}</p>`
                });
            } finally {
                if (submitButton) BookHaven.hideLoading(submitButton);
            }
        }
    },

    async validateForm(form) {
        let isValid = true;
        const fields = form.querySelectorAll('input, textarea, select');
        
        for (const field of fields) {
            if (!(await this.validateField(field))) {
                isValid = false;
            }
        }

        return isValid;
    },

    async validateField(field) {
        // Clear previous errors
        this.clearFieldError(field);

        // Skip validation if field is optional and empty
        if (!field.required && !field.value) return true;

        // Built-in HTML5 validation
        if (!field.checkValidity()) {
            this.showFieldError(field, field.validationMessage);
            return false;
        }

        // Custom validation rules
        const rules = field.dataset.validate ? field.dataset.validate.split(' ') : [];
        for (const rule of rules) {
            try {
                await this.validateRule(field, rule);
            } catch (error) {
                this.showFieldError(field, error.message);
                return false;
            }
        }

        return true;
    },

    async validateRule(field, rule) {
        switch (rule) {
            case 'email':
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
                    throw new Error('Please enter a valid email address');
                }
                break;

            case 'phone':
                if (!/^\+?[\d\s-]{10,}$/.test(field.value)) {
                    throw new Error('Please enter a valid phone number');
                }
                break;

            case 'password':
                if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(field.value)) {
                    throw new Error('Password must be at least 8 characters with letters and numbers');
                }
                break;

            case 'unique-email':
                const response = await BookHavenAPI.newsletter.checkEmail(field.value);
                if (!response.available) {
                    throw new Error('This email is already subscribed');
                }
                break;
        }
    },

    showFieldError(field, message) {
        field.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    },

    clearFieldError(field) {
        field.classList.remove('error');
        const errorDiv = field.parentNode.querySelector('.error-message');
        if (errorDiv) errorDiv.remove();
    },

    handleInput(field) {
        // Clear error when user starts typing
        this.clearFieldError(field);
        
        // Trigger validation after user stops typing
        clearTimeout(field.validateTimeout);
        field.validateTimeout = setTimeout(() => {
            this.validateField(field);
        }, 500);
    },

    // Form submission handlers
    async handleContactSubmit(data) {
        await BookHavenAPI.customServices.submit({
            type: 'contact',
            ...data
        });

        BookHaven.showModal({
            title: 'Message Sent',
            content: `
                <div class="success-message">
                    <h4>Thank You for Your Message!</h4>
                    <p>We'll get back to you within 24 hours.</p>
                </div>
            `
        });
    },

    async handleNewsletterSubmit(data) {
        await BookHavenAPI.newsletter.subscribe(data.email);

        BookHaven.showModal({
            title: 'Welcome Aboard!',
            content: `
                <div class="success-message">
                    <h4>Successfully Subscribed!</h4>
                    <p>You'll receive our next newsletter at ${data.email}</p>
                </div>
            `
        });
    },

    async handleReviewSubmit(data) {
        await BookHavenAPI.books.addReview(data.bookId, {
            rating: parseInt(data.rating),
            comment: data.comment
        });

        BookHaven.showModal({
            title: 'Review Submitted',
            content: `
                <div class="success-message">
                    <h4>Thank You for Your Review!</h4>
                    <p>Your feedback helps other readers make informed decisions.</p>
                </div>
            `
        });
    },

    async handleCustomServiceSubmit(data) {
        await BookHavenAPI.customServices.submit(data);

        BookHaven.showModal({
            title: 'Request Submitted',
            content: `
                <div class="success-message">
                    <h4>Custom Service Request Received!</h4>
                    <p>We'll review your requirements and contact you soon.</p>
                </div>
            `
        });
    }
};

// Initialize FormManager on page load
document.addEventListener('DOMContentLoaded', () => FormManager.init());

// Make FormManager available globally
window.FormManager = FormManager;
