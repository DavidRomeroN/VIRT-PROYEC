import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuditorioService } from '../../services/auditorio.service';
import { Auditorio } from '../../models/auditorio.model';

@Component({
  selector: 'app-auditorios-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="auditorios-container">
      <div class="page-header fade-in">
        <h1 class="page-title">Auditorios Disponibles</h1>
        <p class="page-subtitle">Explora nuestros espacios y encuentra el perfecto para tu evento</p>
      </div>
      
      <div *ngIf="loading" class="loading-container">
        <div class="spinner"></div>
        <p class="loading-text">Cargando auditorios...</p>
      </div>
      
      <div *ngIf="error" class="alert alert-error fade-in">
        <span class="alert-icon">!</span>
        <span>{{ error }}</span>
      </div>
      
      <div *ngIf="!loading && !error && auditorios.length === 0" class="empty-state fade-in">
        <div class="empty-icon">A</div>
        <h3>No hay auditorios disponibles</h3>
        <p>Por el momento no hay auditorios activos en el sistema.</p>
      </div>
      
      <div class="auditorios-grid" *ngIf="!loading && !error && auditorios.length > 0">
        <div class="auditorio-card fade-in" 
             *ngFor="let auditorio of auditorios; let i = index"
             [style.animation-delay]="i * 0.1 + 's'">
          <div class="auditorio-image-container">
            <div class="auditorio-image" *ngIf="auditorio.imagenUrl">
              <img [src]="auditorio.imagenUrl" [alt]="auditorio.nombre" 
                   (error)="onImageError($event)" />
              <div class="image-overlay">
                <span class="overlay-text">Ver Detalles</span>
              </div>
            </div>
            <div class="auditorio-image-placeholder" *ngIf="!auditorio.imagenUrl">
              <span class="placeholder-icon">A</span>
            </div>
            <div class="auditorio-badge" *ngIf="auditorio.activo">
              <span>Disponible</span>
            </div>
          </div>
          <div class="auditorio-content">
            <h3 class="auditorio-name">{{ auditorio.nombre }}</h3>
            <div class="auditorio-info">
              <div class="info-item">
                <span class="info-icon">Cap.</span>
                <span class="info-label">Capacidad:</span>
                <span class="info-value">{{ auditorio.capacidad }} personas</span>
              </div>
              <div class="info-item" *ngIf="auditorio.ubicacion">
                <span class="info-icon">Ubic.</span>
                <span class="info-label">Ubicación:</span>
                <span class="info-value">{{ auditorio.ubicacion }}</span>
              </div>
            </div>
            <p class="auditorio-description" *ngIf="auditorio.descripcion">
              {{ auditorio.descripcion }}
            </p>
            <div class="auditorio-actions">
              <a [routerLink]="['/auditorios', auditorio.id]" class="btn btn-outline btn-full">
                <span>Ver Detalles</span>
              </a>
              <a [routerLink]="['/reservar', auditorio.id]" class="btn btn-primary btn-full">
                <span>Reservar Ahora</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auditorios-container {
      padding: 40px 20px;
    }
    
    .page-header {
      text-align: center;
      margin-bottom: 50px;
      color: var(--primary-color);
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      padding: 40px 20px;
      border-radius: 24px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      margin: 0 20px 50px 20px;
    }
    
    .page-title {
      font-size: clamp(32px, 5vw, 48px);
      font-weight: 800;
      margin-bottom: 16px;
      color: var(--primary-color);
    }
    
    .page-subtitle {
      font-size: clamp(16px, 2vw, 20px);
      color: var(--light-text);
      font-weight: 400;
      margin: 0;
    }
    
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      gap: 20px;
    }
    
    .loading-text {
      color: white;
      font-size: 18px;
      font-weight: 500;
    }
    
    .empty-state {
      text-align: center;
      padding: 80px 20px;
      color: white;
    }
    
    .empty-icon {
      font-size: 80px;
      margin-bottom: 20px;
      opacity: 0.8;
    }
    
    .empty-state h3 {
      font-size: 28px;
      margin-bottom: 12px;
    }
    
    .empty-state p {
      font-size: 18px;
      opacity: 0.9;
    }
    
    .auditorios-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 30px;
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .auditorio-card {
      background: white;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      animation: fadeInUp 0.6s ease-out both;
      border: 1px solid rgba(102, 126, 234, 0.1);
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
    
    .auditorio-card:hover {
      transform: translateY(-10px) scale(1.02);
      box-shadow: 0 20px 40px rgba(102, 126, 234, 0.25);
    }
    
    .auditorio-image-container {
      position: relative;
      width: 100%;
      height: 250px;
      overflow: hidden;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .auditorio-image {
      width: 100%;
      height: 100%;
      position: relative;
    }
    
    .auditorio-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }
    
    .auditorio-card:hover .auditorio-image img {
      transform: scale(1.1);
    }
    
    .image-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(102, 126, 234, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .auditorio-card:hover .image-overlay {
      opacity: 1;
    }
    
    .overlay-text {
      color: white;
      font-size: 20px;
      font-weight: 600;
    }
    
    .auditorio-image-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .placeholder-icon {
      font-size: 80px;
      opacity: 0.5;
    }
    
    .auditorio-badge {
      position: absolute;
      top: 16px;
      right: 16px;
      background: rgba(40, 167, 69, 0.95);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(10px);
    }
    
    .auditorio-content {
      padding: 24px;
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    
    .auditorio-name {
      color: #667eea;
      margin-bottom: 16px;
      font-size: 24px;
      font-weight: 700;
    }
    
    .auditorio-info {
      margin-bottom: 16px;
    }
    
    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
      font-size: 14px;
    }
    
    .info-icon {
      font-size: 18px;
    }
    
    .info-label {
      font-weight: 600;
      color: #666;
    }
    
    .info-value {
      color: #333;
      font-weight: 500;
    }
    
    .auditorio-description {
      color: #666;
      line-height: 1.6;
      margin-bottom: 20px;
      flex: 1;
      font-size: 14px;
    }
    
    .auditorio-actions {
      margin-top: auto;
    }
    
    .btn-full {
      width: 100%;
      justify-content: center;
    }
    
    @media (max-width: 768px) {
      .auditorios-grid {
        grid-template-columns: 1fr;
        gap: 24px;
      }
      
      .auditorio-image-container {
        height: 200px;
      }
    }
  `]
})
export class AuditoriosListComponent implements OnInit {
  auditorios: Auditorio[] = [];
  loading = true;
  error: string | null = null;

  constructor(private auditorioService: AuditorioService) {}

  ngOnInit(): void {
    this.loadAuditorios();
  }

  loadAuditorios(): void {
    this.loading = true;
    this.auditorioService.getAuditoriosActivos().subscribe({
      next: (data) => {
        this.auditorios = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los auditorios';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onImageError(event: any): void {
    event.target.style.display = 'none';
    const placeholder = event.target.parentElement?.querySelector('.auditorio-image-placeholder');
    if (placeholder) {
      placeholder.style.display = 'flex';
    }
  }
}





