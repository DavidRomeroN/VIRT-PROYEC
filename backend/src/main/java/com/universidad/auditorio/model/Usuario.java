package com.universidad.auditorio.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String email; // Formato: nombre.apellido (ej: david.romero)
    
    @Column(nullable = false)
    private String nombre;
    
    @Column(nullable = false)
    private String apellido;
    
    @Column(nullable = false)
    @JsonIgnore // Nunca serializar el password
    private String password; // DNI hasheado
    
    @Column(name = "dni", nullable = false, unique = true, length = 8)
    private String dni; // DNI de 8 dígitos
    
    @Column(name = "codigo_universitario", nullable = false, unique = true, length = 9)
    private String codigoUniversitario; // Código universitario de 9 dígitos
    
    @Column(name = "ciclo_estudio", nullable = false)
    private String cicloEstudio; // Ejemplo: "2022-1", "2023-2", etc.
    
    @Column(name = "rol")
    @Enumerated(EnumType.STRING)
    private RolUsuario rol = RolUsuario.ESTUDIANTE;
    
    // Campos específicos para ESTUDIANTE
    @Column(name = "ciclo")
    private Integer ciclo; // 1, 2, 3, ..., 10 (solo para estudiantes)
    
    @Column(name = "grupo", length = 10)
    private String grupo; // "1", "2", "3", "Unico" (solo para estudiantes)
    
    @Column(name = "carrera_profesional")
    private String carreraProfesional; // Para estudiantes: carrera en la que pertenece. Para docentes: carreras en las que enseña
    
    @Column(name = "imagen_key")
    private String imagenKey; // Llave/ruta del archivo de imagen de perfil (no URL completa)
    
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore // No serializar la lista de reservas desde Usuario
    private List<Reserva> reservas;
}





