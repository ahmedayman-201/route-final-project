import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, LoginRequest, RegisterRequest, ForgotPasswordRequest, User } from '../../services/auth';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-modal.html',
  styleUrl: './auth-modal.css'
})
export class AuthModalComponent implements OnInit {
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() loginSuccess = new EventEmitter<User>();
  @Output() registerSuccess = new EventEmitter<User>();

  currentForm: 'login' | 'register' | 'forgot' = 'login';
  isLoading: boolean = false;

  // Form data
  loginData: LoginRequest = {
    email: '',
    password: ''
  };

  registerData: RegisterRequest & { agreeTerms: boolean } = {
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    agreeTerms: false
  };

  forgotData: ForgotPasswordRequest = {
    email: ''
  };

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Reset forms when modal opens
    if (this.isOpen) {
      this.resetForms();
    }
  }

  closeModal(): void {
    this.close.emit();
    this.resetForms();
  }

  showLogin(event?: Event): void {
    if (event) event.preventDefault();
    this.currentForm = 'login';
    this.resetForms();
  }

  showRegister(event?: Event): void {
    if (event) event.preventDefault();
    this.currentForm = 'register';
    this.resetForms();
  }

  showForgotPassword(event?: Event): void {
    if (event) event.preventDefault();
    this.currentForm = 'forgot';
    this.resetForms();
  }

  async onLogin(): Promise<void> {
    if (!this.loginData.email || !this.loginData.password) {
      return;
    }

    this.isLoading = true;
    try {
      const response = await this.authService.login(this.loginData).toPromise();
      if (response) {
        this.loginSuccess.emit(response.data.user);
        this.closeModal();
      }
    } catch (error) {
      console.error('Login error:', error);
      // Handle error (show toast, etc.)
    } finally {
      this.isLoading = false;
    }
  }

  async onRegister(): Promise<void> {
    if (!this.registerData.name || !this.registerData.email || 
        !this.registerData.password || !this.registerData.passwordConfirm ||
        !this.registerData.agreeTerms) {
      return;
    }

    if (!this.passwordsMatch()) {
      return;
    }

    this.isLoading = true;
    try {
      const response = await this.authService.register({
        name: this.registerData.name,
        email: this.registerData.email,
        password: this.registerData.password,
        passwordConfirm: this.registerData.passwordConfirm
      }).toPromise();
      
      if (response) {
        this.registerSuccess.emit(response.data.user);
        this.closeModal();
      }
    } catch (error) {
      console.error('Registration error:', error);
      // Handle error (show toast, etc.)
    } finally {
      this.isLoading = false;
    }
  }

  async onForgotPassword(): Promise<void> {
    if (!this.forgotData.email) {
      return;
    }

    this.isLoading = true;
    try {
      await this.authService.forgotPassword(this.forgotData).toPromise();
      // Show success message
      this.showLogin();
    } catch (error) {
      console.error('Forgot password error:', error);
      // Handle error (show toast, etc.)
    } finally {
      this.isLoading = false;
    }
  }

  loginAsGuest(): void {
    this.authService.loginAsGuest();
    this.closeModal();
  }

  passwordsMatch(): boolean {
    return this.registerData.password === this.registerData.passwordConfirm;
  }

  private resetForms(): void {
    this.loginData = {
      email: '',
      password: ''
    };

    this.registerData = {
      name: '',
      email: '',
      password: '',
      passwordConfirm: '',
      agreeTerms: false
    };

    this.forgotData = {
      email: ''
    };

    this.isLoading = false;
  }
}