// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// API Service Class
class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        // Add default headers (skip Content-Type for FormData)
        const headers = Object.assign({}, options.headers || {});

        // Only add Content-Type for non-FormData requests
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        // Add auth token if available
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = Object.assign({}, options, {
            headers: headers
        });

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                // Pass the full error data as JSON string so frontend can parse it
                const errorMessage = JSON.stringify(errorData);
                throw new Error(errorMessage);
            }

            return await response.json();
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // GET request
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    }

    // POST request
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // PUT request
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // Auth endpoints
    async register(userData) {
        return this.post('/auth/register', userData);
    }

    async login(credentials) {
        return this.post('/auth/login', credentials);
    }

    async getProfile() {
        return this.get('/auth/profile');
    }

    async updateProfile(profileData) {
        return this.put('/auth/profile', profileData);
    }

    async changePassword(passwordData) {
        return this.put('/auth/change-password', passwordData);
    }

    // Product endpoints
    async getProducts(params = {}) {
        return this.get('/products', params);
    }

    async getProduct(id) {
        return this.get(`/products/${id}`);
    }

    async createProduct(productData) {
        return this.post('/products', productData);
    }

    async updateProduct(id, productData) {
        return this.put(`/products/${id}`, productData);
    }

    async deleteProduct(id) {
        return this.delete(`/products/${id}`);
    }

    async getMyProducts(params = {}) {
        return this.get('/products/vendor/my-products', params);
    }

    // Order endpoints
    async createOrder(orderData) {
        return this.post('/orders', orderData);
    }

    async getMyOrders(params = {}) {
        return this.get('/orders/my-orders', params);
    }

    async getOrder(id) {
        return this.get(`/orders/${id}`);
    }

    async updateOrderStatus(id, statusData) {
        return this.put(`/orders/${id}/status`, statusData);
    }

    async getVendorOrders(params = {}) {
        return this.get('/orders/vendor/my-orders', params);
    }

    async getSalesStats(params = {}) {
        return this.get('/orders/stats/sales', params);
    }

    // Admin endpoints
    async getUsers(params = {}) {
        return this.get('/admin/users', params);
    }

    async getUser(id) {
        return this.get(`/admin/users/${id}`);
    }

    async createUser(userData) {
        return this.post('/admin/users', userData);
    }

    async createVendor(vendorData) {
        return this.post('/admin/vendors', vendorData);
    }

    async updateUser(id, userData) {
        return this.put(`/admin/users/${id}`, userData);
    }

    async deleteUser(id) {
        return this.delete(`/admin/users/${id}`);
    }

    async getAdminProducts(params = {}) {
        return this.get('/admin/products', params);
    }

    async createAdminProduct(productData) {
        return this.post('/admin/products', productData);
    }

    async updateAdminProduct(id, productData) {
        return this.put(`/admin/products/${id}`, productData);
    }

    async deleteAdminProduct(id) {
        return this.delete(`/admin/products/${id}`);
    }

    async updateProductStatus(id, statusData) {
        return this.put(`/admin/products/${id}/status`, statusData);
    }

    async getDashboardStats() {
        return this.get('/admin/dashboard/stats');
    }

    async getSystemOverview() {
        return this.get('/admin/system/overview');
    }

    async getAdminOrders(params = {}) {
        return this.get('/admin/orders', params);
    }

    async updateOrderStatus(id, statusData) {
        return this.put(`/admin/orders/${id}/status`, statusData);
    }

    // Upload endpoints
    async uploadImage(file) {
        const formData = new FormData();
        formData.append('image', file);

        return this.request('/upload/image', {
            method: 'POST',
            body: formData,
            headers: {} // Remove Content-Type to let browser set it with boundary
        });
    }

    async uploadImages(files) {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('images', files[i]);
        }

        return this.request('/upload/images', {
            method: 'POST',
            body: formData,
            headers: {} // Remove Content-Type to let browser set it with boundary
        });
    }

    async deleteImage(filename) {
        return this.delete(`/upload/image/${filename}`);
    }
}

// Create global API instance
const api = new ApiService();

// Export for use in other modules
window.api = api;

// Debug: Log API service creation
console.log('API service created:', !!api);
console.log('Upload methods available:', !!(api.uploadImage && api.uploadImages));
