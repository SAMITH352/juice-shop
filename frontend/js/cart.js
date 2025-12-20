// Cart Management Module
class CartManager {
    constructor() {
        this.items = [];
        this.init();
    }

    init() {
        this.loadCart();
        this.updateCartCount();
        this.addEventListeners();
    }

    addEventListeners() {
        // Cart button
        const cartBtn = document.getElementById('cartBtn');
        if (cartBtn) {
            cartBtn.addEventListener('click', () => this.showCart());
        }
    }

    loadCart() {
        const cartData = localStorage.getItem('cart');
        if (cartData) {
            this.items = JSON.parse(cartData);
        }
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
        this.updateCartCount();
    }

    addItem(product, quantity = 1) {
        const existingItem = this.items.find(item => item.product._id === product._id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                product: product,
                quantity: quantity
            });
        }
        
        this.saveCart();
        showMessage('Product added to cart!', 'success');
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.product._id !== productId);
        this.saveCart();
        this.renderCart();
        showMessage('Product removed from cart!', 'success');
    }

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.product._id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = quantity;
                this.saveCart();
                this.renderCart();
            }
        }
    }

    clearCart() {
        this.items = [];
        this.saveCart();
        this.renderCart();
    }

    getCartTotal() {
        return this.items.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);
    }

    getItemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }

    updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            cartCount.textContent = this.getItemCount();
        }
    }

    showCart() {
        if (this.items.length === 0) {
            showMessage('Your cart is empty', 'info');
            return;
        }
        
        window.location.href = 'cart.html';
    }

    renderCart() {
        const cartItems = document.getElementById('cartItems');
        const cartSummary = document.getElementById('cartSummary');
        
        if (!cartItems || !cartSummary) return;

        if (this.items.length === 0) {
            cartItems.innerHTML = '<p class="text-center">Your cart is empty</p>';
            cartSummary.innerHTML = '';
            return;
        }

        // Render cart items
        cartItems.innerHTML = this.items.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.product.images[0] || 'https://via.placeholder.com/100'}" alt="${item.product.name}">
                </div>
                <div class="cart-item-info">
                    <h3>${item.product.name}</h3>
                    <p>${item.product.description}</p>
                    <p class="cart-item-price">$${item.product.price.toFixed(2)} per ${item.product.unit}</p>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="cart.updateQuantity('${item.product._id}', ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="cart.updateQuantity('${item.product._id}', ${item.quantity + 1})">+</button>
                </div>
                <div class="cart-item-actions">
                    <button class="btn btn-outline" onclick="cart.removeItem('${item.product._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // Render cart summary
        const subtotal = this.getCartTotal();
        const tax = subtotal * 0.1; // 10% tax
        const shipping = subtotal > 500 ? 0 : 50; // Free shipping above $500
        const total = subtotal + tax + shipping;

        cartSummary.innerHTML = `
            <h2>Cart Summary</h2>
            <div class="summary-row">
                <span>Subtotal:</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Tax (10%):</span>
                <span>$${tax.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Shipping:</span>
                <span>${shipping === 0 ? 'Free' : '$' + shipping.toFixed(2)}</span>
            </div>
            <div class="summary-row summary-total">
                <span>Total:</span>
                <span>$${total.toFixed(2)}</span>
            </div>
            <button class="btn btn-primary btn-large" onclick="cart.proceedToCheckout()" style="width: 100%; margin-top: 1rem;">
                Proceed to Checkout
            </button>
        `;
    }

    proceedToCheckout() {
        if (!auth.requireAuth()) {
            return;
        }

        if (this.items.length === 0) {
            showMessage('Your cart is empty', 'error');
            return;
        }

        // Show checkout section if on cart page
        const cartSection = document.getElementById('cartSection');
        const checkoutSection = document.getElementById('checkoutSection');
        if (cartSection && checkoutSection) {
            cartSection.style.display = 'none';
            checkoutSection.style.display = 'block';
        }
        this.renderCheckout();
    }

    renderCheckout() {
        const orderSummary = document.getElementById('orderSummary');
        if (!orderSummary) return;

        const subtotal = this.getCartTotal();
        const tax = subtotal * 0.1;
        const shipping = subtotal > 500 ? 0 : 50;
        const total = subtotal + tax + shipping;

        orderSummary.innerHTML = `
            <div class="summary-row">
                <span>Subtotal:</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Tax (10%):</span>
                <span>$${tax.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Shipping:</span>
                <span>${shipping === 0 ? 'Free' : '$' + shipping.toFixed(2)}</span>
            </div>
            <div class="summary-row summary-total">
                <span>Total:</span>
                <span>$${total.toFixed(2)}</span>
            </div>
            <div class="order-items-summary">
                <h4>Order Items:</h4>
                ${this.items.map(item => `
                    <div class="order-item-summary">
                        <span>${item.product.name} x ${item.quantity}</span>
                        <span>$${(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
        `;

        // Pre-fill checkout form with user data
        this.prefillCheckoutForm();
    }

    prefillCheckoutForm() {
        const user = auth.getCurrentUser();
        if (!user) return;

        const fullName = document.getElementById('fullName');
        const email = document.getElementById('email');
        const phone = document.getElementById('phone');
        const street = document.getElementById('street');
        const city = document.getElementById('city');
        const state = document.getElementById('state');
        const zipCode = document.getElementById('zipCode');
        const country = document.getElementById('country');

        if (fullName) fullName.value = user.name || '';
        if (email) email.value = user.email || '';
        if (phone) phone.value = user.phone || '';
        if (street) street.value = (user.address && user.address.street) || '';
        if (city) city.value = (user.address && user.address.city) || '';
        if (state) state.value = (user.address && user.address.state) || '';
        if (zipCode) zipCode.value = (user.address && user.address.zipCode) || '';
        if (country) country.value = (user.address && user.address.country) || '';
    }

    async placeOrder() {
        if (!auth.requireAuth()) {
            return;
        }

        const form = document.getElementById('checkoutForm');
        if (!form) return;

        const formData = new FormData(form);
        const orderData = {
            items: this.items.map(item => ({
                product: item.product._id,
                quantity: item.quantity
            })),
            shippingAddress: {
                street: formData.get('street') || document.getElementById('street').value,
                city: formData.get('city') || document.getElementById('city').value,
                state: formData.get('state') || document.getElementById('state').value,
                zipCode: formData.get('zipCode') || document.getElementById('zipCode').value,
                country: formData.get('country') || document.getElementById('country').value
            },
            paymentMethod: formData.get('paymentMethod') || 'cod'
        };

        try {
            showLoading();
            const response = await api.createOrder(orderData);
            
            // Clear cart after successful order
            this.clearCart();
            
            window.location.href = 'orders.html';
            showMessage('Order placed successfully!', 'success');
            
            // Load orders to show the new order
            if (window.orders) {
                window.orders.loadOrders();
            }
            
        } catch (error) {
            showMessage(error.message || 'Failed to place order', 'error');
        } finally {
            hideLoading();
        }
    }
}

// Create global cart instance
const cart = new CartManager();

// Export for use in other modules
window.cart = cart;

// Add checkout form event listener
document.addEventListener('DOMContentLoaded', () => {
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            cart.placeOrder();
        });
    }
});
