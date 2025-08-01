export const initializeNewsletterForm = () => {
    const form = document.getElementById('newsletterForm');
    const emailInput = document.getElementById('emailInput');
    
    if (!form) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const email = emailInput.value.trim();
        const submitButton = form.querySelector('button[type="submit"]');
        
        try {
            // Show loading state
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="loading-spinner"></span> Subscribing...';
            
            // Call your API or Supabase here
            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            if (!response.ok) throw new Error('Subscription failed');
            
            // Show success message
            showNotification('Thank you for subscribing!', 'success');
            form.reset();
            
        } catch (error) {
            showNotification('Something went wrong. Please try again.', 'error');
            console.error('Subscription error:', error);
            
        } finally {
            // Reset button state
            submitButton.disabled = false;
            submitButton.textContent = 'Subscribe';
        }
    });

    // Add input validation
    emailInput.addEventListener('input', (e) => {
        const email = e.target.value;
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        
        emailInput.setAttribute('aria-invalid', !isValid);
        if (!isValid && email) {
            emailInput.setCustomValidity('Please enter a valid email address');
        } else {
            emailInput.setCustomValidity('');
        }
    });
};

// Helper function for notifications
const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.setAttribute('role', 'alert');
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
};