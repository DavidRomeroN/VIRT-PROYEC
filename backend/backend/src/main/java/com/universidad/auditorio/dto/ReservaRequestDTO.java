package com.universidad.auditorio.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * DTO para recibir solicitudes de creación de reservas desde el frontend
 */
@Data
public class ReservaRequestDTO {
    private Long auditorioId;
    private Long usuarioId;
    private LocalDate fecha;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private String motivo;
    private String observaciones;
}





