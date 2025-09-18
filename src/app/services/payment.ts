import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';

export interface ShippingAddress {
  details: string;
  phone: string;
  city: string;
  postalCode?: string;
  country?: string;
}

export interface PaymentMethod {
  type: 'card' | 'cash';
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardholderName?: string;
}

export interface OrderItem {
  product: string;
  quantity: number;
  price: number;
}

export interface CreateOrderRequest {
  shippingAddress: ShippingAddress;
  paymentMethodType: string;
  items: OrderItem[];
}

export interface CreateOrderResponse {
  data: {
    order: {
      _id: string;
      user: string;
      cartItems: Array<{
        product: {
          _id: string;
          title: string;
          price: number;
          imageCover: string;
        };
        quantity: number;
        price: number;
      }>;
      shippingAddress: ShippingAddress;
      paymentMethodType: string;
      isPaid: boolean;
      isDelivered: boolean;
      paidAt?: string;
      deliveredAt?: string;
      totalOrderPrice: number;
      createdAt: string;
    };
    session?: {
      url: string;
    };
  };
  message: string;
}

export interface PaymentResult {
  success: boolean;
  orderId?: string;
  sessionUrl?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly API_BASE_URL = 'https://ecommerce.routemisr.com/api/v1';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Create order and get payment session
  createOrder(orderData: CreateOrderRequest): Observable<CreateOrderResponse> {
    const headers = this.getAuthHeaders();
    
    return this.http.post<CreateOrderResponse>(
      `${this.API_BASE_URL}/orders/checkout-session`,
      orderData,
      { headers }
    );
  }

  // Process payment (simulate payment processing)
  processPayment(paymentData: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
    amount: number;
  }): Observable<PaymentResult> {
    // Simulate payment processing
    return new Observable(observer => {
      // Simulate API delay
      setTimeout(() => {
        // Simulate payment validation
        if (this.validatePaymentData(paymentData)) {
          observer.next({
            success: true,
            orderId: this.generateOrderId()
          });
        } else {
          observer.next({
            success: false,
            error: 'Invalid payment information'
          });
        }
        observer.complete();
      }, 2000);
    });
  }

  // Get order by ID
  getOrder(orderId: string): Observable<{ data: any }> {
    const headers = this.getAuthHeaders();
    
    return this.http.get<{ data: any }>(
      `${this.API_BASE_URL}/orders/${orderId}`,
      { headers }
    );
  }

  // Get user orders
  getUserOrders(): Observable<{ data: any[] }> {
    const headers = this.getAuthHeaders();
    
    return this.http.get<{ data: any[] }>(
      `${this.API_BASE_URL}/orders`,
      { headers }
    );
  }

  // Cancel order
  cancelOrder(orderId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    
    return this.http.patch(
      `${this.API_BASE_URL}/orders/${orderId}/cancel`,
      {},
      { headers }
    );
  }

  // Get payment methods
  getPaymentMethods(): string[] {
    return ['card', 'cash'];
  }

  // Validate card number (Luhn algorithm)
  validateCardNumber(cardNumber: string): boolean {
    // Remove spaces and non-digits
    const cleaned = cardNumber.replace(/\D/g, '');
    
    // Check if it's a valid length (13-19 digits)
    if (cleaned.length < 13 || cleaned.length > 19) {
      return false;
    }

    // Luhn algorithm
    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  // Validate expiry date
  validateExpiryDate(expiryDate: string): boolean {
    const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!regex.test(expiryDate)) {
      return false;
    }

    const [month, year] = expiryDate.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    const expYear = parseInt(year);
    const expMonth = parseInt(month);

    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      return false;
    }

    return true;
  }

  // Validate CVV
  validateCVV(cvv: string): boolean {
    const regex = /^\d{3,4}$/;
    return regex.test(cvv);
  }

  // Format card number for display
  formatCardNumber(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  }

  // Mask card number for security
  maskCardNumber(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\D/g, '');
    if (cleaned.length < 8) {
      return '*'.repeat(cleaned.length);
    }
    
    const firstFour = cleaned.substring(0, 4);
    const lastFour = cleaned.substring(cleaned.length - 4);
    const middle = '*'.repeat(cleaned.length - 8);
    
    return `${firstFour} ${middle} ${lastFour}`;
  }

  // Get card type from number
  getCardType(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\D/g, '');
    
    if (cleaned.startsWith('4')) {
      return 'Visa';
    } else if (cleaned.startsWith('5') || cleaned.startsWith('2')) {
      return 'Mastercard';
    } else if (cleaned.startsWith('3')) {
      return 'American Express';
    } else if (cleaned.startsWith('6')) {
      return 'Discover';
    } else {
      return 'Unknown';
    }
  }

  // Calculate shipping cost
  calculateShipping(address: ShippingAddress): number {
    // Simple shipping calculation based on city
    const shippingRates: { [key: string]: number } = {
      'cairo': 0,
      'alexandria': 5,
      'giza': 3,
      'luxor': 10,
      'aswan': 15
    };

    const city = address.city.toLowerCase();
    return shippingRates[city] || 10; // Default shipping cost
  }

  // Calculate tax
  calculateTax(subtotal: number, address: ShippingAddress): number {
    // Simple tax calculation (8% for most cities)
    const taxRates: { [key: string]: number } = {
      'cairo': 0.08,
      'alexandria': 0.08,
      'giza': 0.08,
      'luxor': 0.10,
      'aswan': 0.10
    };

    const city = address.city.toLowerCase();
    const rate = taxRates[city] || 0.08;
    
    return subtotal * rate;
  }

  // Get order summary
  getOrderSummary(items: OrderItem[], address: ShippingAddress): {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  } {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = this.calculateShipping(address);
    const tax = this.calculateTax(subtotal, address);
    const total = subtotal + shipping + tax;

    return {
      subtotal,
      shipping,
      tax,
      total
    };
  }

  // Private methods
  private getAuthHeaders(): HttpHeaders {
    return this.authService.getAuthHeaders();
  }

  private validatePaymentData(paymentData: any): boolean {
    return (
      this.validateCardNumber(paymentData.cardNumber) &&
      this.validateExpiryDate(paymentData.expiryDate) &&
      this.validateCVV(paymentData.cvv) &&
      paymentData.cardholderName.trim().length > 0
    );
  }

  private generateOrderId(): string {
    return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  // Utility methods
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  // Get payment status text
  getPaymentStatusText(isPaid: boolean, isDelivered: boolean): string {
    if (isDelivered) {
      return 'Delivered';
    } else if (isPaid) {
      return 'Processing';
    } else {
      return 'Pending Payment';
    }
  }

  // Get payment status color
  getPaymentStatusColor(isPaid: boolean, isDelivered: boolean): string {
    if (isDelivered) {
      return 'success';
    } else if (isPaid) {
      return 'warning';
    } else {
      return 'danger';
    }
  }
}