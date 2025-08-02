// Contact Form Handler with localStorage
const ContactForm = {
    init() {
        this.loadStoredMessages();
        this.displayStoredMessages();
    },

    loadStoredMessages() {
        this.messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    },

    saveMessage(message) {
        this.messages.push({
            ...message,
            id: Date.now(),
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('contactMessages', JSON.stringify(this.messages));
    },

    handleSubmit(event) {
        event.preventDefault();
        const form = event.target;

        if (!Validator.validateForm(form)) {
            return;
        }

        const message = {
            name: form.name.value,
            email: form.email.value,
            subject: form.subject?.value || 'General Inquiry',
            message: form.message.value
        };

        this.saveMessage(message);
        
        Modal.create({
            title: 'MESSAGE SENT',
            content: `
                <div class="wireframe-box">
                    <div class="wireframe-label">SUCCESS</div>
                    <p>Thank you for your message, ${message.name}!</p>
                    <p>We will respond to your inquiry within 24 hours.</p>
                </div>
            `
        });

        form.reset();
    },

    displayStoredMessages() {
        const container = document.querySelector('.stored-messages');
        if (!container || !this.messages.length) return;

        container.innerHTML = `
            <div class="wireframe-box">
                <div class="wireframe-label">RECENT MESSAGES</div>
                ${this.messages.slice(-3).map(msg => `
                    <div class="message-item wireframe-box">
                        <div class="wireframe-label">MESSAGE</div>
                        <p><strong>From:</strong> ${msg.name}</p>
                        <p><strong>Email:</strong> ${msg.email}</p>
                        <p><strong>Subject:</strong> ${msg.subject}</p>
                        <p><strong>Message:</strong> ${msg.message}</p>
                        <p class="timestamp">Sent: ${new Date(msg.timestamp).toLocaleString()}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }
};

// Initialize contact form when script loads
document.addEventListener('DOMContentLoaded', () => ContactForm.init());

// Make ContactForm available globally
window.ContactForm = ContactForm;
