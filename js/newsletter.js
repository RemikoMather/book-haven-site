document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.subscribe-form');
    const emailInput = document.getElementById('email');
    const errorDisplay = document.getElementById('email-error');
    const submitButton = form.querySelector('button[type="submit"]');
    const loadingIndicator = submitButton.querySelector('.loading-indicator');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!emailInput.checkValidity()) {
            showError('Please enter a valid email address');
            return;
        }

        try {
            submitButton.disabled = true;
            loadingIndicator.style.display = 'inline-block';
            
            const response = await fetch('/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: emailInput.value })
            });

            if (!response.ok) throw new Error('Subscription failed');

            showSuccess();
            form.reset();
        } catch (error) {
            showError('Failed to subscribe. Please try again later.');
        } finally {
            submitButton.disabled = false;
            loadingIndicator.style.display = 'none';
        }
    });

    function showError(message) {
        errorDisplay.textContent = message;
        errorDisplay.classList.add('show');
    }

    function showSuccess() {
        errorDisplay.textContent = 'Successfully subscribed!';
        errorDisplay.classList.remove('error-message');
        errorDisplay.classList.add('success-message', 'show');
        
        setTimeout(() => {
            errorDisplay.textContent = '';
            errorDisplay.classList.remove('show', 'success-message');
            errorDisplay.classList.add('error-message');
        }, 5000);
    }
});
