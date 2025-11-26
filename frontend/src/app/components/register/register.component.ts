import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="register-container">
      <div class="register-card fade-in">
        <div class="register-header">
          <div class="register-icon">👤</div>
          <h2>Crear Cuenta</h2>
          <p class="register-subtitle">Únete a nuestro sistema de reservas</p>
        </div>
        
        <div *ngIf="error" class="alert alert-error fade-in">
          <span class="alert-icon">⚠️</span>
          <span>{{ error }}</span>
        </div>
        <div *ngIf="success" class="alert alert-success fade-in">
          <span class="alert-icon">✓</span>
          <span>{{ success }}</span>
        </div>

        <form (ngSubmit)="onSubmit()" class="register-form">
          <div class="form-row">
            <div class="form-group">
              <label>
                <span class="label-icon">👤</span>
                Nombre
              </label>
              <input 
                type="text" 
                [(ngModel)]="usuario.nombre" 
                name="nombre" 
                placeholder="Tu nombre"
                required 
                [disabled]="loading"
              />
            </div>

            <div class="form-group">
              <label>
                <span class="label-icon">👤</span>
                Apellido
              </label>
              <input 
                type="text" 
                [(ngModel)]="usuario.apellido" 
                name="apellido" 
                placeholder="Tu apellido"
                required 
                [disabled]="loading"
              />
            </div>
          </div>

          <div class="form-group">
            <label>
              <span class="label-icon">📧</span>
              Correo Electrónico
            </label>
            <input 
              type="email" 
              [(ngModel)]="usuario.email" 
              name="email" 
              placeholder="tu@email.com"
              required 
              [disabled]="loading"
            />
          </div>

          <div class="form-group">
            <label>
              <span class="label-icon">🔒</span>
              Contraseña
            </label>
            <input 
              type="password" 
              [(ngModel)]="usuario.password" 
              name="password" 
              placeholder="••••••••"
              required 
              [disabled]="loading"
            />
            <small>Mínimo 6 caracteres</small>
          </div>

          <button 
            type="submit" 
            class="btn btn-primary btn-full" 
            [disabled]="loading"
          >
            <span *ngIf="!loading">✨</span>
            <span *ngIf="loading" class="spinner-small"></span>
            <span>{{ loading ? 'Registrando...' : 'Crear Cuenta' }}</span>
          </button>

          <div class="register-footer">
            <p>
              ¿Ya tienes cuenta? 
              <a routerLink="/login" class="link-primary">Inicia sesión aquí</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: calc(100vh - 200px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
    }
    
    .register-card {
      background: white;
      border-radius: 24px;
      padding: 48px 40px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
      max-width: 550px;
      width: 100%;
      border: 1px solid rgba(102, 126, 234, 0.1);
    }
    
    .register-header {
      text-align: center;
      margin-bottom: 40px;
    }
    
    .register-icon {
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
    
    .register-subtitle {
      color: #666;
      font-size: 16px;
      margin: 0;
    }
    
    .register-form {
      margin-top: 32px;
    }
    
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
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
    
    .register-footer {
      text-align: center;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e0e0e0;
    }
    
    .register-footer p {
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
      .register-card {
        padding: 32px 24px;
      }
      
      .form-row {
        grid-template-columns: 1fr;
      }
      
      h2 {
        font-size: 28px;
      }
    }
  `]
})
export class RegisterComponent {
  usuario: Usuario = {
    email: '',
    nombre: '',
    apellido: '',
    password: '',
    rol: 'ESTUDIANTE'
  };
  
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

    this.authService.register(this.usuario).subscribe({
      next: (user) => {
        this.success = 'Registro exitoso. Redirigiendo...';
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al registrar usuario';
        this.loading = false;
      }
    });
  }
}





