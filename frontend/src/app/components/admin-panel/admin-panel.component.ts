import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { ReservaService } from '../../services/reserva.service';
import { Reserva } from '../../models/reserva.model';
import { Auditorio } from '../../models/auditorio.model';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-panel-container">
      <div class="admin-header">
        <h1>Panel de Administración</h1>
        <p>Gestiona reservas, auditorios y usuarios del sistema</p>
      </div>

      <div class="admin-tabs">
        <button class="tab-btn" 
                [class.active]="activeTab === 'pendientes'"
                (click)="activeTab = 'pendientes'">
          Reservas Pendientes
        </button>
        <button class="tab-btn" 
                [class.active]="activeTab === 'confirmadas'"
                (click)="activeTab = 'confirmadas'">
          Reservas Confirmadas
        </button>
        <button class="tab-btn" 
                [class.active]="activeTab === 'historial'"
                (click)="activeTab = 'historial'">
          Historial
        </button>
        <button class="tab-btn" 
                [class.active]="activeTab === 'gestionar-auditorios'"
                (click)="activeTab = 'gestionar-auditorios'; loadAuditorios()">
          Gestionar Auditorios
        </button>
        <button class="tab-btn" 
                [class.active]="activeTab === 'auditorios'"
                (click)="activeTab = 'auditorios'">
          Crear Auditorio
        </button>
        <button class="tab-btn" 
                [class.active]="activeTab === 'usuarios'"
                (click)="activeTab = 'usuarios'">
          Crear Usuario
        </button>
      </div>

      <!-- Tab: Reservas Pendientes -->
      <div class="tab-content" *ngIf="activeTab === 'pendientes'">
        <div class="section-header">
          <h2>Reservas Pendientes de Aprobación</h2>
          <div class="filters">
            <select [(ngModel)]="filtroRol" (change)="loadReservasPendientes()">
              <option value="">Todos los roles</option>
              <option value="ESTUDIANTE">Estudiantes</option>
              <option value="PROFESOR">Docentes</option>
            </select>
          </div>
        </div>

        <div *ngIf="loadingPendientes" class="loading-container">
          <div class="spinner"></div>
          <p>Cargando reservas pendientes...</p>
        </div>

        <div *ngIf="!loadingPendientes && reservasPendientes.length === 0" class="empty-state">
          <p>No hay reservas pendientes</p>
        </div>

        <div class="reservas-grid" *ngIf="!loadingPendientes && reservasPendientes.length > 0">
          <div class="reserva-card" *ngFor="let reserva of reservasPendientes">
            <div class="reserva-header">
              <span class="reserva-id">#{{ reserva.id }}</span>
              <span class="reserva-estado" [class]="'estado-' + reserva.estado?.toLowerCase()">
                {{ reserva.estado }}
              </span>
            </div>
            <div class="reserva-info">
              <p><strong>Auditorio:</strong> {{ reserva.auditorio?.nombre }}</p>
              <p><strong>Usuario:</strong> {{ reserva.usuario?.nombre }} {{ reserva.usuario?.apellido }}</p>
              <p><strong>Rol:</strong> {{ reserva.usuario?.rol }}</p>
              <p><strong>Fecha:</strong> {{ reserva.fecha | date:'dd/MM/yyyy' }}</p>
              <p><strong>Horario:</strong> {{ reserva.horaInicio }} - {{ reserva.horaFin }}</p>
              <p *ngIf="reserva.motivo"><strong>Motivo:</strong> {{ reserva.motivo }}</p>
            </div>
            <div class="reserva-actions">
              <button class="btn btn-success" (click)="aprobarReserva(reserva.id!)">
                Aprobar
              </button>
              <button class="btn btn-warning" (click)="ponerEnEspera(reserva.id!)">
                En Espera
              </button>
              <button class="btn btn-danger" (click)="rechazarReserva(reserva.id!)">
                Rechazar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Reservas Confirmadas -->
      <div class="tab-content" *ngIf="activeTab === 'confirmadas'">
        <div class="section-header">
          <h2>Reservas Confirmadas</h2>
        </div>

        <div *ngIf="loadingConfirmadas" class="loading-container">
          <div class="spinner"></div>
          <p>Cargando reservas confirmadas...</p>
        </div>

        <div *ngIf="!loadingConfirmadas && reservasConfirmadas.length === 0" class="empty-state">
          <p>No hay reservas confirmadas</p>
        </div>

        <div class="reservas-grid" *ngIf="!loadingConfirmadas && reservasConfirmadas.length > 0">
          <div class="reserva-card" *ngFor="let reserva of reservasConfirmadas">
            <div class="reserva-header">
              <span class="reserva-id">#{{ reserva.id }}</span>
              <span class="reserva-estado estado-aprobada">CONFIRMADA</span>
            </div>
            <div class="reserva-info">
              <p><strong>Auditorio:</strong> {{ reserva.auditorio?.nombre }}</p>
              <p><strong>Usuario:</strong> {{ reserva.usuario?.nombre }} {{ reserva.usuario?.apellido }}</p>
              <p><strong>Rol:</strong> {{ reserva.usuario?.rol }}</p>
              <p><strong>Fecha:</strong> {{ reserva.fecha | date:'dd/MM/yyyy' }}</p>
              <p><strong>Horario:</strong> {{ reserva.horaInicio }} - {{ reserva.horaFin }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Historial -->
      <div class="tab-content" *ngIf="activeTab === 'historial'">
        <div class="section-header">
          <h2>Historial de Reservas</h2>
          <div class="filters">
            <select [(ngModel)]="filtroRolHistorial" (change)="loadHistorial()">
              <option value="">Todos los roles</option>
              <option value="ESTUDIANTE">Estudiantes</option>
              <option value="PROFESOR">Docentes</option>
            </select>
          </div>
        </div>

        <div *ngIf="loadingHistorial" class="loading-container">
          <div class="spinner"></div>
          <p>Cargando historial...</p>
        </div>

        <div class="reservas-grid" *ngIf="!loadingHistorial && historialReservas.length > 0">
          <div class="reserva-card" *ngFor="let reserva of historialReservas">
            <div class="reserva-header">
              <span class="reserva-id">#{{ reserva.id }}</span>
              <span class="reserva-estado" [class]="'estado-' + reserva.estado?.toLowerCase()">
                {{ reserva.estado }}
              </span>
            </div>
            <div class="reserva-info">
              <p><strong>Auditorio:</strong> {{ reserva.auditorio?.nombre }}</p>
              <p><strong>Usuario:</strong> {{ reserva.usuario?.nombre }} {{ reserva.usuario?.apellido }}</p>
              <p><strong>Rol:</strong> {{ reserva.usuario?.rol }}</p>
              <p><strong>Fecha:</strong> {{ reserva.fecha | date:'dd/MM/yyyy' }}</p>
              <p><strong>Horario:</strong> {{ reserva.horaInicio }} - {{ reserva.horaFin }}</p>
              <p *ngIf="reserva.observaciones"><strong>Observaciones:</strong> {{ reserva.observaciones }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Gestionar Auditorios -->
      <div class="tab-content" *ngIf="activeTab === 'gestionar-auditorios'">
        <div class="section-header">
          <h2>Gestionar Auditorios</h2>
          <button class="btn btn-primary" (click)="mostrarFormularioCrear()">
            + Nuevo Auditorio
          </button>
        </div>

        <div *ngIf="loadingAuditorios" class="loading-container">
          <div class="spinner"></div>
          <p>Cargando auditorios...</p>
        </div>

        <div *ngIf="!loadingAuditorios && auditorios.length === 0" class="empty-state">
          <p>No hay auditorios registrados</p>
        </div>

        <div class="auditorios-grid" *ngIf="!loadingAuditorios && auditorios.length > 0">
          <div class="auditorio-card-admin" *ngFor="let auditorio of auditorios">
            <div class="auditorio-image-container" *ngIf="auditorio.imagenUrl">
              <img [src]="auditorio.imagenUrl" [alt]="auditorio.nombre" (error)="onImageError($event)">
            </div>
            <div class="auditorio-image-placeholder" *ngIf="!auditorio.imagenUrl">
              <span>Sin imagen</span>
            </div>
            <div class="auditorio-content-admin">
              <h3>{{ auditorio.nombre }}</h3>
              <div class="auditorio-info-admin">
                <p><strong>Capacidad:</strong> {{ auditorio.capacidad }} personas</p>
                <p *ngIf="auditorio.ubicacion"><strong>Ubicación:</strong> {{ auditorio.ubicacion }}</p>
                <p *ngIf="auditorio.descripcion"><strong>Descripción:</strong> {{ auditorio.descripcion }}</p>
                <p>
                  <strong>Estado:</strong> 
                  <span [class]="auditorio.activo ? 'estado-activo' : 'estado-inactivo'">
                    {{ auditorio.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </p>
              </div>
              <div class="auditorio-actions-admin">
                <button class="btn btn-primary btn-sm" (click)="editarAuditorio(auditorio)">
                  Editar
                </button>
                <button class="btn btn-danger btn-sm" (click)="eliminarAuditorio(auditorio.id!)">
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Crear/Editar Auditorio -->
      <div class="tab-content" *ngIf="activeTab === 'auditorios'">
        <div class="section-header">
          <h2>{{ editandoAuditorio ? 'Editar Auditorio' : 'Crear Nuevo Auditorio' }}</h2>
        </div>

        <div class="form-container">
          <form (ngSubmit)="crearAuditorio()">
            <div class="form-group">
              <label>Nombre del Auditorio *</label>
              <input type="text" [(ngModel)]="nuevoAuditorio.nombre" name="nombre" required>
            </div>

            <div class="form-group">
              <label>Capacidad *</label>
              <input type="number" [(ngModel)]="nuevoAuditorio.capacidad" name="capacidad" required min="1">
            </div>

            <div class="form-group">
              <label>Ubicación</label>
              <input type="text" [(ngModel)]="nuevoAuditorio.ubicacion" name="ubicacion">
            </div>

            <div class="form-group">
              <label>Descripción</label>
              <textarea [(ngModel)]="nuevoAuditorio.descripcion" name="descripcion" rows="4"></textarea>
            </div>

            <div class="form-group">
              <label>
                <input type="checkbox" [(ngModel)]="nuevoAuditorio.activo" name="activo" [checked]="true">
                Auditorio Activo
              </label>
            </div>

            <div class="form-group">
              <label>Imagen del Auditorio</label>
              <input 
                type="file" 
                accept="image/*" 
                (change)="onImagenAuditorioSelected($event)"
                class="file-input"
              >
              <small>Formatos: JPG, PNG, GIF (máx. 10MB)</small>
              <div *ngIf="previewImagenAuditorio" class="image-preview">
                <img [src]="previewImagenAuditorio" alt="Preview">
                <button type="button" class="btn-remove-image" (click)="removeImagenAuditorio()">×</button>
              </div>
            </div>

            <div class="form-group">
              <label>Video del Auditorio (Opcional)</label>
              <input 
                type="file" 
                accept="video/*" 
                (change)="onVideoAuditorioSelected($event)"
                class="file-input"
              >
              <small>Formatos: MP4, AVI, MOV (máx. 10MB)</small>
              <div *ngIf="previewVideoAuditorio" class="video-preview">
                <video [src]="previewVideoAuditorio" controls></video>
                <button type="button" class="btn-remove-image" (click)="removeVideoAuditorio()">×</button>
              </div>
            </div>

            <div *ngIf="errorCrear" class="alert alert-error">
              {{ errorCrear }}
            </div>

            <div *ngIf="successCrear" class="alert alert-success">
              {{ successCrear }}
            </div>

            <div class="form-actions-auditorio">
              <button type="button" class="btn btn-primary" [disabled]="creando" (click)="guardarAuditorio()">
                {{ creando ? (editandoAuditorio ? 'Actualizando...' : 'Creando...') : (editandoAuditorio ? 'Actualizar Auditorio' : 'Crear Auditorio') }}
              </button>
              <button type="button" class="btn btn-secondary" (click)="cancelarEdicion()" *ngIf="editandoAuditorio">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Tab: Crear Usuario -->
      <div class="tab-content" *ngIf="activeTab === 'usuarios'">
        <div class="section-header">
          <h2>Crear Nuevo Usuario</h2>
        </div>

        <div class="form-container">
          <form (ngSubmit)="crearUsuario()">
            <div class="form-row">
              <div class="form-group">
                <label>Nombre *</label>
                <input type="text" [(ngModel)]="nuevoUsuario.nombre" name="nombre" required>
              </div>

              <div class="form-group">
                <label>Apellido *</label>
                <input type="text" [(ngModel)]="nuevoUsuario.apellido" name="apellido" required>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>DNI (8 dígitos) *</label>
                <input type="text" [(ngModel)]="nuevoUsuario.dni" name="dni" required maxlength="8" pattern="[0-9]{8}">
                <small>8 dígitos numéricos</small>
              </div>

              <div class="form-group">
                <label>Código Universitario (9 dígitos) *</label>
                <input type="text" [(ngModel)]="nuevoUsuario.codigoUniversitario" name="codigoUniversitario" required maxlength="9" pattern="[0-9]{9}">
                <small>9 dígitos numéricos</small>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Ciclo de Estudio *</label>
                <input type="text" [(ngModel)]="nuevoUsuario.cicloEstudio" name="cicloEstudio" required placeholder="2024-1">
                <small>Formato: Año-Semestre (ej: 2024-1, 2024-2)</small>
              </div>

              <div class="form-group">
                <label>Rol *</label>
                <select [(ngModel)]="nuevoUsuario.rol" name="rol" required>
                  <option value="ESTUDIANTE">Estudiante</option>
                  <option value="PROFESOR">Docente</option>
                  <option value="ADMINISTRADOR">Administrador</option>
                </select>
              </div>
            </div>

            <div class="form-row" *ngIf="nuevoUsuario.rol === 'ESTUDIANTE'">
              <div class="form-group">
                <label>Ciclo (1-10)</label>
                <input type="number" [(ngModel)]="nuevoUsuario.ciclo" name="ciclo" min="1" max="10">
              </div>

              <div class="form-group">
                <label>Grupo</label>
                <select [(ngModel)]="nuevoUsuario.grupo" name="grupo">
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="Unico">Único</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Carrera Profesional *</label>
              <input type="text" [(ngModel)]="nuevoUsuario.carreraProfesional" name="carreraProfesional" required>
              <small *ngIf="nuevoUsuario.rol === 'PROFESOR'">Puede separar múltiples carreras con comas</small>
            </div>

            <div class="form-group">
              <label>Imagen de Perfil (Opcional)</label>
              <input 
                type="file" 
                accept="image/*" 
                (change)="onImagenUsuarioSelected($event)"
                class="file-input"
              >
              <small>Formatos: JPG, PNG, GIF (máx. 10MB)</small>
              <div *ngIf="previewImagenUsuario" class="image-preview">
                <img [src]="previewImagenUsuario" alt="Preview">
                <button type="button" class="btn-remove-image" (click)="removeImagenUsuario()">×</button>
              </div>
            </div>

            <div *ngIf="errorCrearUsuario" class="alert alert-error">
              {{ errorCrearUsuario }}
            </div>

            <div *ngIf="successCrearUsuario" class="alert alert-success">
              {{ successCrearUsuario }}
            </div>

            <button type="submit" class="btn btn-primary" [disabled]="creandoUsuario">
              {{ creandoUsuario ? 'Creando...' : 'Crear Usuario' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-panel-container {
      padding: 40px 20px;
      max-width: 1400px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 24px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      margin: 20px;
    }

    .admin-header {
      text-align: center;
      margin-bottom: 40px;
    }

    .admin-header h1 {
      font-size: 36px;
      font-weight: 700;
      color: var(--primary-color);
      margin-bottom: 8px;
    }

    .admin-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 32px;
      flex-wrap: wrap;
      border-bottom: 2px solid var(--border-color);
      padding-bottom: 8px;
    }

    .tab-btn {
      padding: 12px 24px;
      border: none;
      background: transparent;
      border-radius: 8px 8px 0 0;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      color: var(--light-text);
      transition: var(--transition);
    }

    .tab-btn:hover {
      background: var(--light-bg);
      color: var(--primary-color);
    }

    .tab-btn.active {
      background: var(--primary-color);
      color: white;
    }

    .tab-content {
      animation: fadeIn 0.3s ease-out;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .section-header h2 {
      font-size: 24px;
      font-weight: 600;
      color: var(--dark-text);
      margin: 0;
    }

    .filters select {
      padding: 8px 16px;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      font-size: 14px;
    }

    .reservas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
    }

    .reserva-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: var(--shadow-md);
      transition: var(--transition);
    }

    .reserva-card:hover {
      box-shadow: var(--shadow-lg);
      transform: translateY(-2px);
    }

    .reserva-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border-color);
    }

    .reserva-id {
      font-weight: 700;
      color: var(--primary-color);
      font-size: 18px;
    }

    .reserva-estado {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .estado-solicitada,
    .estado-pendiente {
      background: var(--reserva-solicitada);
      color: #856404;
    }

    .estado-aprobada {
      background: var(--reserva-confirmada);
      color: white;
    }

    .estado-rechazada {
      background: var(--reserva-rechazada);
      color: white;
    }

    .reserva-info p {
      margin: 8px 0;
      color: var(--dark-text);
    }

    .reserva-actions {
      display: flex;
      gap: 8px;
      margin-top: 16px;
      flex-wrap: wrap;
    }

    .reserva-actions .btn {
      flex: 1;
      min-width: 100px;
    }

    .form-container {
      background: white;
      border-radius: 12px;
      padding: 32px;
      box-shadow: var(--shadow-md);
      max-width: 600px;
      margin: 0 auto;
    }

    .auditorios-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
      margin-top: 24px;
    }

    .auditorio-card-admin {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: var(--shadow-md);
      transition: var(--transition);
    }

    .auditorio-card-admin:hover {
      box-shadow: var(--shadow-lg);
      transform: translateY(-2px);
    }

    .auditorio-image-container {
      width: 100%;
      height: 200px;
      overflow: hidden;
    }

    .auditorio-image-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .auditorio-image-placeholder {
      width: 100%;
      height: 200px;
      background: var(--light-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--light-text);
    }

    .auditorio-content-admin {
      padding: 20px;
    }

    .auditorio-content-admin h3 {
      margin: 0 0 16px 0;
      color: var(--primary-color);
      font-size: 20px;
    }

    .auditorio-info-admin {
      margin-bottom: 16px;
    }

    .auditorio-info-admin p {
      margin: 8px 0;
      color: var(--dark-text);
      font-size: 14px;
    }

    .estado-activo {
      color: var(--success-color);
      font-weight: 600;
    }

    .estado-inactivo {
      color: var(--danger-color);
      font-weight: 600;
    }

    .auditorio-actions-admin {
      display: flex;
      gap: 8px;
    }

    .btn-sm {
      padding: 8px 16px;
      font-size: 14px;
    }

    .file-input {
      width: 100%;
      padding: 10px;
      border: 2px dashed var(--border-color);
      border-radius: 8px;
      background: var(--light-bg);
      cursor: pointer;
      transition: var(--transition);
    }

    .file-input:hover {
      border-color: var(--primary-color);
      background: rgba(var(--primary-color), 0.05);
    }

    .image-preview, .video-preview {
      position: relative;
      margin-top: 16px;
      border-radius: 8px;
      overflow: hidden;
      border: 2px solid var(--border-color);
    }

    .image-preview img {
      width: 100%;
      max-height: 200px;
      object-fit: cover;
      display: block;
    }

    .video-preview video {
      width: 100%;
      max-height: 200px;
      display: block;
    }

    .btn-remove-image {
      position: absolute;
      top: 8px;
      right: 8px;
      background: var(--danger-color);
      color: white;
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      cursor: pointer;
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: var(--transition);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .btn-remove-image:hover {
      background: #c82333;
      transform: scale(1.1);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    @media (max-width: 768px) {
      .reservas-grid {
        grid-template-columns: 1fr;
      }
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminPanelComponent implements OnInit {
  activeTab: 'pendientes' | 'confirmadas' | 'historial' | 'gestionar-auditorios' | 'auditorios' | 'usuarios' = 'pendientes';
  
  // Auditorios
  auditorios: Auditorio[] = [];
  loadingAuditorios = false;
  auditorioEditando: Auditorio | null = null;
  editandoAuditorio = false;
  
  reservasPendientes: Reserva[] = [];
  reservasConfirmadas: Reserva[] = [];
  historialReservas: Reserva[] = [];
  
  loadingPendientes = false;
  loadingConfirmadas = false;
  loadingHistorial = false;
  
  filtroRol = '';
  filtroRolHistorial = '';
  
  nuevoAuditorio: Partial<Auditorio> = {
    nombre: '',
    capacidad: 0,
    ubicacion: '',
    descripcion: '',
    activo: true
  };
  
  nuevoUsuario: any = {
    nombre: '',
    apellido: '',
    dni: '',
    codigoUniversitario: '',
    cicloEstudio: '',
    rol: 'ESTUDIANTE',
    ciclo: null,
    grupo: '1',
    carreraProfesional: ''
  };
  
  // Archivos seleccionados
  imagenAuditorio: File | null = null;
  videoAuditorio: File | null = null;
  imagenUsuario: File | null = null;
  
  // Preview de imágenes
  previewImagenAuditorio: string | null = null;
  previewVideoAuditorio: string | null = null;
  previewImagenUsuario: string | null = null;
  
  creando = false;
  creandoUsuario = false;
  errorCrear: string | null = null;
  successCrear: string | null = null;
  errorCrearUsuario: string | null = null;
  successCrearUsuario: string | null = null;

  constructor(
    private adminService: AdminService,
    private reservaService: ReservaService
  ) {}

  ngOnInit() {
    this.loadReservasPendientes();
    this.loadReservasConfirmadas();
    this.loadHistorial();
  }

  loadReservasPendientes() {
    this.loadingPendientes = true;
    const obs = this.filtroRol 
      ? this.adminService.getReservasFiltradas(this.filtroRol)
      : this.adminService.getReservasPendientes();
    
    obs.subscribe({
      next: (reservas) => {
        this.reservasPendientes = reservas.filter(r => 
          r.estado === 'SOLICITADA' || r.estado === 'PENDIENTE'
        );
        this.loadingPendientes = false;
      },
      error: (err) => {
        console.error('Error al cargar reservas pendientes:', err);
        this.loadingPendientes = false;
      }
    });
  }

  loadReservasConfirmadas() {
    this.loadingConfirmadas = true;
    this.adminService.getReservasConfirmadas().subscribe({
      next: (reservas) => {
        this.reservasConfirmadas = reservas;
        this.loadingConfirmadas = false;
      },
      error: (err) => {
        console.error('Error al cargar reservas confirmadas:', err);
        this.loadingConfirmadas = false;
      }
    });
  }

  loadHistorial() {
    this.loadingHistorial = true;
    const obs = this.filtroRolHistorial
      ? this.adminService.getReservasFiltradas(this.filtroRolHistorial)
      : this.adminService.getHistorialReservas();
    
    obs.subscribe({
      next: (reservas) => {
        this.historialReservas = reservas;
        this.loadingHistorial = false;
      },
      error: (err) => {
        console.error('Error al cargar historial:', err);
        this.loadingHistorial = false;
      }
    });
  }

  aprobarReserva(id: number) {
    if (confirm('¿Estás seguro de aprobar esta reserva?')) {
      this.adminService.aprobarReserva(id).subscribe({
        next: () => {
          this.loadReservasPendientes();
          this.loadReservasConfirmadas();
          alert('Reserva aprobada exitosamente');
        },
        error: (err) => {
          alert('Error al aprobar la reserva: ' + (err.error || err.message));
        }
      });
    }
  }

  rechazarReserva(id: number) {
    const observaciones = prompt('Ingresa las observaciones (opcional):');
    if (confirm('¿Estás seguro de rechazar esta reserva?')) {
      this.adminService.rechazarReserva(id, observaciones || undefined).subscribe({
        next: () => {
          this.loadReservasPendientes();
          this.loadHistorial();
          alert('Reserva rechazada');
        },
        error: (err) => {
          alert('Error al rechazar la reserva: ' + (err.error || err.message));
        }
      });
    }
  }

  ponerEnEspera(id: number) {
    this.adminService.ponerReservaEnEspera(id).subscribe({
      next: () => {
        this.loadReservasPendientes();
        alert('Reserva puesta en espera');
      },
      error: (err) => {
        alert('Error: ' + (err.error || err.message));
      }
    });
  }

  onImagenAuditorioSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        this.errorCrear = 'La imagen no debe exceder 10MB';
        return;
      }
      this.imagenAuditorio = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewImagenAuditorio = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onVideoAuditorioSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        this.errorCrear = 'El video no debe exceder 10MB';
        return;
      }
      this.videoAuditorio = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewVideoAuditorio = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onImagenUsuarioSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        this.errorCrearUsuario = 'La imagen no debe exceder 10MB';
        return;
      }
      this.imagenUsuario = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewImagenUsuario = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImagenAuditorio() {
    this.imagenAuditorio = null;
    this.previewImagenAuditorio = null;
  }

  removeVideoAuditorio() {
    this.videoAuditorio = null;
    this.previewVideoAuditorio = null;
  }

  removeImagenUsuario() {
    this.imagenUsuario = null;
    this.previewImagenUsuario = null;
  }

  crearAuditorio() {
    this.guardarAuditorio();
  }

  crearUsuario() {
    if (!this.nuevoUsuario.nombre || !this.nuevoUsuario.apellido || 
        !this.nuevoUsuario.dni || !this.nuevoUsuario.codigoUniversitario ||
        !this.nuevoUsuario.cicloEstudio || !this.nuevoUsuario.rol ||
        !this.nuevoUsuario.carreraProfesional) {
      this.errorCrearUsuario = 'Por favor completa todos los campos requeridos';
      return;
    }

    if (this.nuevoUsuario.dni.length !== 8 || !/^\d{8}$/.test(this.nuevoUsuario.dni)) {
      this.errorCrearUsuario = 'El DNI debe tener exactamente 8 dígitos numéricos';
      return;
    }

    if (this.nuevoUsuario.codigoUniversitario.length !== 9 || !/^\d{9}$/.test(this.nuevoUsuario.codigoUniversitario)) {
      this.errorCrearUsuario = 'El código universitario debe tener exactamente 9 dígitos numéricos';
      return;
    }

    this.creandoUsuario = true;
    this.errorCrearUsuario = null;
    this.successCrearUsuario = null;

    // El email se generará automáticamente en el backend
    const usuarioToSend = {
      nombre: this.nuevoUsuario.nombre,
      apellido: this.nuevoUsuario.apellido,
      dni: this.nuevoUsuario.dni,
      codigoUniversitario: this.nuevoUsuario.codigoUniversitario,
      cicloEstudio: this.nuevoUsuario.cicloEstudio,
      rol: this.nuevoUsuario.rol,
      ciclo: this.nuevoUsuario.rol === 'ESTUDIANTE' ? this.nuevoUsuario.ciclo : null,
      grupo: this.nuevoUsuario.rol === 'ESTUDIANTE' ? this.nuevoUsuario.grupo : null,
      carreraProfesional: this.nuevoUsuario.carreraProfesional
    };

    this.adminService.createUsuario(usuarioToSend, this.imagenUsuario || undefined).subscribe({
      next: (usuario) => {
        this.successCrearUsuario = `Usuario creado exitosamente. Email: ${usuario.email}`;
        this.nuevoUsuario = {
          nombre: '',
          apellido: '',
          dni: '',
          codigoUniversitario: '',
          cicloEstudio: '',
          rol: 'ESTUDIANTE',
          ciclo: null,
          grupo: '1',
          carreraProfesional: ''
        };
        this.imagenUsuario = null;
        this.previewImagenUsuario = null;
        this.creandoUsuario = false;
      },
      error: (err) => {
        let errorMsg = 'Error al crear usuario';
        if (err.error) {
          if (typeof err.error === 'string') {
            errorMsg = err.error;
          } else if (err.error.message) {
            errorMsg = err.error.message;
          } else if (err.error.error) {
            errorMsg = err.error.error;
          }
        }
        this.errorCrearUsuario = errorMsg;
        this.creandoUsuario = false;
      }
    });
  }

  // Métodos para gestión de auditorios
  loadAuditorios() {
    this.loadingAuditorios = true;
    this.adminService.getAllAuditorios().subscribe({
      next: (data) => {
        this.auditorios = data;
        this.loadingAuditorios = false;
      },
      error: (err) => {
        console.error('Error al cargar auditorios:', err);
        this.loadingAuditorios = false;
        alert('Error al cargar auditorios: ' + (err.error || err.message));
      }
    });
  }

  mostrarFormularioCrear() {
    this.auditorioEditando = null;
    this.editandoAuditorio = false;
    this.nuevoAuditorio = {
      nombre: '',
      capacidad: 0,
      ubicacion: '',
      descripcion: '',
      activo: true
    };
    this.imagenAuditorio = null;
    this.videoAuditorio = null;
    this.previewImagenAuditorio = null;
    this.previewVideoAuditorio = null;
    this.activeTab = 'auditorios';
  }

  editarAuditorio(auditorio: Auditorio) {
    this.auditorioEditando = { ...auditorio };
    this.editandoAuditorio = true;
    this.nuevoAuditorio = {
      nombre: auditorio.nombre,
      capacidad: auditorio.capacidad,
      ubicacion: auditorio.ubicacion || '',
      descripcion: auditorio.descripcion || '',
      activo: auditorio.activo ?? true
    };
    this.imagenAuditorio = null;
    this.videoAuditorio = null;
    this.previewImagenAuditorio = auditorio.imagenUrl || null;
    this.previewVideoAuditorio = auditorio.videoUrl || null;
    this.activeTab = 'auditorios';
  }

  eliminarAuditorio(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este auditorio? Esta acción no se puede deshacer.')) {
      this.adminService.deleteAuditorio(id).subscribe({
        next: () => {
          alert('Auditorio eliminado exitosamente');
          this.loadAuditorios();
        },
        error: (err) => {
          alert('Error al eliminar auditorio: ' + (err.error || err.message));
        }
      });
    }
  }

  guardarAuditorio() {
    if (!this.nuevoAuditorio.nombre || !this.nuevoAuditorio.capacidad) {
      this.errorCrear = 'Por favor completa todos los campos requeridos';
      return;
    }

    this.creando = true;
    this.errorCrear = null;
    this.successCrear = null;

    if (this.editandoAuditorio && this.auditorioEditando) {
      // Actualizar auditorio existente
      this.adminService.updateAuditorio(
        this.auditorioEditando.id!,
        this.nuevoAuditorio as Auditorio,
        this.imagenAuditorio || undefined,
        this.videoAuditorio || undefined
      ).subscribe({
        next: () => {
          this.successCrear = 'Auditorio actualizado exitosamente';
          this.creando = false;
          this.editandoAuditorio = false;
          this.auditorioEditando = null;
          this.loadAuditorios();
          setTimeout(() => {
            this.activeTab = 'gestionar-auditorios';
          }, 1500);
        },
        error: (err) => {
          this.errorCrear = 'Error al actualizar auditorio: ' + (err.error || err.message);
          this.creando = false;
        }
      });
    } else {
      // Crear nuevo auditorio
      this.adminService.createAuditorio(
        this.nuevoAuditorio as Auditorio,
        this.imagenAuditorio || undefined,
        this.videoAuditorio || undefined
      ).subscribe({
        next: () => {
          this.successCrear = 'Auditorio creado exitosamente';
          this.nuevoAuditorio = {
            nombre: '',
            capacidad: 0,
            ubicacion: '',
            descripcion: '',
            activo: true
          };
          this.imagenAuditorio = null;
          this.videoAuditorio = null;
          this.previewImagenAuditorio = null;
          this.previewVideoAuditorio = null;
          this.creando = false;
          this.loadAuditorios();
          setTimeout(() => {
            this.activeTab = 'gestionar-auditorios';
          }, 1500);
        },
        error: (err) => {
          this.errorCrear = 'Error al crear auditorio: ' + (err.error || err.message);
          this.creando = false;
        }
      });
    }
  }

  cancelarEdicion() {
    this.editandoAuditorio = false;
    this.auditorioEditando = null;
    this.nuevoAuditorio = {
      nombre: '',
      capacidad: 0,
      ubicacion: '',
      descripcion: '',
      activo: true
    };
    this.imagenAuditorio = null;
    this.videoAuditorio = null;
    this.previewImagenAuditorio = null;
    this.previewVideoAuditorio = null;
    this.errorCrear = null;
    this.successCrear = null;
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}

