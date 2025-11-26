package com.universidad.auditorio.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "auditorios")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Auditorio {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String nombre;
    
    @Column(nullable = false)
    private Integer capacidad;
    
    @Column(length = 1000)
    private String descripcion;
    
    @Column(name = "ubicacion")
    private String ubicacion;
    
    @Column(name = "imagen_key")
    private String imagenKey; // Llave/ruta del archivo (no URL completa)
    
    @Column(name = "video_key")
    private String videoKey; // Llave/ruta del archivo (no URL completa)
    
    @Column(name = "activo")
    private Boolean activo = true;
    
    @OneToMany(mappedBy = "auditorio", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"auditorio", "usuario"}) // Evitar serialización circular
    private List<Reserva> reservas;
}

