import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterModule],
  template: `
    <div class="app-container">
      <header class="header">
        <div class="container">
          <div class="header-brand">
            <div class="logo">🏛️</div>
            <h1>Sistema de Reserva de Auditorios</h1>
          </div>
          <nav class="nav-menu">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              <span class="nav-icon">🏠</span>
              <span class="nav-text">Inicio</span>
            </a>
            <a routerLink="/auditorios" routerLinkActive="active">
              <span class="nav-icon">🎭</span>
              <span class="nav-text">Auditorios</span>
            </a>
            <a routerLink="/reservas" routerLinkActive="active" *ngIf="isLoggedIn">
              <span class="nav-icon">📋</span>
              <span class="nav-text">Mis Reservas</span>
            </a>
            <div class="nav-divider" *ngIf="!isLoggedIn"></div>
            <a routerLink="/login" routerLinkActive="active" *ngIf="!isLoggedIn" class="btn-login">
              <span class="nav-icon">🔐</span>
              <span class="nav-text">Iniciar Sesión</span>
            </a>
            <a routerLink="/register" routerLinkActive="active" *ngIf="!isLoggedIn" class="btn-register">
              <span class="nav-text">Registrarse</span>
            </a>
            <a (click)="logout()" *ngIf="isLoggedIn" class="btn-logout">
              <span class="nav-icon">🚪</span>
              <span class="nav-text">Cerrar Sesión</span>
            </a>
          </nav>
        </div>
      </header>
      <main class="main-content fade-in">
        <router-outlet></router-outlet>
      </main>
      <footer class="footer" *ngIf="showFooter">
        <div class="container">
          <p>&copy; {{ currentYear }} Sistema de Reserva de Auditorios. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .header {
      background: rgba(255, 255, 255, 0.98);
      padding: 16px 0;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      margin-bottom: 0;
      position: sticky;
      top: 0;
      z-index: 1000;
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(102, 126, 234, 0.1);
    }
    
    .header .container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
    }
    
    .header-brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .logo {
      font-size: 32px;
      animation: pulse 2s ease-in-out infinite;
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    
    .header h1 {
      color: #667eea;
      font-size: 22px;
      font-weight: 700;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .nav-menu {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
    }
    
    .nav-menu a {
      text-decoration: none;
      color: #333;
      font-weight: 500;
      padding: 10px 16px;
      border-radius: 10px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      cursor: pointer;
      position: relative;
    }
    
    .nav-menu a:hover {
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
      transform: translateY(-2px);
    }
    
    .nav-menu a.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
    
    .nav-icon {
      font-size: 18px;
    }
    
    .nav-text {
      display: inline;
    }
    
    .nav-divider {
      width: 1px;
      height: 24px;
      background: #e0e0e0;
      margin: 0 8px;
    }
    
    .btn-login {
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;
    }
    
    .btn-register {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
    
    .btn-register:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
    }
    
    .btn-logout {
      color: #dc3545;
    }
    
    .btn-logout:hover {
      background: rgba(220, 53, 69, 0.1);
      color: #dc3545;
    }
    
    .main-content {
      flex: 1;
      padding-bottom: 60px;
    }
    
    .footer {
      background: rgba(255, 255, 255, 0.95);
      padding: 24px 0;
      margin-top: 60px;
      border-top: 1px solid rgba(102, 126, 234, 0.1);
      text-align: center;
      color: #6c757d;
      font-size: 14px;
    }
    
    @media (max-width: 768px) {
      .header .container {
        flex-direction: column;
      }
      
      .header h1 {
        font-size: 18px;
      }
      
      .nav-menu {
        width: 100%;
        justify-content: center;
      }
      
      .nav-text {
        display: none;
      }
      
      .nav-menu a {
        padding: 12px;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  isLoggedIn = false;
  currentYear = new Date().getFullYear();
  showFooter = true;

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkLoginStatus();
    
    // Actualizar estado de login cuando cambia la ruta
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkLoginStatus();
      });
  }

  checkLoginStatus() {
    this.isLoggedIn = !!localStorage.getItem('currentUser');
  }

  logout() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      localStorage.removeItem('currentUser');
      this.isLoggedIn = false;
      this.router.navigate(['/']);
    }
  }
}

