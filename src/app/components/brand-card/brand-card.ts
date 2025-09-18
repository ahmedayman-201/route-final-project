import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Brand } from '../../services/product';

@Component({
  selector: 'app-brand-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './brand-card.html',
  styleUrl: './brand-card.css'
})
export class BrandCardComponent {
  @Input() brand!: Brand;

  @Output() brandSelected = new EventEmitter<string>();

  selectBrand(): void {
    this.brandSelected.emit(this.brand._id);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = `https://via.placeholder.com/100x100?text=${this.brand.name}`;
  }
}