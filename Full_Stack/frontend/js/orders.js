// Orders Management Module
class OrdersManager {
    constructor() {
        this.currentPage = 1;
        this.init();
    }

    init() {
        // Check if we're on the orders page and load orders
        if (window.location.pathname.includes('orders.html')) {
            this.loadOrders();
        }

        // Add event listeners for filters
        this.addEventListeners();
    }

    addEventListeners() {
        // Status filter
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.loadOrders());
        }

        // Date filter
        const dateFilter = document.getElementById('dateFilter');
        if (dateFilter) {
            dateFilter.addEventListener('change', () => this.loadOrders());
        }
    }

    async loadOrders() {
        if (!(await auth.requireAuth())) return;

        try {
            showLoading();

            // Get filter values
            const statusFilter = document.getElementById('statusFilter')?.value;
            const dateFilter = document.getElementById('dateFilter')?.value;

            const params = {
                page: this.currentPage,
                limit: 10
            };

            if (statusFilter) params.status = statusFilter;
            if (dateFilter) params.days = dateFilter;

            const response = await api.getMyOrders(params);
            this.renderOrders(response.orders);
        } catch (error) {
            console.error('Failed to load orders:', error);
            showMessage('Failed to load orders', 'error');
        } finally {
            hideLoading();
        }
    }

    renderOrders(orders) {
        const ordersList = document.getElementById('ordersList');
        const ordersEmpty = document.getElementById('ordersEmpty');
        
        if (!ordersList) return;

        if (orders.length === 0) {
            ordersList.style.display = 'none';
            if (ordersEmpty) {
                ordersEmpty.style.display = 'block';
            }
            return;
        }

        ordersList.style.display = 'block';
        if (ordersEmpty) {
            ordersEmpty.style.display = 'none';
        }

        ordersList.innerHTML = orders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <span class="order-id">Order #${order._id.slice(-8)}</span>
                    <span class="order-status status-${order.orderStatus}">${this.formatStatus(order.orderStatus)}</span>
                </div>
                <div class="order-items">
                    ${order.items.map(item => `
                        <div class="order-item">
                            <img src="${item.product.images[0] || 'https://via.placeholder.com/60'}" alt="${item.product.name}">
                            <div class="order-item-info">
                                <h4>${item.product.name}</h4>
                                <p>Quantity: ${item.quantity}</p>
                                <p>Price: $${item.price.toFixed(2)}</p>
                            </div>
                        </div>
                    `).join('')}
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

    async viewOrder(orderId) {
        try {
            showLoading();
            const order = await api.getOrder(orderId);
            this.renderOrderDetail(order);
        } catch (error) {
            console.error('Failed to load order details:', error);
            showMessage('Failed to load order details', 'error');
        } finally {
            hideLoading();
        }
    }

    renderOrderDetail(order) {
        const modal = document.getElementById('orderDetailModal');
        if (!modal) return;

        // Populate modal with order details
        document.getElementById('modalOrderId').textContent = `Order #${order._id.slice(-8)}`;
        document.getElementById('modalOrderStatus').textContent = this.formatStatus(order.orderStatus);
        document.getElementById('modalOrderDate').textContent = new Date(order.createdAt).toLocaleDateString();
        document.getElementById('modalOrderTotal').textContent = `$${order.total.toFixed(2)}`;
        document.getElementById('modalPaymentMethod').textContent = this.formatPaymentMethod(order.paymentMethod);

        // Render order items
        const modalOrderItems = document.getElementById('modalOrderItems');
        if (modalOrderItems) {
            modalOrderItems.innerHTML = order.items.map(item => `
                <div class="order-item">
                    <img src="${item.product.images[0] || 'https://via.placeholder.com/60'}" alt="${item.product.name}">
                    <div class="order-item-info">
                        <h4>${item.product.name}</h4>
                        <p>Quantity: ${item.quantity}</p>
                        <p>Price: $${item.price.toFixed(2)}</p>
                    </div>
                </div>
            `).join('');
        }

        // Render shipping info
        const modalShippingInfo = document.getElementById('modalShippingInfo');
        if (modalShippingInfo && order.shippingAddress) {
            modalShippingInfo.innerHTML = `
                <p><strong>Address:</strong> ${order.shippingAddress.street}</p>
                <p><strong>City:</strong> ${order.shippingAddress.city}</p>
                <p><strong>State:</strong> ${order.shippingAddress.state}</p>
                <p><strong>ZIP Code:</strong> ${order.shippingAddress.zipCode}</p>
                <p><strong>Country:</strong> ${order.shippingAddress.country}</p>
            `;
        }

        // Show modal
        modal.style.display = 'block';
    }

    formatStatus(status) {
        return status.charAt(0).toUpperCase() + status.slice(1);
    }

    formatPaymentMethod(method) {
        const methods = {
            'cod': 'Cash on Delivery',
            'card': 'Credit/Debit Card',
            'upi': 'UPI Payment'
        };
        return methods[method] || method;
    }

    // Vendor order management
    async loadVendorOrders() {
        if (!auth.requireRole('vendor')) return;

        try {
            showLoading();
            const response = await api.getVendorOrders({ page: this.currentPage, limit: 10 });
            this.renderVendorOrders(response.orders);
        } catch (error) {
            console.error('Failed to load vendor orders:', error);
            showMessage('Failed to load vendor orders', 'error');
        } finally {
            hideLoading();
        }
    }

    renderVendorOrders(orders) {
        const dashboardContent = document.getElementById('dashboardContent');
        if (!dashboardContent) return;

        const ordersHTML = `
            <div class="dashboard-section">
                <h2>My Orders</h2>
                <div class="orders-list">
                    ${orders.map(order => `
                        <div class="order-card">
                            <div class="order-header">
                                <span class="order-id">Order #${order._id.slice(-8)}</span>
                                <span class="order-status status-${order.orderStatus}">${this.formatStatus(order.orderStatus)}</span>
                            </div>
                            <div class="order-customer">
                                <strong>Customer:</strong> ${order.user.name} (${order.user.email})
                            </div>
                            <div class="order-items">
                                ${order.items.filter(item => item.vendor._id === auth.getCurrentUser()._id).map(item => `
                                    <div class="order-item">
                                        <img src="${item.product.images[0] || 'https://via.placeholder.com/60'}" alt="${item.product.name}">
                                        <div class="order-item-info">
                                            <h4>${item.product.name}</h4>
                                            <p>Quantity: ${item.quantity}</p>
                                            <p>Price: $${item.price.toFixed(2)}</p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="order-actions">
                                <select onchange="orders.updateOrderStatus('${order._id}', this.value)">
                                    <option value="">Update Status</option>
                                    <option value="confirmed">Confirm</option>
                                    <option value="shipped">Ship</option>
                                    <option value="delivered">Deliver</option>
                                </select>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        dashboardContent.innerHTML = ordersHTML;
    }

    async updateOrderStatus(orderId, newStatus) {
        if (!newStatus) return;

        try {
            await api.updateOrderStatus(orderId, { orderStatus: newStatus });
            showMessage('Order status updated successfully', 'success');
            this.loadVendorOrders();
        } catch (error) {
            console.error('Failed to update order status:', error);
            showMessage('Failed to update order status', 'error');
        }
    }
}

// Create global orders instance
const orders = new OrdersManager();

// Export for use in other modules
window.orders = orders;

// Global functions for modal
function closeOrderModal() {
    const modal = document.getElementById('orderDetailModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function clearFilters() {
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');
    
    if (statusFilter) statusFilter.value = '';
    if (dateFilter) dateFilter.value = '';
    
    orders.loadOrders();
}

function downloadInvoice() {
    showMessage('Invoice download feature coming soon', 'info');
}

function reorderItems() {
    showMessage('Reorder feature coming soon', 'info');
}
