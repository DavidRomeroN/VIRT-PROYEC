import { Auditorio } from './auditorio.model';
import { Usuario } from './usuario.model';

export interface Reserva {
  id?: number;
  auditorio?: Auditorio; // Objeto completo cuando viene del backend
  usuario?: Usuario;      // Objeto completo cuando viene del backend
  fecha: string;
  horaInicio: string;
  horaFin: string;
  motivo?: string;
  estado?: 'SOLICITADA' | 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'CANCELADA';
  observaciones?: string;
}

// DTO para crear reserva (solo IDs)
export interface ReservaCreateDTO {
  auditorioId: number;
  usuarioId: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  motivo?: string;
  observaciones?: string;
}

