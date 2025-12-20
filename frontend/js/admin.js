// Admin Management Module
class AdminManager {
    constructor() {
        this.currentEditingUser = null;
        this.currentEditingProduct = null;
        this.vendors = [];
        this.init();
    }

    init() {
        // Check if we're on admin page
        if (window.location.pathname.includes('admin.html')) {
            this.setupEventListeners();
            this.loadVendors();
        }
    }

    setupEventListeners() {
        // User form submission
        const userForm = document.getElementById('userForm');
        if (userForm) {
            userForm.addEventListener('submit', (e) => this.handleUserSubmit(e));
        }

        // Product form submission
        const productForm = document.getElementById('productForm');
        if (productForm) {
            productForm.addEventListener('submit', (e) => this.handleProductSubmit(e));
        }

        // Tab switching
        window.showTab = (tabName) => this.showTab(tabName);
        window.showAddUserForm = () => this.showAddUserForm();
        window.showAddProductForm = () => this.showAddProductForm();
        window.showAddVendorForm = () => this.showAddVendorForm();
        window.closeUserModal = () => this.closeUserModal();
        window.closeProductModal = () => this.closeProductModal();
    }

    async loadVendors() {
        try {
            const response = await api.getUsers({ role: 'vendor', limit: 100 });
            this.vendors = response.users;
            this.populateVendorDropdown();
        } catch (error) {
            console.error('Failed to load vendors:', error);
        }
    }

    populateVendorDropdown() {
        const vendorSelect = document.getElementById('productVendor');
        if (!vendorSelect) return;

        vendorSelect.innerHTML = '<option value="">Select vendor</option>';
        this.vendors.forEach(vendor => {
            vendorSelect.innerHTML += `<option value="${vendor._id}">${vendor.name} (${vendor.email})</option>`;
        });
    }

    showTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // Remove active class from all tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab
        const selectedTab = document.getElementById(`${tabName}Tab`);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }

        // Add active class to clicked button
        event.target.classList.add('active');

        // Load data for specific tabs
        if (tabName === 'users') {
            dashboard.loadUsersTab();
        } else if (tabName === 'products') {
            dashboard.loadProductsTab();
        } else if (tabName === 'vendors') {
            this.loadVendorsTab();
        } else if (tabName === 'orders') {
            this.loadOrdersTab();
        }
    }

    async loadVendorsTab() {
        try {
            const response = await api.getUsers({ role: 'vendor', limit: 50 });
            this.renderVendorsTable(response.users);
        } catch (error) {
            console.error('Failed to load vendors:', error);
            showMessage('Failed to load vendors', 'error');
        }
    }

    renderVendorsTable(vendors) {
        const tbody = document.getElementById('vendorsList');
        if (!tbody) return;

        if (vendors.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">No vendors found</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = vendors.map(vendor => `
            <tr>
                <td>${vendor.name}</td>
                <td>${vendor.email}</td>
                <td>0</td> <!-- TODO: Add product count -->
                <td>
                    <span class="status-badge ${vendor.isActive ? 'active' : 'inactive'}">
                        ${vendor.isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>${new Date(vendor.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="adminManager.editUser('${vendor._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="adminManager.deleteUser('${vendor._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    showAddUserForm() {
        this.currentEditingUser = null;
        document.getElementById('userModalTitle').textContent = 'Add New User';
        document.getElementById('userForm').reset();
        document.getElementById('userModal').style.display = 'flex';
    }

    showAddVendorForm() {
        this.currentEditingUser = null;
        document.getElementById('userModalTitle').textContent = 'Add New Vendor';
        document.getElementById('userForm').reset();
        document.getElementById('userRole').value = 'vendor';
        document.getElementById('userModal').style.display = 'flex';
    }

    showAddProductForm() {
        this.currentEditingProduct = null;
        document.getElementById('productModalTitle').textContent = 'Add New Product';
        document.getElementById('productForm').reset();
        this.populateVendorDropdown();
        this.resetImagePreview();
        this.setupImageUpload();
        document.getElementById('productModal').style.display = 'flex';
    }

    closeUserModal() {
        document.getElementById('userModal').style.display = 'none';
        this.currentEditingUser = null;
    }

    closeProductModal() {
        document.getElementById('productModal').style.display = 'none';
        this.currentEditingProduct = null;
    }

    async handleUserSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const userData = {
            name: formData.get('userName') || document.getElementById('userName').value,
            email: formData.get('userEmail') || document.getElementById('userEmail').value,
            role: formData.get('userRole') || document.getElementById('userRole').value,
            password: 'defaultPassword123' // Default password for admin-created users
        };

        try {
            showLoading();
            
            if (this.currentEditingUser) {
                // Update existing user
                delete userData.password; // Don't update password
                await api.updateUser(this.currentEditingUser, userData);
                showMessage('User updated successfully', 'success');
            } else {
                // Create new user
                await api.createUser(userData);
                showMessage('User created successfully', 'success');
            }
            
            this.closeUserModal();
            dashboard.loadUsersTab();
            this.loadVendors(); // Refresh vendors list
            
        } catch (error) {
            console.error('User operation failed:', error);
            showMessage(error.message || 'Operation failed', 'error');
        } finally {
            hideLoading();
        }
    }

    async handleProductSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const productData = {
            name: formData.get('productName') || document.getElementById('productName').value,
            vendor: formData.get('productVendor') || document.getElementById('productVendor').value,
            category: formData.get('productCategory') || document.getElementById('productCategory').value,
            subcategory: formData.get('productSubcategory') || document.getElementById('productSubcategory').value,
            description: formData.get('productDescription') || document.getElementById('productDescription').value,
            price: parseFloat(formData.get('productPrice') || document.getElementById('productPrice').value),
            stock: parseInt(formData.get('productStock') || document.getElementById('productStock').value),
            unit: formData.get('productUnit') || document.getElementById('productUnit').value,
            images: [document.getElementById('productImageUrl').value]
        };

        // Validate required fields
        if (!productData.name || !productData.vendor || !productData.category ||
            !productData.subcategory || !productData.description ||
            !productData.price || productData.stock === undefined || !productData.unit ||
            !productData.images[0]) {
            showMessage('Please fill in all required fields', 'error');
            return;
        }

        try {
            showLoading();
            
            if (this.currentEditingProduct) {
                // Update existing product
                await api.updateAdminProduct(this.currentEditingProduct, productData);
                showMessage('Product updated successfully', 'success');
            } else {
                // Create new product
                await api.createAdminProduct(productData);
                showMessage('Product created successfully', 'success');
            }
            
            this.closeProductModal();
            dashboard.loadProductsTab();
            
        } catch (error) {
            console.error('Product operation failed:', error);

            // Try to parse backend validation errors
            let errorMessage = 'Operation failed';
            if (error.message) {
                try {
                    const errorData = JSON.parse(error.message);
                    if (errorData.errors && Array.isArray(errorData.errors)) {
                        errorMessage = errorData.errors.map(err => err.msg).join(', ');
                    } else if (errorData.message) {
                        errorMessage = errorData.message;
                    } else {
                        errorMessage = error.message;
                    }
                } catch (parseError) {
                    errorMessage = error.message;
                }
            }

            showMessage(errorMessage, 'error');
        } finally {
            hideLoading();
        }
    }

    async editUser(userId) {
        try {
            showLoading();
            const user = await api.getUser(userId);
            
            this.currentEditingUser = userId;
            document.getElementById('userModalTitle').textContent = 'Edit User';
            document.getElementById('userName').value = user.name;
            document.getElementById('userEmail').value = user.email;
            document.getElementById('userRole').value = user.role;
            
            document.getElementById('userModal').style.display = 'flex';
            
        } catch (error) {
            console.error('Failed to load user:', error);
            showMessage('Failed to load user details', 'error');
        } finally {
            hideLoading();
        }
    }

    async deleteUser(userId) {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            showLoading();
            await api.deleteUser(userId);
            showMessage('User deleted successfully', 'success');
            dashboard.loadUsersTab();
            this.loadVendors(); // Refresh vendors list
            
        } catch (error) {
            console.error('Failed to delete user:', error);
            showMessage(error.message || 'Failed to delete user', 'error');
        } finally {
            hideLoading();
        }
    }

    async editProduct(productId) {
        try {
            showLoading();
            const product = await api.getProduct(productId);
            
            this.currentEditingProduct = productId;
            document.getElementById('productModalTitle').textContent = 'Edit Product';
            document.getElementById('productName').value = product.name;
            document.getElementById('productVendor').value = product.vendor._id;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productSubcategory').value = product.subcategory || '';
            document.getElementById('productDescription').value = product.description;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productStock').value = product.stock;
            document.getElementById('productUnit').value = product.unit || 'piece';
            // Handle existing image
            if (product.images && product.images[0]) {
                document.getElementById('productImageUrl').value = product.images[0];
                this.showImagePreview(product.images[0]);
            } else {
                this.resetImagePreview();
            }

            this.setupImageUpload();
            document.getElementById('productModal').style.display = 'flex';
            
        } catch (error) {
            console.error('Failed to load product:', error);
            showMessage('Failed to load product details', 'error');
        } finally {
            hideLoading();
        }
    }

    async deleteProduct(productId) {
        if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            return;
        }

        try {
            showLoading();
            await api.deleteAdminProduct(productId);
            showMessage('Product deleted successfully', 'success');
            dashboard.loadProductsTab();
            
        } catch (error) {
            console.error('Failed to delete product:', error);
            showMessage(error.message || 'Failed to delete product', 'error');
        } finally {
            hideLoading();
        }
    }

    async toggleProductStatus(productId, isActive) {
        try {
            showLoading();
            await api.updateProductStatus(productId, { isActive });
            showMessage(`Product ${isActive ? 'activated' : 'deactivated'} successfully`, 'success');
            dashboard.loadProductsTab();

        } catch (error) {
            console.error('Failed to update product status:', error);
            showMessage('Failed to update product status', 'error');
        } finally {
            hideLoading();
        }
    }

    async loadOrdersTab() {
        try {
            const response = await api.getAdminOrders({ limit: 50 });
            this.renderOrdersTable(response.orders);
        } catch (error) {
            console.error('Failed to load orders:', error);
            showMessage('Failed to load orders', 'error');
        }
    }

    renderOrdersTable(orders) {
        const tbody = document.getElementById('adminOrdersList');
        if (!tbody) return;

        if (orders.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">No orders found</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = orders.map(order => `
            <tr>
                <td>#${order._id.slice(-8)}</td>
                <td>${order.user ? order.user.name : 'N/A'}</td>
                <td>${order.items.length} item(s)</td>
                <td>$${order.total.toFixed(2)}</td>
                <td>
                    <span class="status-badge status-${order.orderStatus}">
                        ${this.formatOrderStatus(order.orderStatus)}
                    </span>
                </td>
                <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                    <select onchange="adminManager.updateOrderStatus('${order._id}', this.value)" class="order-status-select">
                        <option value="pending" ${order.orderStatus === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="confirmed" ${order.orderStatus === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="shipped" ${order.orderStatus === 'shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="delivered" ${order.orderStatus === 'delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="cancelled" ${order.orderStatus === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
            </tr>
        `).join('');
    }

    formatOrderStatus(status) {
        return status.charAt(0).toUpperCase() + status.slice(1);
    }

    async updateOrderStatus(orderId, newStatus) {
        if (!newStatus) return;

        try {
            showLoading();
            await api.updateOrderStatus(orderId, { orderStatus: newStatus });
            showMessage('Order status updated successfully', 'success');
            this.loadOrdersTab();

        } catch (error) {
            console.error('Failed to update order status:', error);
            showMessage('Failed to update order status', 'error');
        } finally {
            hideLoading();
        }
    }

    // Image upload methods
    setupImageUpload() {
        const imageInput = document.getElementById('productImage');
        if (imageInput) {
            // Remove any existing event listeners
            imageInput.removeEventListener('change', this.handleImageUpload);
            // Add new event listener
            imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
        }
    }

    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Check authentication
        const token = localStorage.getItem('token');
        if (!token) {
            this.showUploadStatus('Please login first to upload images', 'error');
            event.target.value = '';
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showUploadStatus('Please select an image file', 'error');
            event.target.value = '';
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.showUploadStatus('Image size must be less than 5MB', 'error');
            event.target.value = '';
            return;
        }

        try {
            this.showUploadStatus('Uploading image...', 'info');

            // Use direct upload method to avoid API service issues
            const response = await this.directUploadImage(file);

            // Store the uploaded image URL
            document.getElementById('productImageUrl').value = response.imageUrl;

            // Show preview
            this.showImagePreview(response.imageUrl);

            this.showUploadStatus('Image uploaded successfully!', 'success');

            // Clear status after 3 seconds
            setTimeout(() => this.clearUploadStatus(), 3000);

        } catch (error) {
            console.error('Upload error:', error);

            // Parse error message for better user feedback
            let errorMessage = 'Upload failed. Please try again.';
            try {
                const errorData = JSON.parse(error.message);
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
                errorMessage = error.message || errorMessage;
            }

            // Check for specific error types
            if (error.message.includes('401')) {
                errorMessage = 'Authentication required. Please login first.';
            } else if (error.message.includes('403')) {
                errorMessage = 'Access denied. Admin access required.';
            } else if (error.message.includes('413')) {
                errorMessage = 'File too large. Maximum size is 5MB.';
            } else if (error.message.includes('Network')) {
                errorMessage = 'Network error. Please check your connection.';
            }

            this.showUploadStatus(errorMessage, 'error');

            // Clear the file input
            event.target.value = '';
        }
    }

    showImagePreview(imageUrl) {
        const preview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');

        if (preview && previewImg) {
            // Handle both relative and absolute URLs
            const fullUrl = imageUrl.startsWith('http') ? imageUrl : `http://localhost:5000${imageUrl}`;
            previewImg.src = fullUrl;
            preview.style.display = 'block';
        }
    }

    resetImagePreview() {
        const preview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');
        const imageUrl = document.getElementById('productImageUrl');

        if (preview) preview.style.display = 'none';
        if (previewImg) previewImg.src = '';
        if (imageUrl) imageUrl.value = '';

        this.clearUploadStatus();
    }

    showUploadStatus(message, type) {
        const status = document.getElementById('uploadStatus');
        if (status) {
            status.textContent = message;
            status.className = `upload-status ${type}`;
            status.style.display = 'block';
        }
    }

    clearUploadStatus() {
        const status = document.getElementById('uploadStatus');
        if (status) {
            status.style.display = 'none';
            status.textContent = '';
            status.className = 'upload-status';
        }
    }

    // Direct upload method (bypasses API service)
    async directUploadImage(file) {
        const formData = new FormData();
        formData.append('image', file);

        const token = localStorage.getItem('token');
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        console.log('Uploading file:', file.name, file.type, file.size);
        console.log('Using token:', token ? 'Yes' : 'No');

        const response = await fetch('http://localhost:5000/api/upload/image', {
            method: 'POST',
            body: formData,
            headers: headers
        });

        console.log('Upload response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Upload error response:', errorText);

            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch (e) {
                errorData = { message: errorText || 'Upload failed' };
            }

            throw new Error(JSON.stringify(errorData));
        }

        const result = await response.json();
        console.log('Upload success:', result);
        return result;
    }
}

// Create global admin manager instance
const adminManager = new AdminManager();

// Export for use in other modules
window.adminManager = adminManager;

// Global functions for modal
function closeProductModal() {
    adminManager.closeProductModal();
}

function removeImagePreview() {
    adminManager.resetImagePreview();
}
