// Products Management Module
class ProductsManager {
    constructor() {
        this.currentPage = 1;
        this.filters = {};
        this.init();
    }

    init() {
        console.log('ProductsManager init() called');
        console.log('Current pathname:', window.location.pathname);
        console.log('Products grid element:', document.getElementById('productsGrid'));

        // Only initialize if we're on the products page
        if (window.location.pathname.includes('products.html') ||
            window.location.pathname.endsWith('/products') ||
            document.getElementById('productsGrid')) {
            console.log('Initializing products page...');
            this.addEventListeners();
            this.loadProducts();
        } else {
            console.log('Not on products page, skipping initialization');
        }
    }

    addEventListeners() {
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

        // Filter functionality
        const categoryFilter = document.getElementById('categoryFilter');
        const sortFilter = document.getElementById('sortFilter');
        const applyPriceFilter = document.getElementById('applyPriceFilter');
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.handleFilterChange());
        }
        
        if (sortFilter) {
            sortFilter.addEventListener('change', () => this.handleFilterChange());
        }
        
        if (applyPriceFilter) {
            applyPriceFilter.addEventListener('click', () => this.handleFilterChange());
        }
    }

    handleSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            this.filters.search = searchInput.value.trim();
            this.currentPage = 1;
            this.loadProducts();
        }
    }

    handleFilterChange() {
        const categoryFilter = document.getElementById('categoryFilter');
        const sortFilter = document.getElementById('sortFilter');
        const minPrice = document.getElementById('minPrice');
        const maxPrice = document.getElementById('maxPrice');

        this.filters = {};

        if (categoryFilter && categoryFilter.value) {
            this.filters.category = categoryFilter.value;
        }

        if (sortFilter && sortFilter.value) {
            const [sort, order] = sortFilter.value.split(':');
            this.filters.sort = sort;
            this.filters.order = order;
        }

        if (minPrice && minPrice.value) {
            this.filters.minPrice = minPrice.value;
        }

        if (maxPrice && maxPrice.value) {
            this.filters.maxPrice = maxPrice.value;
        }

        this.currentPage = 1;
        this.loadProducts();
    }

    async loadProducts() {
        try {
            console.log('=== LOAD PRODUCTS DEBUG ===');
            console.log('API instance:', window.api);
            console.log('Loading products with params:', Object.assign({
                page: this.currentPage,
                limit: 12
            }, this.filters));

            // Check if API is available
            if (!window.api) {
                throw new Error('API service not available');
            }

            showLoading();

            const params = Object.assign({
                page: this.currentPage,
                limit: 12
            }, this.filters);

            console.log('Calling api.getProducts with params:', params);
            const response = await api.getProducts(params);
            console.log('Products API response:', response);

            if (!response || !response.products) {
                throw new Error('Invalid response format');
            }

            this.renderProducts(response.products);
            this.renderPagination(response.pagination);

        } catch (error) {
            console.error('Load products error:', error);
            console.error('Error details:', error.message);

            // Show error message to user
            const productsGrid = document.getElementById('productsGrid');
            if (productsGrid) {
                productsGrid.innerHTML = `
                    <div class="error-message">
                        <p>Failed to load products: ${error.message}</p>
                        <button onclick="window.products.loadProducts()" class="btn btn-primary">Retry</button>
                    </div>
                `;
            }
        } finally {
            hideLoading();
        }
    }

    renderProducts(products) {
        console.log('Rendering products:', products);

        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) {
            console.error('Products grid element not found');
            return;
        }

        if (products.length === 0) {
            console.log('No products to display');
            productsGrid.innerHTML = '<div class="no-products"><p>No products found</p></div>';
            return;
        }

        console.log(`Rendering ${products.length} products`);

        productsGrid.innerHTML = products.map(product => `
            <div class="product-card">
                <div class="product-image">
                    <img src="./img/${product.name.toLowerCase()}.webp" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x200'">
                    ${product.discount > 0 ? `<div class="product-badge">${product.discount}% OFF</div>` : ''}
                </div>
                <div class="product-content">
                    <div class="product-category">${this.formatCategory(product.category)}</div>
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-description">${product.description.substring(0, 100)}${product.description.length > 100 ? '...' : ''}</p>
                    <div class="product-price">
                        <span class="current-price">$${product.price.toFixed(2)}</span>
                        ${product.originalPrice ? `<span class="original-price">$${product.originalPrice.toFixed(2)}</span>` : ''}
                    </div>
                    <div class="product-actions">
                        <button class="btn-add-cart" onclick="window.products.addToCart('${product._id}')">
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                        <button class="btn-view" onclick="window.products.viewProduct('${product._id}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderPagination(pagination) {
        const paginationContainer = document.getElementById('pagination');
        if (!paginationContainer) return;

        if (pagination.totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // Previous button
        if (pagination.hasPrev) {
            paginationHTML += `<button onclick="products.goToPage(${pagination.currentPage - 1})">Previous</button>`;
        }

        // Page numbers
        for (let i = 1; i <= pagination.totalPages; i++) {
            if (i === pagination.currentPage) {
                paginationHTML += `<button class="active">${i}</button>`;
            } else {
                paginationHTML += `<button onclick="products.goToPage(${i})">${i}</button>`;
            }
        }

        // Next button
        if (pagination.hasNext) {
            paginationHTML += `<button onclick="products.goToPage(${pagination.currentPage + 1})">Next</button>`;
        }

        paginationContainer.innerHTML = paginationHTML;
    }

    goToPage(page) {
        this.currentPage = page;
        this.loadProducts();
    }

    async viewProduct(productId) {
        try {
            showLoading();
            const product = await api.getProduct(productId);
            this.renderProductDetail(product);
            // Show product detail page
            const productsPage = document.getElementById('productsPage');
            const productDetailPage = document.getElementById('productDetailPage');
            if (productsPage && productDetailPage) {
                productsPage.style.display = 'none';
                productDetailPage.style.display = 'block';
            }
        } catch (error) {
            showMessage('Failed to load product details', 'error');
        } finally {
            hideLoading();
        }
    }

    renderProductDetail(product) {
        const productDetail = document.getElementById('productDetail');
        if (!productDetail) return;

        const stockStatus = this.getStockStatus(product.stock);
        const stockClass = this.getStockClass(product.stock);

        productDetail.innerHTML = `
            <div class="product-detail-grid">
                <div class="product-detail-images">
                    <img src="./img/${product.name.toLowerCase()}.webp" alt="${product.name}" onerror="this.src='https://via.placeholder.com/500x400'">
                </div>
                <div class="product-detail-info">
                    <h1>${product.name}</h1>
                    <div class="product-detail-category">${this.formatCategory(product.category)}</div>
                    <p class="product-detail-description">${product.description}</p>
                    <div class="product-detail-price">
                        <span class="product-detail-current">$${product.price.toFixed(2)}</span>
                        ${product.originalPrice ? `<span class="product-detail-original">$${product.originalPrice.toFixed(2)}</span>` : ''}
                    </div>
                    <div class="product-detail-stock">
                        <span class="stock-status ${stockClass}">${stockStatus}</span>
                    </div>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="products.updateQuantity(-1)">-</button>
                        <input type="number" class="quantity-input" id="productQuantity" value="1" min="1" max="${product.stock}">
                        <button class="quantity-btn" onclick="products.updateQuantity(1)">+</button>
                    </div>
                    <div class="product-detail-actions">
                        <button class="btn btn-primary btn-large" onclick="products.addToCart('${product._id}', true)">
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                        <button class="btn btn-outline" onclick="products.backToProducts()">
                            <i class="fas fa-arrow-left"></i> Back to Products
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    updateQuantity(change) {
        const quantityInput = document.getElementById('productQuantity');
        if (quantityInput) {
            const currentValue = parseInt(quantityInput.value) || 1;
            const newValue = Math.max(1, currentValue + change);
            quantityInput.value = newValue;
        }
    }

    backToProducts() {
        const productsPage = document.getElementById('productsPage');
        const productDetailPage = document.getElementById('productDetailPage');
        if (productsPage && productDetailPage) {
            productDetailPage.style.display = 'none';
            productsPage.style.display = 'block';
        }
    }

    async addToCart(productId, fromDetail = false) {
        try {
            const product = await api.getProduct(productId);
            const quantityElement = document.getElementById('productQuantity');
            const quantity = fromDetail ?
                parseInt((quantityElement && quantityElement.value) || 1) : 1;
            
            cart.addItem(product, quantity);
        } catch (error) {
            showMessage('Failed to add product to cart', 'error');
        }
    }

    formatCategory(category) {
        return category.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    getStockStatus(stock) {
        if (stock === 0) return 'Out of Stock';
        if (stock <= 10) return `Only ${stock} left`;
        return 'In Stock';
    }

    getStockClass(stock) {
        if (stock === 0) return 'stock-out';
        if (stock <= 10) return 'stock-low';
        return 'stock-available';
    }

    // Vendor/Admin product management
    async loadMyProducts() {
        if (!auth.requireRole('vendor')) return;

        try {
            showLoading();
            const response = await api.getMyProducts();
            this.renderMyProducts(response.products);
        } catch (error) {
            showMessage('Failed to load your products', 'error');
        } finally {
            hideLoading();
        }
    }

    renderMyProducts(products) {
        const dashboardContent = document.getElementById('dashboardContent');
        if (!dashboardContent) return;

        const productsHTML = `
            <div class="dashboard-section">
                <div class="section-header">
                    <h2>My Products</h2>
                    <button class="btn btn-primary" onclick="products.showAddProductForm()">
                        <i class="fas fa-plus"></i> Add Product
                    </button>
                </div>
                <div class="products-grid">
                    ${products.map(product => `
                        <div class="product-card">
                            <div class="product-image">
                                <img src="./img/${product.name.toLowerCase()}.webp" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x200'">
                                <div class="product-status ${product.isActive ? 'active' : 'inactive'}">
                                    ${product.isActive ? 'Active' : 'Inactive'}
                                </div>
                            </div>
                            <div class="product-content">
                                <h3 class="product-title">${product.name}</h3>
                                <p class="product-description">${product.description.substring(0, 100)}...</p>
                                <div class="product-price">
                                    <span class="current-price">$${product.price.toFixed(2)}</span>
                                </div>
                                <div class="product-actions">
                                    <button class="btn btn-outline" onclick="products.editProduct('${product._id}')">
                                        <i class="fas fa-edit"></i> Edit
                                    </button>
                                    <button class="btn btn-outline" onclick="products.deleteProduct('${product._id}')">
                                        <i class="fas fa-trash"></i> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        dashboardContent.innerHTML = productsHTML;
    }

    showAddProductForm() {
        // Redirect to vendor dashboard for product management
        const currentUser = auth.getCurrentUser();
        if (currentUser && currentUser.role === 'vendor') {
            window.location.href = 'vendor.html';
        } else {
            showMessage('Access denied. Vendor access required.', 'error');
        }
    }

    async editProduct(productId) {
        // Redirect to vendor dashboard for product management
        const currentUser = auth.getCurrentUser();
        if (currentUser && currentUser.role === 'vendor') {
            window.location.href = 'vendor.html';
        } else {
            showMessage('Access denied. Vendor access required.', 'error');
        }
    }

    async deleteProduct(productId) {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            await api.deleteProduct(productId);
            showMessage('Product deleted successfully', 'success');
            this.loadMyProducts();
        } catch (error) {
            showMessage('Failed to delete product', 'error');
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, creating ProductsManager instance...');

    // Create global products instance
    const products = new ProductsManager();

    // Export for use in other modules
    window.products = products;
    console.log('ProductsManager instance created and exported to window.products');
});

// Also create instance immediately for backwards compatibility
if (document.readyState === 'loading') {
    console.log('Document still loading, waiting for DOMContentLoaded...');
} else {
    console.log('Document already loaded, creating ProductsManager instance immediately...');
    const products = new ProductsManager();
    window.products = products;
}

// Global function for category filtering
function filterByCategory(category) {
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.value = category;
        products.handleFilterChange();
    }
}
