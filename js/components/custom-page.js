// Custom Page with Service Request Form
const CustomPage = {
    init() {
        this.loadStoredRequests();
        this.displayStoredRequests();
    },

    loadStoredRequests() {
        this.requests = JSON.parse(localStorage.getItem('customRequests') || '[]');
    },

    saveRequest(request) {
        this.requests.push({
            ...request,
            id: Date.now(),
            timestamp: new Date().toISOString(),
            status: 'pending'
        });
        localStorage.setItem('customRequests', JSON.stringify(this.requests));
    },

    handleSubmit(event) {
        event.preventDefault();
        const form = event.target;

        if (!Validator.validateForm(form)) {
            return;
        }

        const request = {
            name: form.name.value,
            email: form.email.value,
            serviceType: form.serviceType.value,
            description: form.description.value,
            budget: form.budget.value,
            deadline: form.deadline.value
        };

        this.saveRequest(request);
        
        Modal.create({
            title: 'REQUEST SUBMITTED',
            content: `
                <div class="wireframe-box">
                    <div class="wireframe-label">SUCCESS</div>
                    <p>Thank you for your custom service request!</p>
                    <p>We will review your requirements and get back to you soon.</p>
                    <div class="request-details">
                        <p><strong>Service:</strong> ${request.serviceType}</p>
                        <p><strong>Budget:</strong> $${request.budget}</p>
                        <p><strong>Deadline:</strong> ${request.deadline}</p>
                    </div>
                </div>
            `
        });

        form.reset();
        this.displayStoredRequests();
    },

    displayStoredRequests() {
        const container = document.querySelector('.stored-requests');
        if (!container || !this.requests.length) return;

        container.innerHTML = `
            <div class="wireframe-box">
                <div class="wireframe-label">YOUR REQUESTS</div>
                ${this.requests.slice(-3).map(req => `
                    <div class="request-item wireframe-box">
                        <div class="wireframe-label">REQUEST</div>
                        <p><strong>Service Type:</strong> ${req.serviceType}</p>
                        <p><strong>Description:</strong> ${req.description}</p>
                        <p><strong>Budget:</strong> $${req.budget}</p>
                        <p><strong>Deadline:</strong> ${req.deadline}</p>
                        <p><strong>Status:</strong> <span class="status-${req.status}">${req.status}</span></p>
                        <p class="timestamp">Submitted: ${new Date(req.timestamp).toLocaleString()}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }
};

// Initialize custom page when script loads
document.addEventListener('DOMContentLoaded', () => CustomPage.init());

// Make CustomPage available globally
window.CustomPage = CustomPage;
