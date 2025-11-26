export interface Usuario {
  id?: number;
  email: string;
  nombre: string;
  apellido: string;
  password?: string;
  rol?: 'ESTUDIANTE' | 'PROFESOR' | 'ADMINISTRADOR';
}





