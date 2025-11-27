import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reserva } from '../models/reserva.model';
import { Auditorio } from '../models/auditorio.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  getReservasPendientes(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/reservas/pendientes`);
  }

  getReservasConfirmadas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/reservas/confirmadas`);
  }

  aprobarReserva(id: number): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.apiUrl}/reservas/${id}/aprobar`, {});
  }

  rechazarReserva(id: number, observaciones?: string): Observable<Reserva> {
    const url = observaciones 
      ? `${this.apiUrl}/reservas/${id}/rechazar?observaciones=${encodeURIComponent(observaciones)}`
      : `${this.apiUrl}/reservas/${id}/rechazar`;
    return this.http.put<Reserva>(url, {});
  }

  ponerReservaEnEspera(id: number): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.apiUrl}/reservas/${id}/poner-en-espera`, {});
  }

  getReservasFiltradas(rol?: string): Observable<Reserva[]> {
    let params = new HttpParams();
    if (rol) {
      params = params.set('rol', rol);
    }
    return this.http.get<Reserva[]>(`${this.apiUrl}/reservas/filtro`, { params });
  }

  getHistorialReservas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/reservas/historial`);
  }

  createAuditorio(auditorio: Auditorio, imagen?: File, video?: File): Observable<Auditorio> {
    const formData = new FormData();
    formData.append('nombre', auditorio.nombre || '');
    formData.append('capacidad', auditorio.capacidad?.toString() || '0');
    if (auditorio.descripcion) formData.append('descripcion', auditorio.descripcion);
    if (auditorio.ubicacion) formData.append('ubicacion', auditorio.ubicacion);
    formData.append('activo', (auditorio.activo ?? true).toString());
    
    if (imagen) {
      formData.append('imagen', imagen);
    }
    if (video) {
      formData.append('video', video);
    }
    
    return this.http.post<Auditorio>(`${this.apiUrl}/auditorios`, formData);
  }

  createUsuario(usuario: any, imagen?: File): Observable<any> {
    const formData = new FormData();
    formData.append('nombre', usuario.nombre || '');
    formData.append('apellido', usuario.apellido || '');
    formData.append('dni', usuario.dni || '');
    formData.append('codigoUniversitario', usuario.codigoUniversitario || '');
    formData.append('cicloEstudio', usuario.cicloEstudio || '');
    formData.append('rol', usuario.rol || 'ESTUDIANTE');
    
    if (usuario.ciclo) formData.append('ciclo', usuario.ciclo.toString());
    if (usuario.grupo) formData.append('grupo', usuario.grupo);
    if (usuario.carreraProfesional) formData.append('carreraProfesional', usuario.carreraProfesional);
    
    if (imagen) {
      formData.append('imagen', imagen);
    }
    
    return this.http.post<any>(`${this.apiUrl}/usuarios`, formData);
  }

  // CRUD de Auditorios
  getAllAuditorios(): Observable<Auditorio[]> {
    return this.http.get<Auditorio[]>(`${this.apiUrl}/auditorios`);
  }

  getAuditorioById(id: number): Observable<Auditorio> {
    return this.http.get<Auditorio>(`${this.apiUrl}/auditorios/${id}`);
  }

  updateAuditorio(id: number, auditorio: Auditorio, imagen?: File, video?: File): Observable<Auditorio> {
    const formData = new FormData();
    formData.append('nombre', auditorio.nombre || '');
    formData.append('capacidad', auditorio.capacidad?.toString() || '0');
    if (auditorio.descripcion) formData.append('descripcion', auditorio.descripcion);
    if (auditorio.ubicacion) formData.append('ubicacion', auditorio.ubicacion);
    formData.append('activo', (auditorio.activo ?? true).toString());
    
    if (imagen) {
      formData.append('imagen', imagen);
    }
    if (video) {
      formData.append('video', video);
    }
    
    return this.http.put<Auditorio>(`${this.apiUrl}/auditorios/${id}`, formData);
  }

  deleteAuditorio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/auditorios/${id}`);
  }
}

