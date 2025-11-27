import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuditorioService } from '../../services/auditorio.service';
import { Auditorio } from '../../models/auditorio.model';
import { CalendarioAuditorioComponent } from '../calendario-auditorio/calendario-auditorio.component';

@Component({
  selector: 'app-auditorio-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, CalendarioAuditorioComponent],
  template: `
    <div class="auditorio-detail-container">
      <div *ngIf="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Cargando información del auditorio...</p>
      </div>
      
      <div *ngIf="error" class="alert alert-error">
        <span class="alert-icon">!</span>
        <span>{{ error }}</span>
      </div>
      
      <div *ngIf="!loading && !error && auditorio" class="auditorio-detail-content">
        <div class="auditorio-header">
          <h1>{{ auditorio.nombre }}</h1>
          <a routerLink="/auditorios" class="btn btn-secondary">← Volver a Auditorios</a>
        </div>
        
        <div class="auditorio-info-grid">
          <div class="info-card">
            <h3>Información del Auditorio</h3>
            <div class="info-item">
              <span class="info-label">Capacidad:</span>
              <span class="info-value">{{ auditorio.capacidad }} personas</span>
            </div>
            <div class="info-item" *ngIf="auditorio.ubicacion">
              <span class="info-label">Ubicación:</span>
              <span class="info-value">{{ auditorio.ubicacion }}</span>
            </div>
            <div class="info-item" *ngIf="auditorio.descripcion">
              <span class="info-label">Descripción:</span>
              <span class="info-value">{{ auditorio.descripcion }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Estado:</span>
              <span class="info-value" [class.active]="auditorio.activo">
                {{ auditorio.activo ? 'Disponible' : 'No disponible' }}
              </span>
            </div>
          </div>
          
          <div class="reserve-card">
            <h3>Reservar este Auditorio</h3>
            <p>Selecciona una fecha y hora para tu reserva</p>
            <a [routerLink]="['/reservar', auditorio.id]" class="btn btn-primary btn-full">
              Crear Reserva
            </a>
          </div>
        </div>
        
        <div class="calendario-section">
          <h2>Calendario de Disponibilidad</h2>
          <app-calendario-auditorio [auditorioId]="auditorio.id!"></app-calendario-auditorio>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auditorio-detail-container {
      padding: 40px 20px;
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .auditorio-detail-content {
      animation: fadeIn 0.5s ease-out;
    }
    
    .auditorio-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      flex-wrap: wrap;
      gap: 16px;
    }
    
    .auditorio-header h1 {
      font-size: 36px;
      font-weight: 700;
      color: var(--primary-color);
      margin: 0;
    }
    
    .auditorio-info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 40px;
    }
    
    .info-card,
    .reserve-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: var(--shadow-md);
    }
    
    .info-card h3,
    .reserve-card h3 {
      margin: 0 0 20px 0;
      font-size: 20px;
      color: var(--dark-text);
    }
    
    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid var(--border-color);
    }
    
    .info-item:last-child {
      border-bottom: none;
    }
    
    .info-label {
      font-weight: 600;
      color: var(--light-text);
    }
    
    .info-value {
      color: var(--dark-text);
    }
    
    .info-value.active {
      color: var(--success-color);
      font-weight: 600;
    }
    
    .reserve-card {
      text-align: center;
    }
    
    .reserve-card p {
      color: var(--light-text);
      margin-bottom: 20px;
    }
    
    .calendario-section {
      margin-top: 40px;
    }
    
    .calendario-section h2 {
      font-size: 28px;
      font-weight: 700;
      color: var(--primary-color);
      margin-bottom: 24px;
    }
    
    @media (max-width: 768px) {
      .auditorio-info-grid {
        grid-template-columns: 1fr;
      }
      
      .auditorio-header h1 {
        font-size: 28px;
      }
    }
  `]
})
export class AuditorioDetailComponent implements OnInit {
  auditorio: Auditorio | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private auditorioService: AuditorioService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAuditorio(Number(id));
    }
  }

  loadAuditorio(id: number) {
    this.loading = true;
    this.error = null;
    
    this.auditorioService.getAuditorioById(id).subscribe({
      next: (data) => {
        this.auditorio = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar el auditorio';
        this.loading = false;
        console.error(err);
      }
    });
  }
}

