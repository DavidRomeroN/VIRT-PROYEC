import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reserva, ReservaCreateDTO } from '../models/reserva.model';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private apiUrl = 'http://localhost:8080/api/reservas';

  constructor(private http: HttpClient) {}

  getAllReservas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(this.apiUrl);
  }

  getReservasByAuditorio(auditorioId: number): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/auditorio/${auditorioId}`);
  }

  getReservasByUsuario(usuarioId: number): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/usuario/${usuarioId}`);
  }

  getReservasByAuditorioAndFecha(auditorioId: number, fecha: string): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/auditorio/${auditorioId}/fecha?fecha=${fecha}`);
  }

  createReserva(reserva: ReservaCreateDTO): Observable<Reserva> {
    return this.http.post<Reserva>(this.apiUrl, reserva);
  }

  updateReserva(id: number, reserva: Reserva): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.apiUrl}/${id}`, reserva);
  }

  deleteReserva(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

