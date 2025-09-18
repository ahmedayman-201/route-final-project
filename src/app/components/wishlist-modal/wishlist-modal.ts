import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../services/product';

@Component({
  selector: 'app-wishlist-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wishlist-modal.html',
  styleUrl: './wishlist-modal.css'
})
export class WishlistModalComponent {
  @Input() isOpen: boolean = false;
  @Input() wishlistItems: Product[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() addToCart = new EventEmitter<string>();
  @Output() removeFromWishlist = new EventEmitter<string>();

  closeModal(): void {
    this.close.emit();
  }

  addToCartClick(productId: string): void {
    this.addToCart.emit(productId);
  }

  removeFromWishlistClick(productId: string): void {
    this.removeFromWishlist.emit(productId);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }
}
