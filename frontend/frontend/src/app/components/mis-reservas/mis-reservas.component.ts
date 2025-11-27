import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReservaService } from '../../services/reserva.service';
import { AuthService } from '../../services/auth.service';
import { Reserva } from '../../models/reserva.model';

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <h2>Mis Reservas</h2>

      <div *ngIf="!isLoggedIn" class="alert alert-error">
        Debes iniciar sesión para ver tus reservas.
        <a routerLink="/login">Iniciar Sesión</a>
      </div>

      <div *ngIf="loading" class="loading">Cargando reservas...</div>

      <div *ngIf="error" class="alert alert-error">{{ error }}</div>

      <div *ngIf="!loading && !error && isLoggedIn">
        <div *ngIf="reservas.length === 0" class="alert">
          No tienes reservas registradas.
          <a routerLink="/auditorios">Ver Auditorios</a>
        </div>

        <div class="reservas-list" *ngIf="reservas.length > 0">
          <div class="card reserva-card" *ngFor="let reserva of reservas">
            <div class="reserva-header">
              <h3>{{ reserva.auditorio?.nombre || 'Auditorio' }}</h3>
              <span class="badge" [ngClass]="getEstadoClass(reserva.estado)">
                {{ reserva.estado || 'PENDIENTE' }}
              </span>
            </div>
            <div class="reserva-details">
              <p><strong>Fecha:</strong> {{ formatDate(reserva.fecha) }}</p>
              <p><strong>Hora:</strong> {{ formatTime(reserva.horaInicio) }} - {{ formatTime(reserva.horaFin) }}</p>
              <p *ngIf="reserva.motivo"><strong>Motivo:</strong> {{ reserva.motivo }}</p>
              <p *ngIf="reserva.observaciones"><strong>Observaciones:</strong> {{ reserva.observaciones }}</p>
            </div>
            <div class="reserva-actions">
              <button class="btn btn-danger" (click)="cancelarReserva(reserva.id!)" 
                      *ngIf="reserva.estado !== 'CANCELADA'">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 24px;
      padding: 40px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      margin: 20px;
    }
    
    h2 {
      color: var(--primary-color);
      margin-bottom: 30px;
      font-size: 36px;
      text-align: center;
      font-weight: 700;
    }
    .reservas-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .reserva-card {
      border-left: 4px solid #667eea;
    }
    .reserva-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }
    .reserva-header h3 {
      color: #667eea;
      margin: 0;
    }
    .badge {
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge.PENDIENTE {
      background: #ffc107;
      color: #000;
    }
    .badge.APROBADA {
      background: #28a745;
      color: white;
    }
    .badge.RECHAZADA {
      background: #dc3545;
      color: white;
    }
    .badge.CANCELADA {
      background: #6c757d;
      color: white;
    }
    .reserva-details {
      margin-bottom: 15px;
    }
    .reserva-details p {
      margin-bottom: 8px;
      color: #666;
    }
    .reserva-actions {
      margin-top: 15px;
    }
  `]
})
export class MisReservasComponent implements OnInit {
  reservas: Reserva[] = [];
  loading = true;
  error: string | null = null;
  isLoggedIn = false;

  constructor(
    private reservaService: ReservaService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.loadReservas();
    } else {
      this.loading = false;
    }
  }

  loadReservas(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      this.error = 'Usuario no encontrado';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.reservaService.getReservasByUsuario(currentUser.id).subscribe({
      next: (data) => {
        this.reservas = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar las reservas';
        this.loading = false;
        console.error(err);
      }
    });
  }

  cancelarReserva(id: number): void {
    if (confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      this.reservaService.deleteReserva(id).subscribe({
        next: () => {
          this.loadReservas();
        },
        error: (err) => {
          this.error = 'Error al cancelar la reserva';
          console.error(err);
        }
      });
    }
  }

  getEstadoClass(estado?: string): string {
    return estado || 'PENDIENTE';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    } catch {
      return dateString;
    }
  }

  formatTime(timeString: string): string {
    if (!timeString) return '';
    // Si viene en formato HH:mm:ss, tomar solo HH:mm
    if (timeString.includes(':')) {
      return timeString.substring(0, 5);
    }
    return timeString;
  }
}

