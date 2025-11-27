import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservaService } from '../../services/reserva.service';
import { Reserva } from '../../models/reserva.model';

@Component({
  selector: 'app-calendario-auditorio',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="calendario-container">
      <div class="calendario-header">
        <div class="calendario-controls">
          <button class="btn-nav" (click)="previousWeek()">← Atrás</button>
          <button class="btn-nav btn-today" (click)="goToToday()">Hoy</button>
          <button class="btn-nav" (click)="nextWeek()">Siguiente →</button>
        </div>
        <div class="calendario-title">
          <h2>{{ weekRange }}</h2>
        </div>
        <div class="calendario-views">
          <button class="btn-view" [class.active]="view === 'mes'">Mes</button>
          <button class="btn-view active">Semana</button>
          <button class="btn-view" [class.active]="view === 'dia'">Día</button>
        </div>
      </div>
      
      <div class="calendario-grid">
        <div class="calendario-time-column">
          <div class="time-header"></div>
          <div class="time-slot" *ngFor="let hour of hours">
            <span class="time-label">{{ hour }}</span>
          </div>
        </div>
        
        <div class="calendario-days">
          <div class="day-column" *ngFor="let day of weekDays">
            <div class="day-header">
              <div class="day-name">{{ day.name }}</div>
              <div class="day-date">{{ day.date }}</div>
            </div>
            <div class="day-slots">
              <div class="time-slot" 
                   *ngFor="let hour of hours"
                   [class.has-reservation]="hasReservation(day.dateObj, hour)"
                   [style.background-color]="getReservationColor(day.dateObj, hour)"
                   [title]="getReservationTooltip(day.dateObj, hour)">
                <div class="reservation-block" 
                     *ngIf="getReservationAt(day.dateObj, hour)"
                     [class]="'reservation-' + getReservationAt(day.dateObj, hour)?.estado?.toLowerCase()">
                  <span class="reservation-id" *ngIf="getReservationAt(day.dateObj, hour)?.id">
                    {{ getReservationAt(day.dateObj, hour)?.id }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="calendario-legend">
        <div class="legend-item">
          <div class="legend-color" style="background-color: var(--reserva-solicitada);"></div>
          <span>Solicitada/Pendiente</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background-color: var(--reserva-confirmada);"></div>
          <span>Confirmada</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background-color: var(--reserva-rechazada);"></div>
          <span>Rechazada</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .calendario-container {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: var(--shadow-md);
      margin: 20px 0;
    }
    
    .calendario-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }
    
    .calendario-controls {
      display: flex;
      gap: 8px;
    }
    
    .btn-nav {
      padding: 8px 16px;
      border: 1px solid var(--border-color);
      background: white;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      transition: var(--transition);
    }
    
    .btn-nav:hover {
      background: var(--light-bg);
      border-color: var(--primary-color);
    }
    
    .btn-today {
      background: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }
    
    .calendario-title h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: var(--dark-text);
    }
    
    .calendario-views {
      display: flex;
      gap: 4px;
    }
    
    .btn-view {
      padding: 8px 16px;
      border: 1px solid var(--border-color);
      background: white;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      transition: var(--transition);
    }
    
    .btn-view.active {
      background: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }
    
    .calendario-grid {
      display: flex;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
    }
    
    .calendario-time-column {
      width: 80px;
      border-right: 1px solid var(--border-color);
    }
    
    .time-header {
      height: 60px;
      background: var(--light-bg);
      border-bottom: 1px solid var(--border-color);
    }
    
    .time-slot {
      height: 60px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      padding: 0 8px;
      position: relative;
    }
    
    .time-label {
      font-size: 12px;
      color: var(--light-text);
    }
    
    .calendario-days {
      display: flex;
      flex: 1;
    }
    
    .day-column {
      flex: 1;
      border-right: 1px solid var(--border-color);
    }
    
    .day-column:last-child {
      border-right: none;
    }
    
    .day-header {
      height: 60px;
      background: var(--light-bg);
      border-bottom: 1px solid var(--border-color);
      padding: 8px;
      text-align: center;
    }
    
    .day-name {
      font-weight: 600;
      font-size: 14px;
      color: var(--dark-text);
      text-transform: capitalize;
    }
    
    .day-date {
      font-size: 12px;
      color: var(--light-text);
      margin-top: 4px;
    }
    
    .day-slots {
      position: relative;
    }
    
    .day-slots .time-slot {
      border-bottom: 1px solid #f0f0f0;
      background: white;
      position: relative;
    }
    
    .time-slot.has-reservation {
      background-color: var(--reserva-pendiente);
    }
    
    .reservation-block {
      position: absolute;
      left: 0;
      right: 0;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      color: white;
      z-index: 1;
    }
    
    .reservation-solicitada,
    .reservation-pendiente {
      background-color: var(--reserva-solicitada);
    }
    
    .reservation-aprobada,
    .reservation-confirmada {
      background-color: var(--reserva-confirmada);
    }
    
    .reservation-rechazada {
      background-color: var(--reserva-rechazada);
    }
    
    .reservation-cancelada {
      background-color: var(--reserva-cancelada);
    }
    
    .calendario-legend {
      display: flex;
      gap: 24px;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid var(--border-color);
    }
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .legend-color {
      width: 20px;
      height: 20px;
      border-radius: 4px;
    }
    
    @media (max-width: 768px) {
      .calendario-header {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .calendario-grid {
        overflow-x: auto;
      }
      
      .day-column {
        min-width: 120px;
      }
    }
  `]
})
export class CalendarioAuditorioComponent implements OnInit {
  @Input() auditorioId!: number;
  
  currentDate: Date = new Date();
  weekDays: { name: string; date: string; dateObj: Date }[] = [];
  hours: string[] = [];
  reservas: Reserva[] = [];
  view: 'semana' | 'mes' | 'dia' = 'semana';
  
  constructor(private reservaService: ReservaService) {}
  
  ngOnInit() {
    this.initializeHours();
    this.loadReservas();
    this.updateWeekDays();
  }
  
  initializeHours() {
    for (let i = 7; i <= 20; i++) {
      this.hours.push(`${i} a.m.`);
    }
  }
  
  loadReservas() {
    if (this.auditorioId) {
      this.reservaService.getReservasByAuditorio(this.auditorioId).subscribe({
        next: (reservas) => {
          this.reservas = reservas;
        },
        error: (err) => {
          console.error('Error al cargar reservas:', err);
        }
      });
    }
  }
  
  updateWeekDays() {
    const startOfWeek = this.getStartOfWeek(this.currentDate);
    this.weekDays = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      
      const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
      const monthNames = ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'];
      
      this.weekDays.push({
        name: dayNames[date.getDay()],
        date: `${monthNames[date.getMonth()]} ${date.getDate()}`,
        dateObj: date
      });
    }
  }
  
  getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }
  
  get weekRange(): string {
    if (this.weekDays.length === 0) return '';
    const start = this.weekDays[0].dateObj;
    const end = this.weekDays[6].dateObj;
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${monthNames[start.getMonth()]} ${start.getDate()} - ${monthNames[end.getMonth()]} ${end.getDate()}, ${start.getFullYear()}`;
  }
  
  previousWeek() {
    this.currentDate.setDate(this.currentDate.getDate() - 7);
    this.updateWeekDays();
  }
  
  nextWeek() {
    this.currentDate.setDate(this.currentDate.getDate() + 7);
    this.updateWeekDays();
  }
  
  goToToday() {
    this.currentDate = new Date();
    this.updateWeekDays();
  }
  
  hasReservation(date: Date, hour: string): boolean {
    return this.getReservationAt(date, hour) !== null;
  }
  
  getReservationAt(date: Date, hour: string): Reserva | null {
    const hourNum = this.parseHour(hour);
    if (hourNum === -1) return null;
    
    const dateStr = this.formatDate(date);
    
    return this.reservas.find(r => {
      if (!r.fecha) return false;
      const reservaDate = this.formatDate(new Date(r.fecha));
      if (reservaDate !== dateStr) return false;
      
      const inicio = this.parseTime(r.horaInicio);
      const fin = this.parseTime(r.horaFin);
      
      return hourNum >= inicio && hourNum < fin;
    }) || null;
  }
  
  getReservationColor(date: Date, hour: string): string {
    const reserva = this.getReservationAt(date, hour);
    if (!reserva) return 'transparent';
    
    const estado = reserva.estado?.toLowerCase();
    if (estado === 'aprobada' || estado === 'confirmada') {
      return 'var(--reserva-confirmada)';
    } else if (estado === 'solicitada' || estado === 'pendiente') {
      return 'var(--reserva-solicitada)';
    } else if (estado === 'rechazada') {
      return 'var(--reserva-rechazada)';
    }
    return 'transparent';
  }
  
  getReservationTooltip(date: Date, hour: string): string {
    const reserva = this.getReservationAt(date, hour);
    if (!reserva) return '';
    
    return `Reserva ${reserva.estado} - ${reserva.horaInicio} a ${reserva.horaFin}`;
  }
  
  parseHour(hour: string): number {
    const match = hour.match(/(\d+)\s*(a\.m\.|p\.m\.)/);
    if (!match) return -1;
    
    let hourNum = parseInt(match[1]);
    const period = match[2];
    
    if (period === 'p.m.' && hourNum !== 12) {
      hourNum += 12;
    } else if (period === 'a.m.' && hourNum === 12) {
      hourNum = 0;
    }
    
    return hourNum;
  }
  
  parseTime(time: string): number {
    const parts = time.split(':');
    return parseInt(parts[0]);
  }
  
  formatDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}

