import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auditorio } from '../models/auditorio.model';

@Injectable({
  providedIn: 'root'
})
export class AuditorioService {
  //private apiUrl = 'http://alb-auditorio-1270223617.us-east-1.elb.amazonaws.com/api/auditorios';
    private apiUrl = '/api/auditorios';

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





