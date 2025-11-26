package com.universidad.auditorio.service;

import com.universidad.auditorio.model.EstadoReserva;
import com.universidad.auditorio.model.Reserva;
import com.universidad.auditorio.repository.AuditorioRepository;
import com.universidad.auditorio.repository.ReservaRepository;
import com.universidad.auditorio.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final AuditorioRepository auditorioRepository;
    private final UsuarioRepository usuarioRepository;

    public List<Reserva> getAllReservas() {
        return reservaRepository.findAll();
    }

    public List<Reserva> getReservasByAuditorio(Long auditorioId) {
        return reservaRepository.findByAuditorioId(auditorioId);
    }

    public List<Reserva> getReservasByUsuario(Long usuarioId) {
        return reservaRepository.findByUsuarioId(usuarioId);
    }

    public List<Reserva> getReservasByAuditorioAndFecha(Long auditorioId, LocalDate fecha) {
        return reservaRepository.findByAuditorioAndFecha(auditorioId, fecha);
    }

    @Transactional
    public Reserva createReserva(Reserva reserva) {
        // Validar que el auditorio existe
        auditorioRepository.findById(reserva.getAuditorio().getId())
                .orElseThrow(() -> new RuntimeException("Auditorio no encontrado"));
        
        // Validar que el usuario existe
        usuarioRepository.findById(reserva.getUsuario().getId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // Validar que no hay conflictos de horario
        List<Reserva> conflictos = reservaRepository.findConflictingReservas(
                reserva.getAuditorio().getId(),
                reserva.getFecha(),
                reserva.getHoraInicio(),
                reserva.getHoraFin()
        );
        
        if (!conflictos.isEmpty()) {
            throw new RuntimeException("El auditorio ya está reservado en ese horario");
        }
        
        // Validar que la hora de fin es posterior a la hora de inicio
        if (reserva.getHoraFin().isBefore(reserva.getHoraInicio()) || 
            reserva.getHoraFin().equals(reserva.getHoraInicio())) {
            throw new RuntimeException("La hora de fin debe ser posterior a la hora de inicio");
        }
        
        // Validar que la fecha no sea en el pasado
        if (reserva.getFecha().isBefore(LocalDate.now())) {
            throw new RuntimeException("No se pueden hacer reservas en fechas pasadas");
        }
        
        return reservaRepository.save(reserva);
    }

    public Reserva updateReserva(Long id, Reserva reservaDetails) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));
        
        reserva.setFecha(reservaDetails.getFecha());
        reserva.setHoraInicio(reservaDetails.getHoraInicio());
        reserva.setHoraFin(reservaDetails.getHoraFin());
        reserva.setMotivo(reservaDetails.getMotivo());
        reserva.setObservaciones(reservaDetails.getObservaciones());
        
        if (reservaDetails.getEstado() != null) {
            reserva.setEstado(reservaDetails.getEstado());
        }
        
        return reservaRepository.save(reserva);
    }

    public void deleteReserva(Long id) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));
        reserva.setEstado(EstadoReserva.CANCELADA);
        reservaRepository.save(reserva);
    }

    public Reserva cambiarEstadoReserva(Long id, EstadoReserva estado) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));
        reserva.setEstado(estado);
        return reservaRepository.save(reserva);
    }
}





