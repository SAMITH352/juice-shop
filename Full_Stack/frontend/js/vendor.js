// Vendor Dashboard Management
class VendorManager {
    constructor() {
        this.init();
    }

    async init() {
        await this.checkAuth();
        await this.loadVendorDashboard();
        this.setupEventListeners();
    }

    async checkAuth() {
        if (!(await auth.requireRole('vendor'))) {
            return false;
        }

        const user = auth.getCurrentUser();
        // Update user name in header
        const userName = document.getElementById('userName');
        if (userName) {
            userName.textContent = user.name || 'Vendor';
        }
        return true;
    }

    async loadVendorDashboard() {
        if (!(await this.checkAuth())) return;

        try {
            showLoading();
            const [salesStats, vendorOrders, vendorProducts] = await Promise.all([
                api.getSalesStats(),
                api.getVendorOrders({ limit: 5 }),
                api.getMyProducts({ limit: 10 })
            ]);

            this.renderDashboard(salesStats, vendorOrders.orders, vendorProducts.products);
        } catch (error) {
            console.error('Failed to load vendor dashboard:', error);
            showMessage('Failed to load vendor dashboard', 'error');
        } finally {
            hideLoading();
        }
    }

    renderDashboard(salesStats, recentOrders, vendorProducts) {
        // Update stats
        this.updateStats(salesStats, vendorProducts.length);
        
        // Render products table
        this.renderProductsTable(vendorProducts);
        
        // Render recent orders
        this.renderRecentOrders(recentOrders);
    }

    updateStats(salesStats, productCount) {
        const totalProducts = document.getElementById('totalProducts');
        const totalOrders = document.getElementById('totalOrders');
        const totalRevenue = document.getElementById('totalRevenue');
        const avgRating = document.getElementById('avgRating');

        if (totalProducts) totalProducts.textContent = productCount;
        if (totalOrders) totalOrders.textContent = salesStats.totalOrders || 0;
        if (totalRevenue) totalRevenue.textContent = `$${(salesStats.totalSales || 0).toFixed(2)}`;
        if (avgRating) avgRating.textContent = (salesStats.averageRating || 0).toFixed(1);
    }

    renderProductsTable(products) {
        const tbody = document.getElementById('vendorProductsList');
        if (!tbody) return;

        if (products.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">No products found. Add your first product!</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = products.map(product => `
            <tr>
                <td>
                    <img src="${this.getImageUrl(product.images[0])}" 
                         alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"
                         onerror="this.src='https://via.placeholder.com/50x50?text=No+Image'">
                </td>
                <td>${product.name}</td>
                <td>${this.formatCategory(product.category)}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td>${product.stock}</td>
                <td>
                    <span class="status-badge ${product.isActive ? 'active' : 'inactive'}">
                        ${product.isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="vendorManager.editProduct('${product._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="vendorManager.deleteProduct('${product._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    renderRecentOrders(orders) {
        const ordersList = document.getElementById('recentOrdersList');
        if (!ordersList) return;

        if (orders.length === 0) {
            ordersList.innerHTML = '<p class="text-center">No recent orders</p>';
            return;
        }

        ordersList.innerHTML = orders.map(order => `
            <div class="order-item">
                <div class="order-header">
                    <h4>Order #${order._id.slice(-8)}</h4>
                    <span class="order-status status-${order.orderStatus}">${this.formatStatus(order.orderStatus)}</span>
                </div>
                <div class="order-details">
                    <p><strong>Customer:</strong> ${order.user.name} (${order.user.email})</p>
                    <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
                    <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
            </div>
        `).join('');
    }

    formatCategory(category) {
        return category.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    formatStatus(status) {
        return status.charAt(0).toUpperCase() + status.slice(1);
    }

    getImageUrl(imageUrl) {
        if (!imageUrl) {
            return 'https://via.placeholder.com/50x50?text=No+Image';
        }
        
        // If it's already a full URL (starts with http/https), return as is
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }
        
        // If it's a relative path (starts with /uploads), prepend the backend URL
        if (imageUrl.startsWith('/uploads/')) {
            return `http://localhost:5000${imageUrl}`;
        }
        
        // If it's just a filename, assume it's in uploads directory
        if (!imageUrl.includes('/')) {
            return `http://localhost:5000/uploads/${imageUrl}`;
        }
        
        // Default fallback
        return imageUrl;
    }

    setupEventListeners() {
        // Search functionality
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.handleSearch());
        }
        
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch();
                }
            });
        }

        // Logout functionality
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                auth.logout();
                window.location.href = 'index.html';
            });
        }

        // Modal close on backdrop click
        const modal = document.getElementById('productModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeProductModal();
                }
            });
        }

        // Modal close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.getElementById('productModal');
                if (modal && modal.style.display === 'block') {
                    this.closeProductModal();
                }
            }
        });
    }

    handleSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput && searchInput.value.trim()) {
            window.location.href = `products.html?search=${encodeURIComponent(searchInput.value.trim())}`;
        }
    }

    // Product Management Functions
    showAddProductForm() {
        console.log('showAddProductForm called');
        const modal = document.getElementById('productModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('productForm');
        
        console.log('Modal element:', modal);
        console.log('Modal title element:', modalTitle);
        console.log('Form element:', form);
        
        if (modal && modalTitle && form) {
            modalTitle.textContent = 'Add New Product';
            form.reset();
            form.dataset.mode = 'add';

            // Reset image preview and clear any existing image URL
            this.resetImagePreview();
            document.getElementById('productImageUrl').value = '';

            // Make image upload required for new products
            const imageInput = document.getElementById('productImage');
            if (imageInput) {
                imageInput.required = true;
            }

            modal.style.display = 'block';
            console.log('Modal should now be visible');

            // Add form submit event listener
            form.onsubmit = (e) => this.handleProductSubmit(e);

            // Add image upload event listener
            this.setupImageUpload();
        } else {
            console.error('Required modal elements not found');
            alert('Modal elements not found. Please check the page structure.');
        }
    }

    async editProduct(productId) {
        try {
            showLoading();
            const product = await api.getProduct(productId);
            this.showEditProductForm(product);
        } catch (error) {
            showMessage('Failed to load product details', 'error');
        } finally {
            hideLoading();
        }
    }

    showEditProductForm(product) {
        const modal = document.getElementById('productModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('productForm');
        
        if (modal && modalTitle && form) {
            modalTitle.textContent = 'Edit Product';
            form.dataset.mode = 'edit';
            form.dataset.productId = product._id;
            
            // Populate form fields
            document.getElementById('productName').value = product.name;
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

            modal.style.display = 'block';

            // Add image upload event listener
            this.setupImageUpload();
            
            // Add form submit event listener
            form.onsubmit = (e) => this.handleProductSubmit(e);
        }
    }

    async handleProductSubmit(e) {
        e.preventDefault();
        console.log('handleProductSubmit called');
        
        const form = e.target;
        const mode = form.dataset.mode;
        const productId = form.dataset.productId;
        
        console.log('Form mode:', mode);
        console.log('Product ID:', productId);
        
        const imageUrl = document.getElementById('productImageUrl').value;

        // Validate basic required fields
        const name = document.getElementById('productName').value;
        const category = document.getElementById('productCategory').value;
        const subcategory = document.getElementById('productSubcategory').value;
        const description = document.getElementById('productDescription').value;
        const price = parseFloat(document.getElementById('productPrice').value);
        const stock = parseInt(document.getElementById('productStock').value);
        const unit = document.getElementById('productUnit').value;

        if (!name || !category || !subcategory || !description || !price || stock === undefined || !unit) {
            showMessage('Please fill in all required fields', 'error');
            return;
        }

        // For new products, image is required
        if (mode === 'add' && !imageUrl) {
            showMessage('Please upload a product image', 'error');
            return;
        }

        // For editing, if no new image is uploaded, keep the existing one
        if (mode === 'edit' && !imageUrl) {
            showMessage('Please upload a product image', 'error');
            return;
        }

        // Ensure the image URL is from our upload system (not external URLs)
        if (imageUrl && !imageUrl.startsWith('/uploads/') && !imageUrl.startsWith('http://localhost:5000/uploads/')) {
            showMessage('Please upload an image file instead of using external URLs', 'error');
            return;
        }

        const formData = {
            name: name,
            category: category,
            subcategory: subcategory,
            description: description,
            price: price,
            stock: stock,
            unit: unit,
            images: [imageUrl]
        };

        console.log('Form data:', formData);

        try {
            showLoading();
            
            if (mode === 'add') {
                console.log('Creating new product...');
                await api.createProduct(formData);
                showMessage('Product created successfully', 'success');
            } else {
                console.log('Updating existing product...');
                await api.updateProduct(productId, formData);
                showMessage('Product updated successfully', 'success');
            }
            
            this.closeProductModal();
            this.loadVendorDashboard(); // Reload dashboard
        } catch (error) {
            console.error('Error saving product:', error);

            // Try to parse backend validation errors
            let errorMessage = 'Failed to save product';
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

    async deleteProduct(productId) {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            showLoading();
            await api.deleteProduct(productId);
            showMessage('Product deleted successfully', 'success');
            this.loadVendorDashboard(); // Reload dashboard
        } catch (error) {
            showMessage('Failed to delete product', 'error');
        } finally {
            hideLoading();
        }
    }

    closeProductModal() {
        console.log('closeProductModal called');
        const modal = document.getElementById('productModal');
        if (modal) {
            modal.style.display = 'none';
            console.log('Modal closed');
        } else {
            console.error('Modal element not found for closing');
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

        // Check authentication first
        const token = localStorage.getItem('token');
        if (!token) {
            this.showUploadStatus('Please login first to upload images', 'error');
            event.target.value = '';
            return;
        }

        // Check if user is authenticated
        if (!auth.isAuthenticated()) {
            this.showUploadStatus('Authentication required. Please login.', 'error');
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
                errorMessage = 'Access denied. Vendor access required.';
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

// Create global vendor manager instance
const vendorManager = new VendorManager();

// Export for use in other modules
window.vendorManager = vendorManager;

// Global functions for modal
function showAddProductForm() {
    vendorManager.showAddProductForm();
}

function closeProductModal() {
    vendorManager.closeProductModal();
}

function removeImagePreview() {
    vendorManager.resetImagePreview();
}
