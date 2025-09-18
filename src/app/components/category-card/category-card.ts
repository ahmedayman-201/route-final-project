import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category } from '../../services/product';

@Component({
  selector: 'app-category-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-card.html',
  styleUrl: './category-card.css'
})
export class CategoryCardComponent {
  @Input() category!: Category;

  @Output() categorySelected = new EventEmitter<string>();

  selectCategory(): void {
    this.categorySelected.emit(this.category._id);
  }

  getCategoryIcon(categoryName: string): string {
    const iconMap: { [key: string]: string } = {
      'Electronics': 'fas fa-laptop',
      'Clothing': 'fas fa-tshirt',
      'Books': 'fas fa-book',
      'Home': 'fas fa-home',
      'Sports': 'fas fa-futbol',
      'Beauty': 'fas fa-spa',
      'Toys': 'fas fa-gamepad',
      'Automotive': 'fas fa-car',
      'Health': 'fas fa-heartbeat',
      'Fashion': 'fas fa-tshirt',
      'Garden': 'fas fa-seedling',
      'Music': 'fas fa-music',
      'Movies': 'fas fa-film',
      'Office': 'fas fa-briefcase',
      'Pets': 'fas fa-paw',
      'Tools': 'fas fa-tools',
      'Travel': 'fas fa-plane',
      'Food': 'fas fa-utensils',
      'Jewelry': 'fas fa-gem',
      'Shoes': 'fas fa-shoe-prints'
    };
    
    return iconMap[categoryName] || 'fas fa-tag';
  }
}