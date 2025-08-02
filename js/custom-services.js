document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.custom-form');
    const serviceSelect = document.getElementById('service-type');
    const description = document.getElementById('description');
    const timeline = document.getElementById('timeline');
    const formKey = 'customOrderDraft';
    let autoSaveTimer;

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    timeline.min = today;

    // Load saved draft if exists
    const savedDraft = localStorage.getItem(formKey);
    if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        Object.entries(draft).forEach(([key, value]) => {
            if (form.elements[key]) {
                form.elements[key].value = value;
            }
        });
        showNotification('Draft loaded from your last session', 'info');
    }

    // Auto-save form data
    function autoSaveForm() {
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });
        localStorage.setItem(formKey, JSON.stringify(data));
        showNotification('Draft saved', 'success', 1000);
    }

    // Debounced auto-save on input
    function debouncedAutoSave() {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(autoSaveForm, 1000);
    }

    // Add auto-save to form inputs
    form.querySelectorAll('input, textarea, select').forEach(input => {
        input.addEventListener('input', debouncedAutoSave);
    });

    // Handle service card links
    document.querySelectorAll('[data-service]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const service = e.target.dataset.service;
            serviceSelect.value = service;
            form.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Form validation
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (validateForm()) {
            await submitForm();
        }
    });

    function validateForm() {
        let isValid = true;
        
        // Service type validation
        if (!serviceSelect.value) {
            showError(serviceSelect, 'Please select a service type');
            isValid = false;
        }

        // Description validation
        if (description.value.length < 10) {
            showError(description, 'Please provide more details (minimum 10 characters)');
            isValid = false;
        }

        return isValid;
    }

    async function submitForm() {
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.querySelector('.loading-indicator').style.display = 'inline-block';

        try {
            // Add your form submission logic here
            await fetch('/submit-request', {
                method: 'POST',
                body: new FormData(form)
            });
            
            // Clear saved draft after successful submission
            localStorage.removeItem('customOrderDraft');
            showSuccess('Request submitted successfully!');
            form.reset();
        } catch (error) {
            showError(null, 'Failed to submit request. Please try again.');
            // Save current form state in case of error
            debouncedAutoSave();
        } finally {
            submitButton.disabled = false;
            submitButton.querySelector('.loading-indicator').style.display = 'none';
        }
    }

    function showError(element, message) {
        const errorElement = element ? 
            document.getElementById(`${element.id}-error`) :
            document.createElement('div');
        errorElement.textContent = message;
        errorElement.className = 'error-message show';
    }

    function showSuccess(message) {
        const successMessage = document.createElement('div');
        successMessage.textContent = message;
        successMessage.className = 'success-message show';
        form.insertAdjacentElement('beforebegin', successMessage);
        
        setTimeout(() => successMessage.remove(), 5000);
    }
});
