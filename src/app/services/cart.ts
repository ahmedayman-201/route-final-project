import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Product } from './product';

export interface CartItem {
  product: Product;
  quantity: number;
  totalPrice: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_KEY = 'cart_items';
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();

  // Signals for reactive updates
  private cartCountSignal = signal(0);
  private cartTotalSignal = signal(0);

  private isBrowser: boolean;

  constructor() {
    this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    this.loadCartFromStorage();
  }

  // Add product to cart
  addToCart(product: Product, quantity: number = 1): void {
    const currentItems = this.cartItemsSubject.value;
    const existingItemIndex = currentItems.findIndex(
      item => item.product._id === product._id
    );

    if (existingItemIndex > -1) {
      currentItems[existingItemIndex].quantity += quantity;
      currentItems[existingItemIndex].totalPrice =
        currentItems[existingItemIndex].product.price * currentItems[existingItemIndex].quantity;
    } else {
      const newItem: CartItem = {
        product,
        quantity,
        totalPrice: product.price * quantity
      };
      currentItems.push(newItem);
    }

    this.updateCart(currentItems);
  }

  // Remove product from cart
  removeFromCart(productId: string): void {
    const updatedItems = this.cartItemsSubject.value.filter(item => item.product._id !== productId);
    this.updateCart(updatedItems);
  }

  // Update product quantity in cart
  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const currentItems = this.cartItemsSubject.value;
    const itemIndex = currentItems.findIndex(item => item.product._id === productId);

    if (itemIndex > -1) {
      currentItems[itemIndex].quantity = quantity;
      currentItems[itemIndex].totalPrice =
        currentItems[itemIndex].product.price * quantity;
      this.updateCart(currentItems);
    }
  }

  clearCart(): void {
    this.updateCart([]);
  }

  getCartItems(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  getCartCount(): number {
    return this.cartCountSignal();
  }

  getCartTotal(): number {
    return this.cartTotalSignal();
  }

  isInCart(productId: string): boolean {
    return this.cartItemsSubject.value.some(item => item.product._id === productId);
  }

  getProductQuantity(productId: string): number {
    const item = this.cartItemsSubject.value.find(item => item.product._id === productId);
    return item ? item.quantity : 0;
  }

  getCartItem(productId: string): CartItem | undefined {
    return this.cartItemsSubject.value.find(item => item.product._id === productId);
  }

  calculateShipping(): number {
    const total = this.getCartTotal();
    if (total >= 50) return 0;
    if (total >= 25) return 5.99;
    return 9.99;
  }

  calculateTax(): number {
    return this.getCartTotal() * 0.08;
  }

  getFinalTotal(): number {
    return this.getCartTotal() + this.calculateShipping() + this.calculateTax();
  }

  getCartSummary() {
    return {
      subtotal: this.getCartTotal(),
      shipping: this.calculateShipping(),
      tax: this.calculateTax(),
      total: this.getFinalTotal(),
      itemCount: this.getCartCount()
    };
  }

  // ================== private methods ==================
  private updateCart(items: CartItem[]): void {
    this.cartItemsSubject.next(items);
    this.saveCartToStorage();
    this.updateSignals();
  }

  private updateSignals(): void {
    const items = this.cartItemsSubject.value;
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = items.reduce((sum, item) => sum + item.totalPrice, 0);

    this.cartCountSignal.set(count);
    this.cartTotalSignal.set(total);
  }

  private saveCartToStorage(): void {
    if (!this.isBrowser) return; // ✅ ممنوع تستخدم localStorage في السيرفر
    try {
      localStorage.setItem(this.CART_KEY, JSON.stringify(this.cartItemsSubject.value));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }

  private loadCartFromStorage(): void {
    if (!this.isBrowser) return; // ✅ نفس الكلام
    try {
      const storedCart = localStorage.getItem(this.CART_KEY);
      if (storedCart) {
        const cartItems = JSON.parse(storedCart);
        this.cartItemsSubject.next(cartItems);
        this.updateSignals();
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      this.clearCart();
    }
  }

  // Utility
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  validateCartItems(): Observable<boolean> {
    return new Observable(observer => {
      observer.next(true);
      observer.complete();
    });
  }

  mergeGuestCart(guestCart: CartItem[]): void {
    const currentItems = this.cartItemsSubject.value;

    guestCart.forEach(guestItem => {
      const existingItemIndex = currentItems.findIndex(
        item => item.product._id === guestItem.product._id
      );

      if (existingItemIndex > -1) {
        currentItems[existingItemIndex].quantity += guestItem.quantity;
        currentItems[existingItemIndex].totalPrice =
          currentItems[existingItemIndex].product.price * currentItems[existingItemIndex].quantity;
      } else {
        currentItems.push(guestItem);
      }
    });

    this.updateCart(currentItems);
  }

  exportCartData(): string {
    return JSON.stringify(this.cartItemsSubject.value);
  }

  importCartData(cartData: string): void {
    try {
      const cartItems = JSON.parse(cartData);
      this.updateCart(cartItems);
    } catch (error) {
      console.error('Error importing cart data:', error);
    }
  }
}
