package com.universidad.auditorio.repository;

import com.universidad.auditorio.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {
    List<Reserva> findByAuditorioId(Long auditorioId);
    List<Reserva> findByUsuarioId(Long usuarioId);
    
    @Query("SELECT r FROM Reserva r WHERE r.auditorio.id = :auditorioId " +
           "AND r.fecha = :fecha " +
           "AND r.estado != 'CANCELADA' " +
           "AND ((r.horaInicio <= :horaInicio AND r.horaFin > :horaInicio) OR " +
           "(r.horaInicio < :horaFin AND r.horaFin >= :horaFin) OR " +
           "(r.horaInicio >= :horaInicio AND r.horaFin <= :horaFin))")
    List<Reserva> findConflictingReservas(
        @Param("auditorioId") Long auditorioId,
        @Param("fecha") LocalDate fecha,
        @Param("horaInicio") LocalTime horaInicio,
        @Param("horaFin") LocalTime horaFin
    );
    
    @Query("SELECT r FROM Reserva r WHERE r.auditorio.id = :auditorioId AND r.fecha = :fecha")
    List<Reserva> findByAuditorioAndFecha(@Param("auditorioId") Long auditorioId, @Param("fecha") LocalDate fecha);
}





