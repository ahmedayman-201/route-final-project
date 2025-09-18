import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../services/payment';

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-modal.html',
  styleUrl: './payment-modal.css'
})
export class PaymentModalComponent {
  @Input() isOpen: boolean = false;
  @Input() totalAmount: number = 0;

  @Output() close = new EventEmitter<void>();
  @Output() paymentSuccess = new EventEmitter<any>();

  isLoading: boolean = false;

  paymentData = {
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: '',
    paymentMethod: 'card',
    agreeTerms: false
  };

  constructor(private paymentService: PaymentService) {}

  closeModal(): void {
    this.close.emit();
  }

  async processPayment(): Promise<void> {
    if (this.paymentData.paymentMethod === 'cash') {
      // Handle cash on delivery
      this.isLoading = true;
      setTimeout(() => {
        this.paymentSuccess.emit({ success: true, method: 'cash' });
        this.isLoading = false;
      }, 2000);
      return;
    }

    // Validate card data
    if (!this.validatePaymentData()) {
      return;
    }

    this.isLoading = true;
    try {
      const result = await this.paymentService.processPayment({
        cardNumber: this.paymentData.cardNumber,
        expiryDate: this.paymentData.expiryDate,
        cvv: this.paymentData.cvv,
        cardholderName: this.paymentData.cardholderName,
        amount: this.totalAmount
      }).toPromise();

      if (result?.success) {
        this.paymentSuccess.emit(result);
      } else {
        // Handle payment error
        console.error('Payment failed:', result?.error);
      }
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  formatCardNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    input.value = value;
    this.paymentData.cardNumber = value;
  }

  formatExpiryDate(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    input.value = value;
    this.paymentData.expiryDate = value;
  }

  formatCVV(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '');
    this.paymentData.cvv = input.value;
  }

  private validatePaymentData(): boolean {
    if (this.paymentData.paymentMethod === 'cash') {
      return true;
    }

    return (
      this.paymentService.validateCardNumber(this.paymentData.cardNumber) &&
      this.paymentService.validateExpiryDate(this.paymentData.expiryDate) &&
      this.paymentService.validateCVV(this.paymentData.cvv) &&
      this.paymentData.cardholderName.trim().length > 0 &&
      this.paymentData.billingAddress.trim().length > 0 &&
      this.paymentData.agreeTerms
    );
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }
}