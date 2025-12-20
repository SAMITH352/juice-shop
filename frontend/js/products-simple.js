// Simple Products Manager for Testing
class ProductsManager {
    constructor() {
        console.log('Simple ProductsManager created');
        this.currentPage = 1;
        this.filters = {};
        this.init();
    }

    init() {
        console.log('Simple ProductsManager init() called');
        if (document.getElementById('productsGrid')) {
            console.log('Products grid found, loading products...');
            this.loadProducts();
        }
    }

    async loadProducts() {
        try {
            console.log('Loading products...');
            
            if (!window.api) {
                throw new Error('API service not available');
            }

            const response = await window.api.getProducts({});
            console.log('Products loaded:', response);

            this.renderProducts(response.products || []);

        } catch (error) {
            console.error('Load products error:', error);
            const productsGrid = document.getElementById('productsGrid');
            if (productsGrid) {
                productsGrid.innerHTML = `
                    <div class="error-message">
                        <p>Failed to load products: ${error.message}</p>
                    </div>
                `;
            }
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
            productsGrid.innerHTML = '<div class="no-products"><p>No products found</p></div>';
            return;
        }

        productsGrid.innerHTML = products.map(product => `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.images[0] || 'https://via.placeholder.com/300x200'}" alt="${product.name}">
                </div>
                <div class="product-content">
                    <div class="product-category">${product.category}</div>
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-description">${product.description.substring(0, 100)}...</p>
                    <div class="product-price">
                        <span class="current-price">$${product.price.toFixed(2)}</span>
                    </div>
                    <div class="product-actions">
                        <button class="btn-add-cart">Add to Cart</button>
                        <button class="btn-view">View</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Create instance when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, creating simple ProductsManager...');
    window.products = new ProductsManager();
});

// Also create immediately if DOM is already loaded
if (document.readyState !== 'loading') {
    console.log('DOM already loaded, creating simple ProductsManager immediately...');
    window.products = new ProductsManager();
}
