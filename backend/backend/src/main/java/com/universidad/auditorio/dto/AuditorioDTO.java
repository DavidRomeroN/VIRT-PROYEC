package com.universidad.auditorio.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para exponer el auditorio con URLs completas al frontend
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditorioDTO {
    private Long id;
    private String nombre;
    private Integer capacidad;
    private String descripcion;
    private String ubicacion;
    private String imagenUrl;  // URL completa construida desde la llave
    private String videoUrl;   // URL completa construida desde la llave
    private Boolean activo;
}





