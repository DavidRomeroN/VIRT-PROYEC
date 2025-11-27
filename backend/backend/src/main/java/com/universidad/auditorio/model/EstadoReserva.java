package com.universidad.auditorio.model;

public enum EstadoReserva {
    SOLICITADA,    // Estado 1: Cuando el usuario solicita la reserva
    PENDIENTE,     // Estado 2: Cuando está en espera de aprobación
    APROBADA,      // Estado 3: Cuando el admin confirma la reserva
    RECHAZADA,     // Estado 3: Cuando el admin rechaza la reserva
    CANCELADA      // Estado 3: Cuando se cancela la reserva
}





