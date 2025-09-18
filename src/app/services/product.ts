import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  imageCover: string;
  images: string[];
  category: {
    _id: string;
    name: string;
    image: string;
  };
  brand: {
    _id: string;
    name: string;
    image: string;
  };
  ratingsAverage: number;
  ratingsQuantity: number;
  quantity: number;
  sold: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  image: string;
  slug: string;
}

export interface Brand {
  _id: string;
  name: string;
  image: string;
  slug: string;
}

export interface ProductsResponse {
  data: Product[];
  results: number;
  pagination: {
    currentPage: number;
    limit: number;
    numberOfPages: number;
  };
}

export interface CategoriesResponse {
  data: Category[];
  results: number;
}

export interface BrandsResponse {
  data: Brand[];
  results: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly API_BASE_URL = 'https://ecommerce.routemisr.com/api/v1';

  constructor(private http: HttpClient) {}

  // Get all products with optional filters
  getProducts(params?: {
    page?: number;
    limit?: number;
    sort?: string;
    category?: string;
    brand?: string;
    price?: string;
    keyword?: string;
  }): Observable<ProductsResponse> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key as keyof typeof params]) {
          httpParams = httpParams.set(key, params[key as keyof typeof params]!.toString());
        }
      });
    }

    return this.http.get<ProductsResponse>(`${this.API_BASE_URL}/products`, {
      params: httpParams
    });
  }

  // Get single product by ID
  getProduct(id: string): Observable<{ data: Product }> {
    return this.http.get<{ data: Product }>(`${this.API_BASE_URL}/products/${id}`);
  }

  // Get all categories
  getCategories(): Observable<CategoriesResponse> {
    return this.http.get<CategoriesResponse>(`${this.API_BASE_URL}/categories`);
  }

  // Get single category by ID
  getCategory(id: string): Observable<{ data: Category }> {
    return this.http.get<{ data: Category }>(`${this.API_BASE_URL}/categories/${id}`);
  }

  // Get all brands
  getBrands(): Observable<BrandsResponse> {
    return this.http.get<BrandsResponse>(`${this.API_BASE_URL}/brands`);
  }

  // Get single brand by ID
  getBrand(id: string): Observable<{ data: Brand }> {
    return this.http.get<{ data: Brand }>(`${this.API_BASE_URL}/brands/${id}`);
  }

  // Search products
  searchProducts(query: string, params?: {
    page?: number;
    limit?: number;
    sort?: string;
    category?: string;
    brand?: string;
    price?: string;
  }): Observable<ProductsResponse> {
    let httpParams = new HttpParams().set('keyword', query);
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key as keyof typeof params]) {
          httpParams = httpParams.set(key, params[key as keyof typeof params]!.toString());
        }
      });
    }

    return this.http.get<ProductsResponse>(`${this.API_BASE_URL}/products`, {
      params: httpParams
    });
  }

  // Get products by category
  getProductsByCategory(categoryId: string, params?: {
    page?: number;
    limit?: number;
    sort?: string;
    price?: string;
  }): Observable<ProductsResponse> {
    let httpParams = new HttpParams().set('category', categoryId);
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key as keyof typeof params]) {
          httpParams = httpParams.set(key, params[key as keyof typeof params]!.toString());
        }
      });
    }

    return this.http.get<ProductsResponse>(`${this.API_BASE_URL}/products`, {
      params: httpParams
    });
  }

  // Get products by brand
  getProductsByBrand(brandId: string, params?: {
    page?: number;
    limit?: number;
    sort?: string;
    price?: string;
  }): Observable<ProductsResponse> {
    let httpParams = new HttpParams().set('brand', brandId);
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key as keyof typeof params]) {
          httpParams = httpParams.set(key, params[key as keyof typeof params]!.toString());
        }
      });
    }

    return this.http.get<ProductsResponse>(`${this.API_BASE_URL}/products`, {
      params: httpParams
    });
  }

  // Get featured products (products with high ratings)
  getFeaturedProducts(limit: number = 10): Observable<ProductsResponse> {
    const params = new HttpParams()
      .set('sort', '-ratingsAverage')
      .set('limit', limit.toString());

    return this.http.get<ProductsResponse>(`${this.API_BASE_URL}/products`, {
      params
    });
  }

  // Get best selling products
  getBestSellingProducts(limit: number = 10): Observable<ProductsResponse> {
    const params = new HttpParams()
      .set('sort', '-sold')
      .set('limit', limit.toString());

    return this.http.get<ProductsResponse>(`${this.API_BASE_URL}/products`, {
      params
    });
  }

  // Get new products
  getNewProducts(limit: number = 10): Observable<ProductsResponse> {
    const params = new HttpParams()
      .set('sort', '-createdAt')
      .set('limit', limit.toString());

    return this.http.get<ProductsResponse>(`${this.API_BASE_URL}/products`, {
      params
    });
  }

  // Get products by price range
  getProductsByPriceRange(minPrice: number, maxPrice: number, params?: {
    page?: number;
    limit?: number;
    sort?: string;
    category?: string;
    brand?: string;
  }): Observable<ProductsResponse> {
    let httpParams = new HttpParams().set('price', `${minPrice}-${maxPrice}`);
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key as keyof typeof params]) {
          httpParams = httpParams.set(key, params[key as keyof typeof params]!.toString());
        }
      });
    }

    return this.http.get<ProductsResponse>(`${this.API_BASE_URL}/products`, {
      params: httpParams
    });
  }

  // Get related products (same category, different product)
  getRelatedProducts(productId: string, categoryId: string, limit: number = 4): Observable<ProductsResponse> {
    const params = new HttpParams()
      .set('category', categoryId)
      .set('limit', limit.toString());

    return this.http.get<ProductsResponse>(`${this.API_BASE_URL}/products`, {
      params
    });
  }

  // Utility method to get category icon
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

  // Utility method to format price
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  // Utility method to get product rating stars
  getRatingStars(rating: number): string[] {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('fas fa-star');
    }
    
    if (hasHalfStar) {
      stars.push('fas fa-star-half-alt');
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push('far fa-star');
    }
    
    return stars;
  }
}