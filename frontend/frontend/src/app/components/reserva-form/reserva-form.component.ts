import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReservaService } from '../../services/reserva.service';
import { AuditorioService } from '../../services/auditorio.service';
import { AuthService } from '../../services/auth.service';
import { Reserva, ReservaCreateDTO } from '../../models/reserva.model';
import { Auditorio } from '../../models/auditorio.model';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-reserva-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="reserva-container">
      <div class="reserva-card fade-in">
        <div class="reserva-header">
          <h2>Nueva Reserva</h2>
          <p class="reserva-subtitle">Completa el formulario para realizar tu reserva</p>
        </div>
        
        <div *ngIf="auditorio" class="auditorio-info-card">
          <div class="auditorio-info-header">
            <div>
              <h3>{{ auditorio.nombre }}</h3>
              <div class="auditorio-details">
                <span class="detail-item">
                  <span class="detail-icon">Cap.</span>
                  <span>{{ auditorio.capacidad }} personas</span>
                </span>
                <span class="detail-item" *ngIf="auditorio.ubicacion">
                  <span class="detail-icon">Ubic.</span>
                  <span>{{ auditorio.ubicacion }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="error" class="alert alert-error fade-in">
          <span class="alert-icon">!</span>
          <span>{{ error }}</span>
        </div>
        <div *ngIf="success" class="alert alert-success fade-in">
          <span class="alert-icon">✓</span>
          <span>{{ success }}</span>
        </div>

        <form (ngSubmit)="onSubmit()" *ngIf="auditorio" class="reserva-form">
          <div class="form-row">
            <div class="form-group">
              <label>
                Fecha de Reserva
              </label>
              <input 
                type="date" 
                [(ngModel)]="reserva.fecha" 
                name="fecha" 
                [min]="minDate" 
                required 
                [disabled]="loading"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>
                Hora de Inicio
              </label>
              <input 
                type="time" 
                [(ngModel)]="reserva.horaInicio" 
                name="horaInicio" 
                required 
                [disabled]="loading"
              />
            </div>

            <div class="form-group">
              <label>
                Hora de Fin
              </label>
              <input 
                type="time" 
                [(ngModel)]="reserva.horaFin" 
                name="horaFin" 
                required 
                [disabled]="loading"
              />
            </div>
          </div>

          <div class="form-group">
            <label>
              Motivo de la Reserva
            </label>
            <textarea 
              [(ngModel)]="reserva.motivo" 
              name="motivo" 
              placeholder="Describe el motivo de tu reserva (ej: Conferencia, Presentación, Evento, etc.)"
              rows="4"
              [disabled]="loading"
            ></textarea>
            <small>Proporciona detalles sobre el evento que realizarás</small>
          </div>

          <div class="form-actions">
            <button 
              type="submit" 
              class="btn btn-primary btn-large" 
              [disabled]="loading"
            >
              <span *ngIf="loading" class="spinner-small"></span>
              <span>{{ loading ? 'Reservando...' : 'Confirmar Reserva' }}</span>
            </button>
            <a routerLink="/auditorios" class="btn btn-secondary btn-large">
              Cancelar
            </a>
          </div>
        </form>

        <div *ngIf="!auditorio && !loading" class="empty-state">
          <div class="empty-icon">X</div>
          <h3>Auditorio no encontrado</h3>
          <p>El auditorio que buscas no existe o no está disponible.</p>
          <a routerLink="/auditorios" class="btn btn-primary">Volver a Auditorios</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reserva-container {
      padding: 40px 20px;
      min-height: calc(100vh - 200px);
    }
    
    .reserva-card {
      background: white;
      border-radius: 24px;
      padding: 48px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      max-width: 700px;
      margin: 0 auto;
      border: 1px solid rgba(102, 126, 234, 0.1);
    }
    
    .reserva-header {
      text-align: center;
      margin-bottom: 40px;
    }
    
    h2 {
      color: #667eea;
      margin-bottom: 12px;
      font-size: 32px;
      font-weight: 700;
    }
    
    .reserva-subtitle {
      color: #666;
      font-size: 16px;
      margin: 0;
    }
    
    .auditorio-info-card {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
      padding: 24px;
      border-radius: 16px;
      margin-bottom: 32px;
      border: 2px solid rgba(102, 126, 234, 0.2);
    }
    
    .auditorio-info-header {
      display: flex;
      align-items: flex-start;
      gap: 20px;
    }
    
    .auditorio-icon {
      font-size: 48px;
      flex-shrink: 0;
      display: none;
    }
    
    .auditorio-info-header h3 {
      color: #667eea;
      margin-bottom: 12px;
      font-size: 24px;
      font-weight: 700;
    }
    
    .auditorio-details {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
    }
    
    .detail-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      font-size: 14px;
    }
    
    .detail-icon {
      font-size: 18px;
    }
    
    .reserva-form {
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
    
    .form-actions {
      display: flex;
      gap: 16px;
      margin-top: 40px;
      flex-wrap: wrap;
    }
    
    .btn-large {
      flex: 1;
      min-width: 150px;
      padding: 16px 24px;
      font-size: 16px;
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
    
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }
    
    .empty-icon {
      font-size: 64px;
      margin-bottom: 20px;
    }
    
    .empty-state h3 {
      color: #333;
      margin-bottom: 12px;
      font-size: 24px;
    }
    
    .empty-state p {
      color: #666;
      margin-bottom: 24px;
    }
    
    @media (max-width: 768px) {
      .reserva-card {
        padding: 32px 24px;
      }
      
      .form-row {
        grid-template-columns: 1fr;
      }
      
      .form-actions {
        flex-direction: column;
      }
      
      .btn-large {
        width: 100%;
      }
    }
  `]
})
export class ReservaFormComponent implements OnInit {
  reserva: Reserva = {
    fecha: '',
    horaInicio: '',
    horaFin: '',
    motivo: '',
    auditorio: {} as Auditorio,
    usuario: {} as Usuario
  };
  
  auditorio: Auditorio | null = null;
  loading = false;
  error: string | null = null;
  success: string | null = null;
  minDate: string = '';

  constructor(
    private reservaService: ReservaService,
    private auditorioService: AuditorioService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    const auditorioId = this.route.snapshot.paramMap.get('id');
    if (auditorioId) {
      this.loadAuditorio(Number(auditorioId));
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    this.reserva.usuario = currentUser;
  }

  loadAuditorio(id: number): void {
    this.auditorioService.getAuditorioById(id).subscribe({
      next: (data) => {
        this.auditorio = data;
        this.reserva.auditorio = data;
      },
      error: (err) => {
        this.error = 'Error al cargar el auditorio';
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    if (!this.reserva.fecha || !this.reserva.horaInicio || !this.reserva.horaFin) {
      this.error = 'Por favor completa todos los campos requeridos';
      return;
    }

    if (!this.reserva.auditorio?.id || !this.reserva.usuario?.id) {
      this.error = 'Error: Faltan datos del auditorio o usuario';
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = null;

    // Preparar el objeto para enviar (formato que espera el backend)
    const reservaToSend: ReservaCreateDTO = {
      fecha: this.reserva.fecha,
      horaInicio: this.reserva.horaInicio,
      horaFin: this.reserva.horaFin,
      motivo: this.reserva.motivo,
      auditorioId: this.reserva.auditorio.id!,
      usuarioId: this.reserva.usuario.id!
    };

    this.reservaService.createReserva(reservaToSend).subscribe({
      next: () => {
        this.success = 'Reserva creada exitosamente';
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/reservas']);
        }, 2000);
      },
      error: (err) => {
        // Mejorar el manejo de errores
        let errorMessage = 'Error al crear la reserva';
        if (err.error) {
          if (typeof err.error === 'string') {
            // Si el backend devuelve un string directo (ej: "Error: El auditorio ya está reservado...")
            errorMessage = err.error.replace('Error: ', '');
          } else if (err.error.message) {
            errorMessage = err.error.message;
          } else if (err.error.error) {
            errorMessage = err.error.error;
          }
        } else if (err.message) {
          errorMessage = err.message;
        }
        this.error = errorMessage;
        this.loading = false;
        console.error('Error completo:', err);
      }
    });
  }
}

