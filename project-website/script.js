// API Configuration
const API_BASE_URL = 'https://ecommerce.routemisr.com/api/v1';

// Global State
let currentUser = null;
let cart = [];
let wishlist = [];
let categories = [];
let brands = [];
let products = [];

// DOM Elements
const authModal = document.getElementById('authModal');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const cartModal = document.getElementById('cartModal');
const paymentModal = document.getElementById('paymentModal');
const wishlistModal = document.getElementById('wishlistModal');
const loadingSpinner = document.getElementById('loadingSpinner');
const toastContainer = document.getElementById('toastContainer');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadInitialData();
});

// Initialize application
function initializeApp() {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
        currentUser = JSON.parse(localStorage.getItem('user'));
        updateUserInterface();
    }

    // Load cart and wishlist from localStorage
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    updateCartBadge();
    updateWishlistBadge();
}

// Setup event listeners
function setupEventListeners() {
    // Navigation buttons
    document.getElementById('userBtn').addEventListener('click', toggleAuthModal);
    document.getElementById('cartBtn').addEventListener('click', toggleCartModal);
    document.getElementById('wishlistBtn').addEventListener('click', toggleWishlistModal);

    // Modal close buttons
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    // Click outside modal to close
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeAllModals();
        }
    });

    // Authentication form switches
    document.getElementById('showRegister').addEventListener('click', showRegisterForm);
    document.getElementById('showLogin').addEventListener('click', showLoginForm);
    document.getElementById('showForgotPassword').addEventListener('click', showForgotPasswordForm);
    document.getElementById('showLoginFromForgot').addEventListener('click', showLoginForm);

    // Form submissions
    document.getElementById('loginFormElement').addEventListener('submit', handleLogin);
    document.getElementById('registerFormElement').addEventListener('submit', handleRegister);
    document.getElementById('forgotPasswordFormElement').addEventListener('submit', handleForgotPassword);
    document.getElementById('paymentForm').addEventListener('submit', handlePayment);

    // Checkout button
    document.getElementById('checkoutBtn').addEventListener('click', showPaymentModal);

    // Search functionality
    document.getElementById('searchInput').addEventListener('input', handleSearch);
}

// Load initial data
async function loadInitialData() {
    showLoading();
    try {
        await Promise.all([
            loadCategories(),
            loadBrands(),
            loadProducts()
        ]);
    } catch (error) {
        showToast('Error loading data', 'error');
    } finally {
        hideLoading();
    }
}

// API Functions
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('token');
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
}

// Load Categories
async function loadCategories() {
    try {
        const response = await apiCall('/categories');
        categories = response.data;
        renderCategories();
    } catch (error) {
        console.error('Error loading categories:', error);
        showToast('Error loading categories', 'error');
    }
}

// Load Brands
async function loadBrands() {
    try {
        const response = await apiCall('/brands');
        brands = response.data;
        renderBrands();
    } catch (error) {
        console.error('Error loading brands:', error);
        showToast('Error loading brands', 'error');
    }
}

// Load Products
async function loadProducts() {
    try {
        const response = await apiCall('/products');
        products = response.data;
        renderProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        showToast('Error loading products', 'error');
    }
}

// Render Categories
function renderCategories() {
    const categoriesGrid = document.getElementById('categoriesGrid');
    categoriesGrid.innerHTML = '';

    categories.forEach(category => {
        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card';
        categoryCard.innerHTML = `
            <i class="fas fa-${getCategoryIcon(category.name)}"></i>
            <h3>${category.name}</h3>
            <p>${category.name} products</p>
        `;
        categoryCard.addEventListener('click', () => filterProductsByCategory(category._id));
        categoriesGrid.appendChild(categoryCard);
    });
}

// Render Brands
function renderBrands() {
    const brandsGrid = document.getElementById('brandsGrid');
    brandsGrid.innerHTML = '';

    brands.forEach(brand => {
        const brandCard = document.createElement('div');
        brandCard.className = 'brand-card';
        brandCard.innerHTML = `
            <img src="${brand.image}" alt="${brand.name}" onerror="this.src='https://via.placeholder.com/100x100?text=${brand.name}'">
            <h3>${brand.name}</h3>
        `;
        brandCard.addEventListener('click', () => filterProductsByBrand(brand._id));
        brandsGrid.appendChild(brandCard);
    });
}

// Render Products
function renderProducts(productsToRender = products) {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';

    productsToRender.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        const isInWishlist = wishlist.some(item => item._id === product._id);
        
        productCard.innerHTML = `
            <img src="${product.imageCover}" alt="${product.title}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-price">$${product.price}</p>
                <div class="product-actions">
                    <button class="wishlist-btn ${isInWishlist ? 'active' : ''}" onclick="toggleWishlist('${product._id}')">
                        <i class="fas fa-heart"></i>
                    </button>
                    <button class="add-to-cart-btn" onclick="addToCart('${product._id}')">
                        Add to Cart
                    </button>
                </div>
            </div>
        `;
        productsGrid.appendChild(productCard);
    });
}

// Authentication Functions
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        showLoading();
        const response = await apiCall('/auth/signin', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        currentUser = response.data.user;
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(currentUser));
        
        updateUserInterface();
        closeAllModals();
        showToast('Login successful!', 'success');
    } catch (error) {
        showToast('Login failed. Please check your credentials.', 'error');
    } finally {
        hideLoading();
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;

    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }

    try {
        showLoading();
        const response = await apiCall('/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        });

        showToast('Registration successful! Please login.', 'success');
        showLoginForm();
    } catch (error) {
        showToast('Registration failed. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

async function handleForgotPassword(e) {
    e.preventDefault();
    const email = document.getElementById('forgotEmail').value;

    try {
        showLoading();
        await apiCall('/auth/forgotPasswords', {
            method: 'POST',
            body: JSON.stringify({ email })
        });

        showToast('Password reset link sent to your email', 'success');
        showLoginForm();
    } catch (error) {
        showToast('Failed to send reset link. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// Cart Functions
function addToCart(productId) {
    if (!currentUser) {
        showToast('Please login to add items to cart', 'warning');
        toggleAuthModal();
        return;
    }

    const product = products.find(p => p._id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item._id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCartStorage();
    updateCartBadge();
    showToast('Product added to cart!', 'success');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item._id !== productId);
    updateCartStorage();
    updateCartBadge();
    renderCartItems();
    showToast('Product removed from cart', 'success');
}

function updateCartQuantity(productId, newQuantity) {
    const item = cart.find(item => item._id === productId);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            updateCartStorage();
            renderCartItems();
        }
    }
}

function updateCartStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartBadge() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = totalItems;
}

function renderCartItems() {
    const cartItems = document.getElementById('cartItems');
    cartItems.innerHTML = '';

    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Your cart is empty</p>';
        return;
    }

    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.imageCover}" alt="${item.title}">
            <div class="cart-item-info">
                <div class="cart-item-title">${item.title}</div>
                <div class="cart-item-price">$${item.price}</div>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn" onclick="updateCartQuantity('${item._id}', ${item.quantity - 1})">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn" onclick="updateCartQuantity('${item._id}', ${item.quantity + 1})">+</button>
            </div>
            <button class="remove-item-btn" onclick="removeFromCart('${item._id}')">Remove</button>
        `;
        cartItems.appendChild(cartItem);
    });

    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('cartTotal').textContent = total.toFixed(2);
}

// Wishlist Functions
function toggleWishlist(productId) {
    if (!currentUser) {
        showToast('Please login to add items to wishlist', 'warning');
        toggleAuthModal();
        return;
    }

    const product = products.find(p => p._id === productId);
    if (!product) return;

    const existingIndex = wishlist.findIndex(item => item._id === productId);
    if (existingIndex > -1) {
        wishlist.splice(existingIndex, 1);
        showToast('Product removed from wishlist', 'success');
    } else {
        wishlist.push(product);
        showToast('Product added to wishlist!', 'success');
    }

    updateWishlistStorage();
    updateWishlistBadge();
    renderProducts(); // Re-render to update heart icons
    renderWishlistItems();
}

function updateWishlistStorage() {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

function updateWishlistBadge() {
    document.getElementById('wishlistCount').textContent = wishlist.length;
}

function renderWishlistItems() {
    const wishlistItems = document.getElementById('wishlistItems');
    wishlistItems.innerHTML = '';

    if (wishlist.length === 0) {
        wishlistItems.innerHTML = '<p>Your wishlist is empty</p>';
        return;
    }

    wishlist.forEach(item => {
        const wishlistItem = document.createElement('div');
        wishlistItem.className = 'wishlist-item';
        wishlistItem.innerHTML = `
            <img src="${item.imageCover}" alt="${item.title}">
            <div class="wishlist-item-info">
                <div class="wishlist-item-title">${item.title}</div>
                <div class="wishlist-item-price">$${item.price}</div>
            </div>
            <button class="add-to-cart-from-wishlist" onclick="addToCart('${item._id}')">Add to Cart</button>
            <button class="remove-from-wishlist" onclick="toggleWishlist('${item._id}')">Remove</button>
        `;
        wishlistItems.appendChild(wishlistItem);
    });
}

// Payment Functions
async function handlePayment(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showToast('Please login to proceed with payment', 'error');
        return;
    }

    if (cart.length === 0) {
        showToast('Your cart is empty', 'error');
        return;
    }

    const cardNumber = document.getElementById('cardNumber').value;
    const expiryDate = document.getElementById('expiryDate').value;
    const cvv = document.getElementById('cvv').value;
    const cardholderName = document.getElementById('cardholderName').value;

    try {
        showLoading();
        
        // Create order
        const orderData = {
            shippingAddress: {
                details: "123 Main St",
                phone: "1234567890",
                city: "Cairo"
            },
            paymentMethodType: "card"
        };

        const orderResponse = await apiCall('/orders/checkout-session', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Clear cart after successful payment
        cart = [];
        updateCartStorage();
        updateCartBadge();
        
        closeAllModals();
        showToast('Payment successful! Order placed.', 'success');
        
        // Redirect to order confirmation (simulated)
        setTimeout(() => {
            window.location.href = orderResponse.session.url;
        }, 1000);

    } catch (error) {
        showToast('Payment failed. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

// Filter Functions
function filterProductsByCategory(categoryId) {
    const filteredProducts = products.filter(product => 
        product.category._id === categoryId
    );
    renderProducts(filteredProducts);
    showToast(`Showing products from selected category`, 'success');
}

function filterProductsByBrand(brandId) {
    const filteredProducts = products.filter(product => 
        product.brand._id === brandId
    );
    renderProducts(filteredProducts);
    showToast(`Showing products from selected brand`, 'success');
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    if (searchTerm === '') {
        renderProducts();
        return;
    }

    const filteredProducts = products.filter(product =>
        product.title.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    );
    renderProducts(filteredProducts);
}

// UI Functions
function updateUserInterface() {
    const userBtn = document.getElementById('userBtn');
    if (currentUser) {
        userBtn.innerHTML = `<i class="fas fa-user"></i>`;
        userBtn.title = `Logged in as ${currentUser.name}`;
    } else {
        userBtn.innerHTML = `<i class="far fa-user"></i>`;
        userBtn.title = 'Login';
    }
}

function showLoading() {
    loadingSpinner.style.display = 'block';
}

function hideLoading() {
    loadingSpinner.style.display = 'none';
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toastContainer.removeChild(toast), 300);
    }, 3000);
}

// Modal Functions
function toggleAuthModal() {
    if (currentUser) {
        // Logout functionality
        currentUser = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        updateUserInterface();
        showToast('Logged out successfully', 'success');
    } else {
        authModal.style.display = 'block';
        showLoginForm();
    }
}

function toggleCartModal() {
    if (!currentUser) {
        showToast('Please login to view cart', 'warning');
        toggleAuthModal();
        return;
    }
    renderCartItems();
    cartModal.style.display = 'block';
}

function toggleWishlistModal() {
    if (!currentUser) {
        showToast('Please login to view wishlist', 'warning');
        toggleAuthModal();
        return;
    }
    renderWishlistItems();
    wishlistModal.style.display = 'block';
}

function showPaymentModal() {
    if (cart.length === 0) {
        showToast('Your cart is empty', 'error');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('paymentTotal').textContent = total.toFixed(2);
    paymentModal.style.display = 'block';
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

function showLoginForm() {
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    loginForm.classList.add('active');
}

function showRegisterForm() {
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    registerForm.classList.add('active');
}

function showForgotPasswordForm() {
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    forgotPasswordForm.classList.add('active');
}

// Utility Functions
function getCategoryIcon(categoryName) {
    const iconMap = {
        'Electronics': 'laptop',
        'Clothing': 'tshirt',
        'Books': 'book',
        'Home': 'home',
        'Sports': 'futbol',
        'Beauty': 'spa',
        'Toys': 'gamepad',
        'Automotive': 'car'
    };
    
    return iconMap[categoryName] || 'tag';
}

// Global functions for onclick handlers
window.toggleWishlist = toggleWishlist;
window.addToCart = addToCart;
window.updateCartQuantity = updateCartQuantity;
window.removeFromCart = removeFromCart;
