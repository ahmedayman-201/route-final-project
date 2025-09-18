import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from './product';
import {Storge} from './storge';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private readonly WISHLIST_KEY = 'wishlist_items';
  private wishlistItemsSubject = new BehaviorSubject<Product[]>([]);
  public wishlistItems$ = this.wishlistItemsSubject.asObservable();

  // Signals for reactive updates
  private wishlistCountSignal = signal(0);

  constructor(private storage: Storge) {
    this.loadWishlistFromStorage();
  }

  // Add product to wishlist
  addToWishlist(product: Product): void {
    const currentItems = this.wishlistItemsSubject.value;

    if (!this.isInWishlist(product._id)) {
      currentItems.push(product);
      this.updateWishlist(currentItems);
    }
  }

  removeFromWishlist(productId: string): void {
    const updatedItems = this.wishlistItemsSubject.value.filter(
      item => item._id !== productId
    );
    this.updateWishlist(updatedItems);
  }

  toggleWishlist(product: Product): boolean {
    if (this.isInWishlist(product._id)) {
      this.removeFromWishlist(product._id);
      return false;
    } else {
      this.addToWishlist(product);
      return true;
    }
  }

  clearWishlist(): void {
    this.updateWishlist([]);
  }

  getWishlistItems(): Product[] {
    return this.wishlistItemsSubject.value;
  }

  getWishlistCount(): number {
    return this.wishlistCountSignal();
  }

  isInWishlist(productId: string): boolean {
    return this.wishlistItemsSubject.value.some(item => item._id === productId);
  }

  private updateWishlist(items: Product[]): void {
    this.wishlistItemsSubject.next(items);
    this.saveWishlistToStorage();
    this.updateSignals();
  }

  private updateSignals(): void {
    this.wishlistCountSignal.set(this.wishlistItemsSubject.value.length);
  }

  private saveWishlistToStorage(): void {
    try {
      this.storage.setItem(this.WISHLIST_KEY, JSON.stringify(this.wishlistItemsSubject.value));
    } catch (error) {
      console.error('Error saving wishlist to storage:', error);
    }
  }

  private loadWishlistFromStorage(): void {
    try {
      const storedWishlist = this.storage.getItem(this.WISHLIST_KEY);
      if (storedWishlist) {
        const wishlistItems = JSON.parse(storedWishlist);
        this.wishlistItemsSubject.next(wishlistItems);
        this.updateSignals();
      }
    } catch (error) {
      console.error('Error loading wishlist from storage:', error);
      this.clearWishlist();
    }
  }
}
