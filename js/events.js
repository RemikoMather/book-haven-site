document.addEventListener('DOMContentLoaded', () => {
    const categoryButtons = document.querySelectorAll('.category-btn');
    const eventCards = document.querySelectorAll('.event-card');
    const modal = document.getElementById('registration-modal');
    const registrationForm = modal.querySelector('.registration-form');
    const loadMoreBtn = document.querySelector('.load-more');
    
    let currentPage = 1;

    // Category filtering
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            eventCards.forEach(card => {
                if (category === 'all' || card.dataset.category === category) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Event registration
    document.querySelectorAll('.register-btn').forEach(button => {
        button.addEventListener('click', () => {
            const eventId = button.dataset.eventId;
            document.getElementById('eventId').value = eventId;
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
        });
    });

    // Modal close
    modal.querySelector('.modal-close').addEventListener('click', () => {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    });

    // Form submission
    registrationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(registrationForm);
        
        try {
            const response = await fetch('/api/register-event', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                showSuccess('Registration successful!');
                modal.classList.remove('active');
                registrationForm.reset();
            } else {
                throw new Error('Registration failed');
            }
        } catch (error) {
            showError('Registration failed. Please try again.');
        }
    });

    // Load more past events
    loadMoreBtn.addEventListener('click', async () => {
        currentPage++;
        try {
            const response = await fetch(`/api/past-events?page=${currentPage}`);
            const data = await response.json();
            
            if (data.events.length === 0) {
                loadMoreBtn.style.display = 'none';
                return;
            }

            appendPastEvents(data.events);
        } catch (error) {
            console.error('Failed to load more events:', error);
        }
    });

    function showSuccess(message) {
        // Implement success message display
    }

    function showError(message) {
        // Implement error message display
    }

    function appendPastEvents(events) {
        // Implement past events append logic
    }
});
