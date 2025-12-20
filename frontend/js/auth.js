// Authentication Module
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isInitialized = false;
        this.initPromise = null;
        this.init();
    }

    init() {
        // Create a promise for initialization
        this.initPromise = this.checkAuthStatus().then(() => {
            this.isInitialized = true;
        });

        // Add event listeners
        this.addEventListeners();
    }

    addEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => this.handleLogout(e));
        }

        // Profile form
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => this.handleProfileUpdate(e));
        }

        // Login/Register buttons
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        
        if (loginBtn) {
            loginBtn.addEventListener('click', () => window.location.href = 'login.html');
        }
        if (registerBtn) {
            registerBtn.addEventListener('click', () => window.location.href = 'register.html');
        }
    }

    async checkAuthStatus() {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        // First, try to load user from localStorage for immediate access
        if (userStr) {
            try {
                this.currentUser = JSON.parse(userStr);
            } catch (error) {
                console.error('Failed to parse stored user:', error);
                localStorage.removeItem('user');
            }
        }

        if (token) {
            try {
                // Verify token is still valid and get fresh user data
                const user = await api.getProfile();
                this.setCurrentUser(user);
                this.updateUI();
            } catch (error) {
                console.error('Auth check failed:', error);
                this.logout();
            }
        } else {
            this.updateUI();
        }
    }

    setCurrentUser(user) {
        this.currentUser = user;
        localStorage.setItem('user', JSON.stringify(user));
    }

    getCurrentUser() {
        if (!this.currentUser) {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                this.currentUser = JSON.parse(userStr);
            }
        }
        return this.currentUser;
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            showLoading();
            const response = await api.login({ email, password });
            
            localStorage.setItem('token', response.token);
            this.setCurrentUser(response.user);
            
            this.updateUI();
            window.location.href = 'index.html';
            showMessage('Login successful!', 'success');
            
        } catch (error) {
            showMessage(error.message || 'Login failed', 'error');
        } finally {
            hideLoading();
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const role = document.getElementById('registerRole').value;

        try {
            showLoading();
            const response = await api.register({ name, email, password, role });
            
            localStorage.setItem('token', response.token);
            this.setCurrentUser(response.user);
            
            this.updateUI();
            window.location.href = 'index.html';
            showMessage('Registration successful!', 'success');
            
        } catch (error) {
            showMessage(error.message || 'Registration failed', 'error');
        } finally {
            hideLoading();
        }
    }

    async handleProfileUpdate(e) {
        e.preventDefault();
        
        const name = document.getElementById('profileName').value;
        const phone = document.getElementById('profilePhone').value;
        const street = document.getElementById('profileStreet').value;
        const city = document.getElementById('profileCity').value;
        const state = document.getElementById('profileState').value;
        const zipCode = document.getElementById('profileZipCode').value;
        const country = document.getElementById('profileCountry').value;

        const profileData = {
            name,
            phone,
            address: { street, city, state, zipCode, country }
        };

        try {
            showLoading();
            const response = await api.updateProfile(profileData);
            
            this.setCurrentUser(response.user);
            showMessage('Profile updated successfully!', 'success');
            
        } catch (error) {
            showMessage(error.message || 'Profile update failed', 'error');
        } finally {
            hideLoading();
        }
    }

    handleLogout(e) {
        e.preventDefault();
        this.logout();
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.currentUser = null;
        this.updateUI();
        window.location.href = 'index.html';
        showMessage('Logged out successfully', 'success');
    }

    updateUI() {
        const authButtons = document.getElementById('authButtons');
        const userMenu = document.getElementById('userMenu');
        const userName = document.getElementById('userName');
        const vendorLink = document.getElementById('vendorLink');
        const adminLink = document.getElementById('adminLink');
        const ordersLink = document.querySelector('#dropdownMenu a[href="orders.html"]');

        if (this.currentUser) {
            // User is logged in
            if (authButtons) authButtons.style.display = 'none';
            if (userMenu) userMenu.style.display = 'block';
            if (userName) userName.textContent = this.currentUser.name;

            // Show appropriate dashboard links based on user role
            if (this.currentUser.role === 'admin') {
                // Admin users: only show Admin Dashboard
                if (vendorLink) vendorLink.style.display = 'none';
                if (adminLink) adminLink.style.display = 'block';
                if (ordersLink) ordersLink.style.display = 'none';
            } else if (this.currentUser.role === 'vendor') {
                // Vendor users: show Vendor Dashboard and Orders
                if (vendorLink) vendorLink.style.display = 'block';
                if (adminLink) adminLink.style.display = 'none';
                if (ordersLink) ordersLink.style.display = 'block';
            } else {
                // Regular users: only show Orders
                if (vendorLink) vendorLink.style.display = 'none';
                if (adminLink) adminLink.style.display = 'none';
                if (ordersLink) ordersLink.style.display = 'block';
            }
        } else {
            // User is not logged in
            if (authButtons) authButtons.style.display = 'flex';
            if (userMenu) userMenu.style.display = 'none';
            if (vendorLink) vendorLink.style.display = 'none';
            if (adminLink) adminLink.style.display = 'none';
            if (ordersLink) ordersLink.style.display = 'none';
        }
    }

    loadProfileData() {
        const user = this.getCurrentUser();
        if (!user) return;

        // Populate profile form
        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');
        const profilePhone = document.getElementById('profilePhone');
        const profileStreet = document.getElementById('profileStreet');
        const profileCity = document.getElementById('profileCity');
        const profileState = document.getElementById('profileState');
        const profileZipCode = document.getElementById('profileZipCode');
        const profileCountry = document.getElementById('profileCountry');

        if (profileName) profileName.value = user.name || '';
        if (profileEmail) profileEmail.value = user.email || '';
        if (profilePhone) profilePhone.value = user.phone || '';
        if (profileStreet) profileStreet.value = (user.address && user.address.street) || '';
        if (profileCity) profileCity.value = (user.address && user.address.city) || '';
        if (profileState) profileState.value = (user.address && user.address.state) || '';
        if (profileZipCode) profileZipCode.value = (user.address && user.address.zipCode) || '';
        if (profileCountry) profileCountry.value = (user.address && user.address.country) || '';
    }

    isAuthenticated() {
        const token = localStorage.getItem('token');
        const user = this.getCurrentUser();
        return !!(token && user);
    }

    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }

    isVendor() {
        return this.currentUser && this.currentUser.role === 'vendor';
    }

    isUser() {
        return this.currentUser && this.currentUser.role === 'user';
    }

    async requireAuth() {
        // Wait for initialization if not complete
        if (!this.isInitialized) {
            await this.initPromise;
        }

        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            if (typeof showMessage === 'function') {
                showMessage('Please login to continue', 'warning');
            }
            return false;
        }
        return true;
    }

    async requireRole(role) {
        if (!(await this.requireAuth())) return false;

        if (role === 'admin' && !this.isAdmin()) {
            if (typeof showMessage === 'function') {
                showMessage('Admin access required', 'error');
            }
            return false;
        }

        if (role === 'vendor' && !this.isVendor() && !this.isAdmin()) {
            if (typeof showMessage === 'function') {
                showMessage('Vendor access required', 'error');
            }
            return false;
        }

        return true;
    }
}

// Create global auth instance
const auth = new AuthManager();

// Export for use in other modules
window.auth = auth;
