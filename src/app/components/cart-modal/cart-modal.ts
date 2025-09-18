import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartItem } from '../../services/cart';

@Component({
  selector: 'app-cart-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-modal.html',
  styleUrl: './cart-modal.css'
})
export class CartModalComponent {
  @Input() isOpen: boolean = false;
  @Input() cartItems: CartItem[] = [];
  @Input() cartTotal: number = 0;

  @Output() close = new EventEmitter<void>();
  @Output() updateQuantity = new EventEmitter<{ productId: string; quantity: number }>();
  @Output() removeItem = new EventEmitter<string>();
  @Output() checkout = new EventEmitter<void>();

  closeModal(): void {
    this.close.emit();
  }

  updateItemQuantity(productId: string, quantity: number): void {
    this.updateQuantity.emit({ productId, quantity: Number(quantity) });
  }

  removeCartItem(productId: string): void {
    this.removeItem.emit(productId);
  }

  proceedToCheckout(): void {
    this.checkout.emit();
  }

  calculateShipping(): number {
    if (this.cartTotal >= 50) {
      return 0; // Free shipping over $50
    } else if (this.cartTotal >= 25) {
      return 5.99; // Reduced shipping
    } else {
      return 9.99; // Standard shipping
    }
  }

  calculateTax(): number {
    return this.cartTotal * 0.08; // 8% tax rate
  }

  getFinalTotal(): number {
    return this.cartTotal + this.calculateShipping() + this.calculateTax();
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }
}
