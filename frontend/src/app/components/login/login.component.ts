import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-container">
      <div class="login-card fade-in">
        <div class="login-header">
          <h2>Iniciar Sesión</h2>
          <p class="login-subtitle">Ingresa a tu cuenta para continuar</p>
        </div>
        
        <div *ngIf="error" class="alert alert-error fade-in">
          <span class="alert-icon">!</span>
          <span>{{ error }}</span>
        </div>
        <div *ngIf="success" class="alert alert-success fade-in">
          <span class="alert-icon">✓</span>
          <span>{{ success }}</span>
        </div>

        <form (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label>
              Usuario (nombre.apellido)
            </label>
            <input 
              type="text" 
              [(ngModel)]="email" 
              name="email" 
              placeholder="david.romero"
              required 
              [disabled]="loading"
            />
            <small>Ingresa tu nombre y apellido en formato: nombre.apellido</small>
          </div>

          <div class="form-group">
            <label>
              DNI (Contraseña)
            </label>
            <input 
              type="password" 
              [(ngModel)]="password" 
              name="password" 
              placeholder="12345678"
              required 
              [disabled]="loading"
              maxlength="8"
            />
            <small>Ingresa tu DNI de 8 dígitos</small>
          </div>

          <button 
            type="submit" 
            class="btn btn-primary btn-full" 
            [disabled]="loading"
          >
            <span *ngIf="loading" class="spinner-small"></span>
            <span>{{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}</span>
          </button>

        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: calc(100vh - 200px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
    }
    
    .login-card {
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(10px);
      border-radius: 24px;
      padding: 48px 40px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      max-width: 450px;
      width: 100%;
      border: 2px solid rgba(26, 35, 126, 0.1);
    }
    
    .login-header {
      text-align: center;
      margin-bottom: 40px;
    }
    
    .login-icon {
      font-size: 64px;
      margin-bottom: 16px;
      animation: bounce 2s ease-in-out infinite;
    }
    
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    
    h2 {
      color: #667eea;
      margin-bottom: 12px;
      font-size: 32px;
      font-weight: 700;
    }
    
    .login-subtitle {
      color: #666;
      font-size: 16px;
      margin: 0;
    }
    
    .login-form {
      margin-top: 32px;
    }
    
    .label-icon {
      margin-right: 8px;
      font-size: 18px;
    }
    
    .btn-full {
      width: 100%;
      margin-top: 8px;
      padding: 16px;
      font-size: 18px;
    }
    
    .spinner-small {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      display: inline-block;
    }
    
    .login-footer {
      text-align: center;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e0e0e0;
    }
    
    .login-footer p {
      color: #666;
      margin: 0;
    }
    
    .link-primary {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.3s ease;
    }
    
    .link-primary:hover {
      color: #764ba2;
      text-decoration: underline;
    }
    
    @media (max-width: 768px) {
      .login-card {
        padding: 32px 24px;
      }
      
      h2 {
        font-size: 28px;
      }
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.loading = true;
    this.error = null;
    this.success = null;

    this.authService.login(this.email, this.password).subscribe({
      next: (user) => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.success = 'Inicio de sesión exitoso';
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1000);
      },
      error: (err) => {
        let errorMessage = 'Credenciales inválidas';
        if (err.error) {
          if (typeof err.error === 'string') {
            errorMessage = err.error;
          } else if (err.error.message) {
            errorMessage = err.error.message;
          }
        } else if (err.message) {
          errorMessage = err.message;
        }
        this.error = errorMessage;
        this.loading = false;
      }
    });
  }
}





