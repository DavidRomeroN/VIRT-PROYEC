import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterModule],
  template: `
    <div class="app-container">
      <header class="header">
        <div class="container">
          <nav class="nav-menu">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              <span class="nav-text">Inicio</span>
            </a>
            <a routerLink="/auditorios" routerLinkActive="active">
              <span class="nav-text">Auditorios</span>
            </a>
            <a routerLink="/reservas" routerLinkActive="active" *ngIf="isLoggedIn">
              <span class="nav-text">Mis Reservas</span>
            </a>
            <a routerLink="/admin" routerLinkActive="active" *ngIf="isAdmin">
              <span class="nav-text">Administración</span>
            </a>
            <div class="nav-divider" *ngIf="isLoggedIn"></div>
            <a routerLink="/login" routerLinkActive="active" *ngIf="!isLoggedIn" class="btn-login">
              <span class="nav-text">Iniciar Sesión</span>
            </a>
            <a (click)="logout()" *ngIf="isLoggedIn" class="btn-logout">
              <span class="nav-text">Cerrar Sesión</span>
            </a>
          </nav>
          <div class="header-brand">
            <img src="https://lamb-academic.upeu.edu.pe/student-portal/assets/logos/lamb-logo-white.svg" 
                 alt="LAMB University" 
                 class="logo-img"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
            <div class="logo-fallback" style="display: none;">LAMB</div>
            <div class="university-info">
              <h1 class="university-name">LAMB University</h1>
              <p class="university-subtitle">Sistema de Reserva de Auditorios</p>
            </div>
          </div>
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
      background: var(--primary-color);
      padding: 16px 0;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      margin-bottom: 0;
      position: sticky;
      top: 0;
      z-index: 1000;
      backdrop-filter: blur(10px);
      border-bottom: 2px solid var(--primary-dark);
    }
    
    .header .container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
    }
    
    .nav-menu {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
      order: 1;
    }
    
    .header-brand {
      display: flex;
      align-items: center;
      gap: 16px;
      order: 2;
      margin-left: auto;
    }
    
    .logo-img {
      height: 55px;
      width: auto;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }
    
    .logo-fallback {
      font-size: 32px;
      animation: pulse 2s ease-in-out infinite;
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    
    .university-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    .university-name {
      color: white;
      font-size: 20px;
      font-weight: 700;
      margin: 0;
      line-height: 1.2;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    .university-subtitle {
      color: rgba(255, 255, 255, 0.9);
      font-size: 13px;
      font-weight: 400;
      margin: 0;
      line-height: 1.2;
    }
    
    .nav-menu a {
      text-decoration: none;
      color: white;
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
      background: rgba(255, 255, 255, 0.2);
      color: white;
      transform: translateY(-2px);
    }
    
    .nav-menu a.active {
      background: rgba(255, 255, 255, 0.3);
      color: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
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
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }
    
    .btn-logout {
      color: white;
    }
    
    .btn-logout:hover {
      background: rgba(220, 53, 69, 0.3);
      color: white;
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
  isAdmin = false;
  currentYear = new Date().getFullYear();
  showFooter = true;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

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
    this.isLoggedIn = this.authService.isLoggedIn();
    const user = this.authService.getCurrentUser();
    this.isAdmin = user?.rol === 'ADMINISTRADOR';
  }

  logout() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      localStorage.removeItem('currentUser');
      this.isLoggedIn = false;
      this.router.navigate(['/']);
    }
  }
}

