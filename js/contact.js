document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.contact-form');
    const submitButton = form.querySelector('button[type="submit"]');
    const loadingIndicator = submitButton.querySelector('.loading-indicator');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        try {
            submitButton.disabled = true;
            loadingIndicator.style.display = 'inline-block';

            const formData = new FormData(form);
            const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
            const response = await fetch('/submit-contact', {
                method: 'POST',
                headers: {
                    'X-CSRF-Token': csrfToken,
                    'Accept': 'application/json'
                },
                body: formData,
                credentials: 'same-origin'
            });

            if (!response.ok) throw new Error('Submission failed');

            showSuccess('Message sent successfully! We\'ll get back to you soon.');
            form.reset();
        } catch (error) {
            showError('Failed to send message. Please try again later.');
        } finally {
            submitButton.disabled = false;
            loadingIndicator.style.display = 'none';
        }
    });

    function validateForm() {
        let isValid = true;
        const fields = {
            name: { min: 2, message: 'Please enter your name (minimum 2 characters)' },
            email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email address' },
            message: { min: 10, message: 'Please enter a message (minimum 10 characters)' }
        };

        Object.entries(fields).forEach(([fieldName, rules]) => {
            const field = form.elements[fieldName];
            const errorElement = document.getElementById(`${fieldName}-error`);
            
            if (rules.min && field.value.length < rules.min) {
                showFieldError(errorElement, rules.message);
                isValid = false;
            } else if (rules.pattern && !rules.pattern.test(field.value)) {
                showFieldError(errorElement, rules.message);
                isValid = false;
            } else {
                errorElement.textContent = '';
            }
        });

        return isValid;
    }

    function showFieldError(element, message) {
        element.textContent = message;
        element.classList.add('show');
    }

    function showSuccess(message) {
        const alert = createAlert('success', message);
        form.insertAdjacentElement('beforebegin', alert);
        setTimeout(() => alert.remove(), 5000);
    }

    function showError(message) {
        const alert = createAlert('error', message);
        form.insertAdjacentElement('beforebegin', alert);
        setTimeout(() => alert.remove(), 5000);
    }

    function createAlert(type, message) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        return alert;
    }
});
