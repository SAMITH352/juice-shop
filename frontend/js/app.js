// Main Application Module
class App {
    constructor() {
        this.init();
    }

    init() {
        this.addEventListeners();
        this.setupMessageSystem();
        this.initializePage();
    }

    addEventListeners() {
        // User menu toggle
        const userBtn = document.getElementById('userBtn');
        if (userBtn) {
            userBtn.addEventListener('click', () => {
                const dropdownMenu = document.getElementById('dropdownMenu');
                if (dropdownMenu) {
                    dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
                }
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const userMenu = document.getElementById('userMenu');
            const dropdownMenu = document.getElementById('dropdownMenu');
            
            if (userMenu && !userMenu.contains(e.target) && dropdownMenu) {
                dropdownMenu.style.display = 'none';
            }
        });

        // Search functionality
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');
        
        if (searchBtn && searchInput) {
            searchBtn.addEventListener('click', () => {
                this.handleSearch();
            });
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch();
                }
            });
        }

        // Contact form submission
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactForm();
            });
        }
    }

    initializePage() {
        // Initialize page-specific functionality
        const currentPage = this.getCurrentPage();
        
        switch (currentPage) {
            case 'products':
                if (window.products) {
                    window.products.loadProducts();
                }
                break;
            case 'cart':
                if (window.cart) {
                    window.cart.renderCart();
                }
                break;
            case 'profile':
                if (window.auth) {
                    window.auth.loadProfileData();
                }
                break;
            case 'orders':
                if (window.orders) {
                    window.orders.loadOrders();
                }
                break;
            case 'dashboard':
                if (window.dashboard) {
                    window.dashboard.loadDashboard();
                }
                break;
        }
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop().replace('.html', '');
        return filename || 'home';
    }

    handleSearch() {
        const searchInput = document.getElementById('searchInput');
        const query = searchInput.value.trim();
        
        if (query) {
            // Redirect to products page with search query
            window.location.href = `products.html?search=${encodeURIComponent(query)}`;
        }
    }

    handleContactForm() {
        const form = document.getElementById('contactForm');
        const formData = new FormData(form);
        
        // Show loading
        this.showLoading();
        
        // Simulate form submission (replace with actual API call)
        setTimeout(() => {
            this.hideLoading();
            this.showMessage('Thank you for your message! We will get back to you soon.', 'success');
            form.reset();
        }, 2000);
    }

    setupMessageSystem() {
        // Create message container if it doesn't exist
        if (!document.getElementById('messageContainer')) {
            const messageContainer = document.createElement('div');
            messageContainer.id = 'messageContainer';
            messageContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
            `;
            document.body.appendChild(messageContainer);
        }
    }

    showMessage(message, type = 'info', duration = 5000) {
        const messageContainer = document.getElementById('messageContainer');
        if (!messageContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = `message message-${type}`;
        messageElement.style.cssText = `
            background: ${this.getMessageColor(type)};
            color: white;
            padding: 1rem;
            margin-bottom: 0.5rem;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            animation: slideIn 0.3s ease;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;

        messageElement.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" style="background: none; border: none; color: white; cursor: pointer; margin-left: 1rem;">
                <i class="fas fa-times"></i>
            </button>
        `;

        messageContainer.appendChild(messageElement);

        // Auto remove after duration
        setTimeout(() => {
            if (messageElement.parentElement) {
                messageElement.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (messageElement.parentElement) {
                        messageElement.remove();
                    }
                }, 300);
            }
        }, duration);
    }

    getMessageColor(type) {
        switch (type) {
            case 'success': return '#27ae60';
            case 'error': return '#e74c3c';
            case 'warning': return '#f39c12';
            case 'info': return '#3498db';
            default: return '#3498db';
        }
    }

    showLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.style.display = 'flex';
        }
    }

    hideLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.style.display = 'none';
        }
    }
}

// Create global app instance
const app = new App();

// Global utility functions
function showMessage(message, type = 'info', duration = 5000) {
    app.showMessage(message, type, duration);
}

function showLoading() {
    app.showLoading();
}

function hideLoading() {
    app.hideLoading();
}

// Add CSS animations for messages
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Export for use in other modules
window.app = app;
