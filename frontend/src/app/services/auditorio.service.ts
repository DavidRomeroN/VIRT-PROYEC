import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auditorio } from '../models/auditorio.model';

@Injectable({
  providedIn: 'root'
})
export class AuditorioService {
  private apiUrl = 'http://localhost:8080/api/auditorios';

  constructor(private http: HttpClient) {}

  getAllAuditorios(): Observable<Auditorio[]> {
    return this.http.get<Auditorio[]>(this.apiUrl);
  }

  getAuditoriosActivos(): Observable<Auditorio[]> {
    return this.http.get<Auditorio[]>(`${this.apiUrl}/public`);
  }

  getAuditorioById(id: number): Observable<Auditorio> {
    return this.http.get<Auditorio>(`${this.apiUrl}/${id}`);
  }
}





