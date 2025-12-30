// Dashboard Management Module
class DashboardManager {
    constructor() {
        this.init();
    }

    init() {
        // Check dashboard pages and load appropriate dashboard
        if (window.location.pathname.includes('dashboard.html')) {
            this.loadUserDashboard();
        } else if (window.location.pathname.includes('vendor.html')) {
            this.loadVendorDashboard();
        } else if (window.location.pathname.includes('admin.html')) {
            this.loadAdminDashboard();
        }
    }

    async loadUserDashboard() {
        if (!(await auth.requireAuth())) return;

        try {
            showLoading();
            const response = await api.getMyOrders({ limit: 5 });
            this.renderUserDashboard(response.orders);
        } catch (error) {
            console.error('Failed to load user dashboard:', error);
            showMessage('Failed to load dashboard', 'error');
        } finally {
            hideLoading();
        }
    }

    renderUserDashboard(recentOrders) {
        // Update stats
        this.updateUserStats(recentOrders);
        
        // Render recent orders
        this.renderRecentOrders(recentOrders);
    }

    updateUserStats(orders) {
        const totalOrders = document.getElementById('totalOrders');
        const totalSpent = document.getElementById('totalSpent');
        const pendingOrders = document.getElementById('pendingOrders');
        const favoriteProducts = document.getElementById('favoriteProducts');

        if (totalOrders) totalOrders.textContent = orders.length;
        
        if (totalSpent) {
            const total = orders.reduce((sum, order) => sum + order.total, 0);
            totalSpent.textContent = `$${total.toFixed(2)}`;
        }
        
        if (pendingOrders) {
            const pending = orders.filter(order => order.orderStatus === 'pending').length;
            pendingOrders.textContent = pending;
        }
        
        if (favoriteProducts) {
            // For now, set to 0 - can be implemented later
            favoriteProducts.textContent = '0';
        }
    }

    renderRecentOrders(orders) {
        const recentOrdersList = document.getElementById('recentOrdersList');
        if (!recentOrdersList) return;

        if (orders.length === 0) {
            recentOrdersList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-bag"></i>
                    <h3>No Orders Yet</h3>
                    <p>Start shopping to see your orders here</p>
                    <a href="products.html" class="btn btn-primary">Start Shopping</a>
                </div>
            `;
            return;
        }

        recentOrdersList.innerHTML = orders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <span class="order-id">Order #${order._id.slice(-8)}</span>
                    <span class="order-status status-${order.orderStatus}">${this.formatStatus(order.orderStatus)}</span>
                </div>
                <div class="order-items">
                    ${order.items.slice(0, 2).map(item => `
                        <div class="order-item">
                            <img src="${item.product.images[0] || 'https://via.placeholder.com/60'}" alt="${item.product.name}">
                            <div class="order-item-info">
                                <h4>${item.product.name}</h4>
                                <p>Quantity: ${item.quantity}</p>
                                <p>Price: $${item.price.toFixed(2)}</p>
                            </div>
                        </div>
                    `).join('')}
                    ${order.items.length > 2 ? `<p>+${order.items.length - 2} more items</p>` : ''}
                </div>
                <div class="order-total">
                    Total: $${order.total.toFixed(2)}
                </div>
                <div class="order-actions">
                    <button class="btn btn-outline" onclick="orders.viewOrder('${order._id}')">
                        View Details
                    </button>
                </div>
            </div>
        `).join('');
    }

    async loadVendorDashboard() {
        if (!(await auth.requireRole('vendor'))) return;

        try {
            showLoading();
            const [salesStats, vendorOrders, vendorProducts] = await Promise.all([
                api.getSalesStats(),
                api.getVendorOrders({ limit: 5 }),
                api.getMyProducts({ limit: 10 })
            ]);

            this.renderVendorDashboard(salesStats, vendorOrders.orders, vendorProducts.products);
        } catch (error) {
            console.error('Failed to load vendor dashboard:', error);
            showMessage('Failed to load vendor dashboard', 'error');
        } finally {
            hideLoading();
        }
    }

    renderVendorDashboard(salesStats, recentOrders, vendorProducts) {
        // Update stats
        this.updateVendorStats(salesStats, vendorProducts.length);
        
        // Render products table
        this.renderProductsTable(vendorProducts);
        
        // Render recent orders
        this.renderVendorRecentOrders(recentOrders);
    }

    updateVendorStats(salesStats, productCount) {
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
                    <img src="${product.images[0] || 'https://via.placeholder.com/50x50'}" 
                         alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
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

    renderVendorRecentOrders(orders) {
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

    async loadAdminDashboard() {
        if (!(await auth.requireRole('admin'))) return;

        try {
            showLoading();
            const [dashboardStats, systemOverview] = await Promise.all([
                api.getDashboardStats(),
                api.getSystemOverview()
            ]);

            this.renderAdminDashboard(dashboardStats, systemOverview);
        } catch (error) {
            console.error('Failed to load admin dashboard:', error);
            showMessage('Failed to load admin dashboard', 'error');
        } finally {
            hideLoading();
        }
    }

    renderAdminDashboard(dashboardStats, systemOverview) {
        // Update dashboard statistics
        this.updateAdminStats(dashboardStats);

        // Load initial data for tabs
        this.loadUsersTab();
        this.loadProductsTab();

        // Render recent activity
        this.renderRecentActivity(dashboardStats.recentOrders);
    }

    updateAdminStats(stats) {
        const totalUsers = document.getElementById('totalUsers');
        const totalProducts = document.getElementById('totalProducts');
        const totalOrders = document.getElementById('totalOrders');
        const totalRevenue = document.getElementById('totalRevenue');

        if (totalUsers) totalUsers.textContent = stats.users.total + stats.users.vendors;
        if (totalProducts) totalProducts.textContent = stats.products.total;
        if (totalOrders) totalOrders.textContent = stats.orders.total;
        if (totalRevenue) totalRevenue.textContent = `$${stats.orders.revenue.toFixed(2)}`;
    }

    renderRecentActivity(recentOrders) {
        const activityList = document.getElementById('recentActivity');
        if (!activityList) return;

        if (!recentOrders || recentOrders.length === 0) {
            activityList.innerHTML = '<p class="text-center">No recent activity</p>';
            return;
        }

        activityList.innerHTML = recentOrders.map(order => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-shopping-cart"></i>
                </div>
                <div class="activity-content">
                    <h4>New Order #${order._id.slice(-8)}</h4>
                    <p>Customer: ${order.user.name}</p>
                    <p>Total: $${order.total.toFixed(2)}</p>
                    <span class="activity-time">${this.formatTimeAgo(order.createdAt)}</span>
                </div>
            </div>
        `).join('');
    }

    async loadUsersTab() {
        try {
            const response = await api.getUsers({ limit: 50 });
            this.renderUsersTable(response.users);
        } catch (error) {
            console.error('Failed to load users:', error);
            showMessage('Failed to load users', 'error');
        }
    }

    renderUsersTable(users) {
        const tbody = document.getElementById('usersList');
        if (!tbody) return;

        if (users.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">No users found</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>
                    <span class="role-badge role-${user.role}">${this.formatRole(user.role)}</span>
                </td>
                <td>
                    <span class="status-badge ${user.isActive ? 'active' : 'inactive'}">
                        ${user.isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="adminManager.editUser('${user._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="adminManager.deleteUser('${user._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    async loadProductsTab() {
        try {
            const response = await api.getAdminProducts({ limit: 50 });
            this.renderAdminProductsTable(response.products);
        } catch (error) {
            console.error('Failed to load products:', error);
            showMessage('Failed to load products', 'error');
        }
    }

    renderAdminProductsTable(products) {
        const tbody = document.getElementById('adminProductsList');
        if (!tbody) return;

        if (products.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">No products found</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = products.map(product => `
            <tr>
                <td>
                    <img src="${product.images[0] || 'https://via.placeholder.com/50x50'}"
                         alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                </td>
                <td>${product.name}</td>
                <td>${product.vendor ? product.vendor.name : 'N/A'}</td>
                <td>${this.formatCategory(product.category)}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td>${product.stock}</td>
                <td>
                    <span class="status-badge ${product.isActive ? 'active' : 'inactive'}">
                        ${product.isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="adminManager.editProduct('${product._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="adminManager.deleteProduct('${product._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="adminManager.toggleProductStatus('${product._id}', ${!product.isActive})">
                        <i class="fas fa-${product.isActive ? 'eye-slash' : 'eye'}"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    formatRole(role) {
        const roles = {
            'admin': 'Administrator',
            'vendor': 'Vendor',
            'user': 'Customer'
        };
        return roles[role] || role;
    }

    formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }

    formatCategory(category) {
        return category.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    formatStatus(status) {
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
}

// Create global dashboard instance
const dashboard = new DashboardManager();

// Export for use in other modules
window.dashboard = dashboard;
