package com.universidad.auditorio.dto;

import com.universidad.auditorio.model.EstadoReserva;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * DTO para exponer reservas al frontend con relaciones simplificadas
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservaDTO {
    private Long id;
    private AuditorioSimpleDTO auditorio;
    private UsuarioSimpleDTO usuario;
    private LocalDate fecha;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private String motivo;
    private EstadoReserva estado;
    private String observaciones;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuditorioSimpleDTO {
        private Long id;
        private String nombre;
        private Integer capacidad;
        private String ubicacion;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UsuarioSimpleDTO {
        private Long id;
        private String email;
        private String nombre;
        private String apellido;
        private String rol;
    }
}

