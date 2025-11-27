export interface Usuario {
  id?: number;
  email: string; // Formato: nombre.apellido (ej: david.romero)
  nombre: string;
  apellido: string;
  password?: string;
  dni?: string; // DNI de 8 dígitos
  codigoUniversitario?: string; // Código universitario de 9 dígitos
  cicloEstudio?: string; // Ejemplo: "2022-1", "2023-2", etc.
  rol?: 'ESTUDIANTE' | 'PROFESOR' | 'ADMINISTRADOR';
  // Campos específicos para ESTUDIANTE
  ciclo?: number; // 1, 2, 3, ..., 10
  grupo?: string; // "1", "2", "3", "Unico"
  carreraProfesional?: string; // Para estudiantes: carrera en la que pertenece. Para docentes: carreras en las que enseña
  imagenKey?: string; // Llave/ruta del archivo de imagen de perfil
  imagenUrl?: string; // URL completa de la imagen de perfil (construida desde imagenKey)
}





