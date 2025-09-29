# E-Commerce Website

A modern, responsive e-commerce website built with HTML, CSS, and JavaScript. This website includes all the features you requested: authentication, categories, brands, wishlist functionality, and payment integration.

## Features

### 🔐 Authentication System
- **Login**: Users can login with email and password
- **Register**: New users can create accounts
- **Forgot Password**: Password reset functionality via email
- **Protected Routes**: Users must be logged in to access cart and wishlist

### 🛍️ Shopping Features
- **Categories Component**: Browse products by category with icons
- **Brands Component**: View products by brand
- **Product Grid**: Display products with images, prices, and actions
- **Search**: Real-time product search functionality
- **Add to Cart**: Add products to shopping cart
- **Wishlist**: Heart icon that changes color when items are added to wishlist

### 💳 Payment System
- **Shopping Cart**: View, modify, and remove items
- **Checkout**: Secure payment processing
- **Order Management**: Complete order flow

### 🎨 Modern UI/UX
- **Responsive Design**: Works on all devices
- **Modern Styling**: Clean, professional appearance
- **Loading States**: Smooth loading indicators
- **Toast Notifications**: User feedback for all actions
- **Modal Windows**: Clean popup interfaces

## API Integration

The website is connected to the E-commerce API:
- **Base URL**: `https://ecommerce.routemisr.com/api/v1`
- **Authentication**: JWT token-based authentication
- **Endpoints Used**:
  - `/auth/signin` - User login
  - `/auth/signup` - User registration
  - `/auth/forgotPasswords` - Password reset
  - `/categories` - Get all categories
  - `/brands` - Get all brands
  - `/products` - Get all products
  - `/orders/checkout-session` - Create order and payment session

## How to Use

### 1. Getting Started
1. Open `index.html` in your web browser
2. The website will load with categories, brands, and products

### 2. Authentication
1. Click the user icon in the navigation
2. Choose to Login or Register
3. For new users: Fill out the registration form
4. For existing users: Enter email and password
5. For password reset: Click "Forgot Password" and enter your email

### 3. Shopping
1. **Browse Products**: Scroll through the products section
2. **Filter by Category**: Click on any category card
3. **Filter by Brand**: Click on any brand card
4. **Search**: Use the search bar to find specific products
5. **Add to Wishlist**: Click the heart icon (turns red when added)
6. **Add to Cart**: Click "Add to Cart" button

### 4. Cart & Checkout
1. Click the cart icon to view your cart
2. Modify quantities or remove items
3. Click "Proceed to Checkout" to pay
4. Fill in payment details
5. Complete the purchase

### 5. Wishlist
1. Click the heart icon in navigation to view wishlist
2. Add items to cart directly from wishlist
3. Remove items from wishlist

## File Structure

```
project-website/
├── index.html          # Main HTML file
├── style.css           # CSS styles
├── script.js           # JavaScript functionality
├── README.md           # This file
└── assets/
    └── images/         # Image assets
```

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Features in Detail

### Heart Icon Wishlist
- Heart icon starts as outline (not in wishlist)
- Changes to filled red heart when added to wishlist
- Persists across page reloads
- Requires login to use

### Categories Component
- Displays all product categories
- Each category has an appropriate icon
- Clicking filters products by that category
- Responsive grid layout

### Brands Component
- Shows all available brands
- Brand logos/images displayed
- Clicking filters products by that brand
- Fallback placeholder for missing images

### Payment Integration
- Secure payment form
- Card number, expiry, CVV, and name fields
- Integration with Stripe checkout session
- Order confirmation after successful payment

### Responsive Design
- Mobile-first approach
- Adapts to all screen sizes
- Touch-friendly interface
- Optimized for tablets and phones

## Security Features

- JWT token authentication
- Secure API communication
- Input validation
- Protected user data
- Secure payment processing

## Performance

- Lazy loading of images
- Efficient API calls
- Local storage for cart/wishlist
- Optimized CSS and JavaScript
- Fast loading times

## Future Enhancements

- Product reviews and ratings
- User profiles and order history
- Advanced filtering options
- Product comparison
- Social media integration
- Multi-language support

## Support

For any issues or questions, please check the browser console for error messages and ensure you have a stable internet connection for API calls.
