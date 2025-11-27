import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuditorioService } from '../../services/auditorio.service';
import { Auditorio } from '../../models/auditorio.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="home-container">
      <div class="hero-section">
        <div class="hero-content fade-in">
          <h1 class="hero-title">
            <span class="title-line">Bienvenido al Sistema de</span>
            <span class="title-highlight">Reserva de Auditorios</span>
          </h1>
          <p class="hero-subtitle">Gestiona tus reservas de manera fácil, rápida y eficiente</p>
          <div class="hero-actions">
            <a routerLink="/auditorios" class="btn btn-primary btn-large">
              <span>Explorar Auditorios</span>
            </a>
            <a routerLink="/reservas" class="btn btn-outline btn-large" *ngIf="isLoggedIn">
              <span>Mis Reservas</span>
            </a>
          </div>
        </div>
        <div class="hero-decoration">
          <div class="decoration-circle circle-1"></div>
          <div class="decoration-circle circle-2"></div>
          <div class="decoration-circle circle-3"></div>
        </div>
      </div>

      <div class="features-section">
        <h2 class="section-title">¿Por qué elegir nuestro sistema?</h2>
        <div class="features-grid">
          <div class="feature-card" *ngFor="let feature of features; let i = index" [style.animation-delay]="i * 0.1 + 's'">
            <div class="feature-icon">{{ feature.icon }}</div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </div>

      <div class="stats-section" *ngIf="stats">
        <div class="stats-grid">
          <div class="stat-card" *ngFor="let stat of stats">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      min-height: calc(100vh - 200px);
      position: relative;
    }
    
    .hero-section {
      position: relative;
      text-align: center;
      padding: 100px 20px;
      color: var(--primary-color);
      overflow: hidden;
      margin-bottom: 80px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 0 0 32px 32px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      margin: 0 20px 80px 20px;
    }
    
    .hero-content {
      position: relative;
      z-index: 2;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .hero-title {
      font-size: clamp(32px, 5vw, 64px);
      margin-bottom: 24px;
      font-weight: 800;
      line-height: 1.2;
    }
    
    .title-line {
      display: block;
      color: var(--primary-color);
      font-weight: 600;
    }
    
    .title-highlight {
      display: block;
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 800;
    }
    
    .hero-subtitle {
      font-size: clamp(18px, 2.5vw, 24px);
      margin-bottom: 40px;
      color: var(--light-text);
      font-weight: 400;
    }
    
    .hero-actions {
      display: flex;
      gap: 20px;
      justify-content: center;
      flex-wrap: wrap;
    }
    
    .btn-large {
      padding: 18px 36px;
      font-size: 18px;
      display: inline-flex;
      align-items: center;
      gap: 10px;
    }
    
    .hero-decoration {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
      pointer-events: none;
      opacity: 0.1;
    }
    
    .decoration-circle {
      position: absolute;
      border-radius: 50%;
      background: var(--gradient-primary);
      animation: float 6s ease-in-out infinite;
    }
    
    .circle-1 {
      width: 300px;
      height: 300px;
      top: -100px;
      right: -100px;
      animation-delay: 0s;
    }
    
    .circle-2 {
      width: 200px;
      height: 200px;
      bottom: -50px;
      left: -50px;
      animation-delay: 2s;
    }
    
    .circle-3 {
      width: 150px;
      height: 150px;
      top: 50%;
      left: 10%;
      animation-delay: 4s;
    }
    
    @keyframes float {
      0%, 100% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(20px, -20px) scale(1.1); }
    }
    
    .features-section {
      padding: 80px 20px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 32px;
      margin: 40px 20px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.8);
    }
    
    .section-title {
      text-align: center;
      color: var(--primary-color);
      font-size: clamp(28px, 4vw, 42px);
      margin-bottom: 50px;
      font-weight: 700;
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 30px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .feature-card {
      background: white;
      padding: 40px 30px;
      border-radius: 20px;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      animation: fadeInUp 0.6s ease-out both;
      border: 2px solid rgba(26, 35, 126, 0.1);
      position: relative;
      overflow: hidden;
    }
    
    .feature-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background: var(--gradient-primary);
      transform: scaleX(0);
      transition: transform 0.4s ease;
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .feature-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 32px rgba(26, 35, 126, 0.15);
      border-color: var(--primary-color);
    }
    
    .feature-card:hover::before {
      transform: scaleX(1);
    }
    
    .feature-icon {
      font-size: 64px;
      margin-bottom: 20px;
      display: none;
      animation: bounce 2s ease-in-out infinite;
    }
    
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    
    .feature-title {
      color: var(--primary-color);
      margin-bottom: 16px;
      font-size: 22px;
      font-weight: 700;
    }
    
    .feature-description {
      color: var(--light-text);
      line-height: 1.7;
      font-size: 15px;
    }
    
    .stats-section {
      padding: 60px 20px;
      margin-top: 60px;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 30px;
      max-width: 1000px;
      margin: 0 auto;
    }
    
    .stat-card {
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      padding: 30px;
      border-radius: 16px;
      text-align: center;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .stat-value {
      font-size: 48px;
      font-weight: 800;
      color: white;
      margin-bottom: 8px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    .stat-label {
      color: rgba(255, 255, 255, 0.9);
      font-size: 16px;
      font-weight: 500;
    }
    
    @media (max-width: 768px) {
      .hero-section {
        padding: 60px 20px;
      }
      
      .hero-actions {
        flex-direction: column;
        align-items: stretch;
      }
      
      .btn-large {
        width: 100%;
        justify-content: center;
      }
      
      .features-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  isLoggedIn = false;
  stats: any[] | null = null;

  features = [
    {
      icon: '',
      title: 'Reserva Fácil',
      description: 'Reserva auditorios con fecha, día y hora de manera sencilla e intuitiva. Proceso rápido y sin complicaciones.'
    },
    {
      icon: '',
      title: 'Gestión Completa',
      description: 'Administra todas tus reservas desde un solo lugar. Visualiza, edita y cancela cuando lo necesites.'
    },
    {
      icon: '',
      title: 'Multimedia',
      description: 'Visualiza fotos y videos de alta calidad de los auditorios disponibles antes de reservar.'
    },
    {
      icon: '',
      title: 'Rápido y Eficiente',
      description: 'Sistema optimizado para ofrecerte la mejor experiencia de usuario con tiempos de respuesta mínimos.'
    },
    {
      icon: '',
      title: 'Notificaciones',
      description: 'Recibe confirmaciones y recordatorios de tus reservas para que nunca olvides un evento importante.'
    },
    {
      icon: '',
      title: 'Seguro y Confiable',
      description: 'Tus datos están protegidos con las mejores prácticas de seguridad y privacidad.'
    }
  ];

  constructor(private auditorioService: AuditorioService) {}

  ngOnInit(): void {
    this.checkLoginStatus();
    this.loadStats();
  }

  checkLoginStatus() {
    this.isLoggedIn = !!localStorage.getItem('currentUser');
  }

  loadStats() {
    // Cargar estadísticas si es necesario
    // Por ahora, dejamos stats como null para no mostrar la sección
  }
}





