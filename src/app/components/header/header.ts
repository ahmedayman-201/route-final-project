import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../services/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent {
  @Input() cartCount: number = 0;
  @Input() wishlistCount: number = 0;
  @Input() isLoggedIn: boolean = false;
  @Input() user: User | null = null;

  @Output() openAuthModal = new EventEmitter<void>();
  @Output() openCartModal = new EventEmitter<void>();
  @Output() openWishlistModal = new EventEmitter<void>();
  @Output() searchProducts = new EventEmitter<string>();

  searchTerm: string = '';

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.searchProducts.emit(this.searchTerm.trim());
    }
  }

  onSearchInput(): void {
    // Real-time search as user types
    if (this.searchTerm.trim()) {
      this.searchProducts.emit(this.searchTerm.trim());
    }
  }

  openAuth(event: Event): void {
    event.preventDefault();
    this.openAuthModal.emit();
  }

  openCart(event: Event): void {
    event.preventDefault();
    this.openCartModal.emit();
  }

  openWishlist(event: Event): void {
    event.preventDefault();
    this.openWishlistModal.emit();
  }

  loginAsGuest(): void {
    // This will be handled by the parent component
    this.openAuthModal.emit();
  }

  logout(event: Event): void {
    event.preventDefault();
    // This will be handled by the parent component
    // For now, we'll just emit the auth modal to show login
    this.openAuthModal.emit();
  }

  openProfile(event: Event): void {
    event.preventDefault();
    // TODO: Implement profile page
    console.log('Open profile');
  }

  openOrders(event: Event): void {
    event.preventDefault();
    // TODO: Implement orders page
    console.log('Open orders');
  }

  openSettings(event: Event): void {
    event.preventDefault();
    // TODO: Implement settings page
    console.log('Open settings');
  }

  openAbout(event: Event): void {
    event.preventDefault();
    // TODO: Implement about page
    console.log('Open about');
  }

  openContact(event: Event): void {
    event.preventDefault();
    // TODO: Implement contact page
    console.log('Open contact');
  }

  openHelp(event: Event): void {
    event.preventDefault();
    // TODO: Implement help page
    console.log('Open help');
  }

  scrollToSection(sectionId: string, event: Event): void {
    event.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}