import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header';
import { FooterComponent } from './components/footer/footer';
import { ProductCardComponent } from './components/product-card/product-card';
import { CategoryCardComponent } from './components/category-card/category-card';
import { BrandCardComponent } from './components/brand-card/brand-card';
import { AuthModalComponent } from './components/auth-modal/auth-modal';
import { CartModalComponent } from './components/cart-modal/cart-modal';
import { WishlistModalComponent } from './components/wishlist-modal/wishlist-modal';
import { PaymentModalComponent } from './components/payment-modal/payment-modal';
import { AuthService } from './services/auth';
import { CartService } from './services/cart';
import { WishlistService } from './services/wishlist';
import { ProductService } from './services/product';
import { PaymentService } from './services/payment';

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  imageCover: string;
  images: string[];
  category: {
    _id: string;
    name: string;
    image: string;
  };
  brand: {
    _id: string;
    name: string;
    image: string;
  };
  ratingsAverage: number;
  ratingsQuantity: number;
  quantity: number;
  sold: number;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  _id: string;
  name: string;
  image: string;
  slug: string;
}

interface Brand {
  _id: string;
  name: string;
  image: string;
  slug: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    ProductCardComponent,
    CategoryCardComponent,
    BrandCardComponent,
    AuthModalComponent,
    CartModalComponent,
    WishlistModalComponent,
    PaymentModalComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  title = signal('Cloud Store');

  // Data
  categories: Category[] = [];
  brands: Brand[] = [];
  products: Product[] = [];
  filteredProducts: Product[] = [];

  // UI State
  isLoading = false;
  showAuthModal = false;
  showCartModal = false;
  showWishlistModal = false;
  showPaymentModal = false;
  currentSort = '';

  // Search and filters
  searchTerm = '';
  selectedCategory: string | null = null;
  selectedBrand: string | null = null;

  constructor(
    public authService: AuthService,
    public cartService: CartService,
    public wishlistService: WishlistService,
    public productService: ProductService,
    public paymentService: PaymentService
  ) {}

  ngOnInit() {
    this.loadInitialData();
  }

  async loadInitialData() {
    this.isLoading = true;
    try {
      await Promise.all([
        this.loadCategories(),
        this.loadBrands(),
        this.loadProducts()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      this.showToast('Error loading data', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  async loadCategories() {
    try {
      const response = await this.productService.getCategories().toPromise();
      this.categories = response?.data || [];
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  async loadBrands() {
    try {
      const response = await this.productService.getBrands().toPromise();
      this.brands = response?.data || [];
    } catch (error) {
      console.error('Error loading brands:', error);
    }
  }

  async loadProducts() {
    try {
      const response = await this.productService.getProducts().toPromise();
      this.products = response?.data || [];
      this.filteredProducts = [...this.products];
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }

  // Search functionality
  onSearch(searchTerm: string) {
    this.searchTerm = searchTerm.toLowerCase();
    this.applyFilters();
  }

  // Filter functionality
  filterByCategory(categoryId: string) {
    this.selectedCategory = categoryId;
    this.applyFilters();
  }

  filterByBrand(brandId: string) {
    this.selectedBrand = brandId;
    this.applyFilters();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedCategory = null;
    this.selectedBrand = null;
    this.currentSort = '';
    this.filteredProducts = [...this.products];
  }

  applyFilters() {
    let filtered = [...this.products];

    // Apply search filter
    if (this.searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(this.searchTerm) ||
        product.description.toLowerCase().includes(this.searchTerm)
      );
    }

    // Apply category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(product =>
        product.category._id === this.selectedCategory
      );
    }

    // Apply brand filter
    if (this.selectedBrand) {
      filtered = filtered.filter(product =>
        product.brand._id === this.selectedBrand
      );
    }

    this.filteredProducts = filtered;
  }

  // Sort functionality
  sortProducts(sortType: string) {
    this.currentSort = sortType;
    let productsCopy = [...this.filteredProducts]; // نسخة جديدة

    switch (sortType) {
      case 'price-asc':
        productsCopy.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        productsCopy.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        productsCopy.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        productsCopy = [...this.products];
    }
    this.filteredProducts = productsCopy;
  }


  // Cart functionality
  addToCart(productId: string) {
    if (!this.authService.isLoggedIn()) {
      this.showToast('Please login to add items to cart', 'warning');
      this.openAuthModal();
      return;
    }

    const product = this.products.find(p => p._id === productId);
    if (product) {
      this.cartService.addToCart(product as any);
      this.showToast('Product added to cart!', 'success');
    }
  }

  updateCartQuantity(data: { productId: string; quantity: number }) {
    this.cartService.updateQuantity(data.productId, data.quantity);
  }

  removeFromCart(productId: string) {
    this.cartService.removeFromCart(productId);
    this.showToast('Product removed from cart', 'success');
  }

  // Wishlist functionality
  toggleWishlist(productId: string) {
    if (!this.authService.isLoggedIn()) {
      this.showToast('Please login to add items to wishlist', 'warning');
      this.openAuthModal();
      return;
    }

    const product = this.products.find(p => p._id === productId);
    if (product) {
      if (this.wishlistService.isInWishlist(productId)) {
        this.wishlistService.removeFromWishlist(productId);
        this.showToast('Product removed from wishlist', 'success');
      } else {
        this.wishlistService.addToWishlist(product as any);
        this.showToast('Product added to wishlist!', 'success');
      }
    }
  }

  removeFromWishlist(productId: string) {
    this.wishlistService.removeFromWishlist(productId);
    this.showToast('Product removed from wishlist', 'success');
  }

  // Modal functions
  openAuthModal() {
    this.showAuthModal = true;
  }

  closeAuthModal() {
    this.showAuthModal = false;
  }

  openCartModal() {
    if (!this.authService.isLoggedIn()) {
      this.showToast('Please login to view cart', 'warning');
      this.openAuthModal();
      return;
    }
    this.showCartModal = true;
  }

  closeCartModal() {
    this.showCartModal = false;
  }

  openWishlistModal() {
    if (!this.authService.isLoggedIn()) {
      this.showToast('Please login to view wishlist', 'warning');
      this.openAuthModal();
      return;
    }
    this.showWishlistModal = true;
  }

  closeWishlistModal() {
    this.showWishlistModal = false;
  }

  closePaymentModal() {
    this.showPaymentModal = false;
  }

  // Checkout process
  proceedToCheckout() {
    if (this.cartService.getCartItems().length === 0) {
      this.showToast('Your cart is empty', 'error');
      return;
    }
    this.closeCartModal();
    this.showPaymentModal = true;
  }

  // Auth callbacks
  onLoginSuccess(user: User) {
    this.showToast('Login successful!', 'success');
    this.closeAuthModal();
  }

  onRegisterSuccess(user: User) {
    this.showToast('Registration successful! Please check your email for verification.', 'success');
    this.closeAuthModal();
  }

  // Payment callback
  onPaymentSuccess(result: any) {
    this.showToast('Payment successful! Order placed.', 'success');
    this.closePaymentModal();
    this.cartService.clearCart();
  }

  // Utility functions
  scrollToProducts() {
    const element = document.getElementById('products');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast show`;
    toast.innerHTML = `
      <div class="toast-header">
        <strong class="me-auto">${type.charAt(0).toUpperCase() + type.slice(1)}</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
      </div>
      <div class="toast-body">
        ${message}
      </div>
    `;

    // Add to container
    const container = document.getElementById('toast-container');
    if (container) {
      container.appendChild(toast);

      // Auto remove after 3 seconds
      setTimeout(() => {
        if (container.contains(toast)) {
          container.removeChild(toast);
        }
      }, 3000);
    }
  }
}
