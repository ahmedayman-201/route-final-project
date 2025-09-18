import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

export interface AuthResponse {
  data: {
    user: User;
    token: string;
  };
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_BASE_URL = 'https://ecommerce.routemisr.com/api/v1';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private isGuestMode = signal(false);

  private isBrowser: boolean;

  constructor(private http: HttpClient) {
    this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    this.initializeAuth();
  }

  private initializeAuth() {
    if (!this.isBrowser) return;

    const token = localStorage.getItem(this.TOKEN_KEY);
    const userData = localStorage.getItem(this.USER_KEY);

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
        this.isLoggedInSubject.next(true);
      } catch {
        this.clearAuthData();
      }
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_BASE_URL}/auth/signin`, credentials)
      .pipe(
        tap(response => {
          this.setAuthData(response.data.user, response.data.token);
        }),
        catchError(error => { throw error; })
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_BASE_URL}/auth/signup`, userData)
      .pipe(
        tap(() => this.showEmailVerificationMessage()),
        catchError(error => { throw error; })
      );
  }

  forgotPassword(email: ForgotPasswordRequest): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/auth/forgotPasswords`, email);
  }

  resetPassword(token: string, password: string, passwordConfirm: string): Observable<any> {
    return this.http.patch(`${this.API_BASE_URL}/auth/resetPassword/${token}`, {
      password,
      passwordConfirm
    });
  }

  verifyEmail(token: string): Observable<any> {
    return this.http.get(`${this.API_BASE_URL}/auth/verifyEmail/${token}`);
  }

  loginAsGuest(): void {
    this.isGuestMode.set(true);
    this.isLoggedInSubject.next(true);
    this.currentUserSubject.next({
      _id: 'guest',
      name: 'Guest User',
      email: 'guest@example.com',
      role: 'guest',
      active: true
    });
  }

  logout(): void {
    this.clearAuthData();
    this.isGuestMode.set(false);
  }

  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  isGuest(): boolean {
    return this.isGuestMode();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  canPerformAction(): boolean {
    return this.isLoggedIn() && !this.isGuest();
  }

  private setAuthData(user: User, token: string): void {
    if (!this.isBrowser) return;
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.isLoggedInSubject.next(true);
    this.isGuestMode.set(false);
  }

  private clearAuthData(): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
    this.isGuestMode.set(false);
  }

  private showEmailVerificationMessage(): void {
    console.log('Please check your email for verification link');
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
    }
    return new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  validateToken(): Observable<any> {
    const token = this.getToken();
    if (!token) throw new Error('No token found');

    return this.http.get(`${this.API_BASE_URL}/users/getMe`, {
      headers: this.getAuthHeaders()
    });
  }

  updateProfile(userData: Partial<User>): Observable<any> {
    return this.http.patch(`${this.API_BASE_URL}/users/updateMe`, userData, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(() => {
        if (!this.isBrowser) return;
        const currentUser = this.getCurrentUser();
        if (currentUser) {
          const updatedUser = { ...currentUser, ...userData };
          this.currentUserSubject.next(updatedUser);
          localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
        }
      })
    );
  }

  changePassword(currentPassword: string, newPassword: string, newPasswordConfirm: string): Observable<any> {
    return this.http.patch(`${this.API_BASE_URL}/users/updateMyPassword`, {
      passwordCurrent: currentPassword,
      password: newPassword,
      passwordConfirm: newPasswordConfirm
    }, {
      headers: this.getAuthHeaders()
    });
  }
}
