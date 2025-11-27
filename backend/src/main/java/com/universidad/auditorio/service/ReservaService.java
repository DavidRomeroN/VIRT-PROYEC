package com.universidad.auditorio.service;

import com.universidad.auditorio.dto.ReservaDTO;
import com.universidad.auditorio.model.EstadoReserva;
import com.universidad.auditorio.model.Reserva;
import com.universidad.auditorio.model.RolUsuario;
import com.universidad.auditorio.repository.AuditorioRepository;
import com.universidad.auditorio.repository.ReservaRepository;
import com.universidad.auditorio.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final AuditorioRepository auditorioRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public List<Reserva> getAllReservas() {
        return reservaRepository.findAllWithRelations();
    }

    @Transactional(readOnly = true)
    public List<Reserva> getReservasByEstado(EstadoReserva estado) {
        return reservaRepository.findAllWithRelations().stream()
                .filter(r -> r.getEstado() == estado)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Reserva> getReservasByRolUsuario(RolUsuario rol) {
        return reservaRepository.findAllWithRelations().stream()
                .filter(r -> r.getUsuario() != null && r.getUsuario().getRol() == rol)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Reserva> getReservasByAuditorio(Long auditorioId) {
        return reservaRepository.findByAuditorioId(auditorioId);
    }

    @Transactional(readOnly = true)
    public List<Reserva> getReservasByUsuario(Long usuarioId) {
        // Verificar que el usuario existe
        if (!usuarioRepository.existsById(usuarioId)) {
            return new ArrayList<>(); // Retornar lista vacía si el usuario no existe
        }
        
        // Obtener reservas (las relaciones se cargarán automáticamente con EAGER)
        List<Reserva> reservas = reservaRepository.findByUsuarioId(usuarioId);
        
        // Filtrar reservas con relaciones válidas
        List<Reserva> reservasValidas = new ArrayList<>();
        for (Reserva r : reservas) {
            try {
                // Verificar que las relaciones estén cargadas y sean válidas
                if (r.getAuditorio() != null && r.getUsuario() != null) {
                    // Acceder a propiedades para forzar carga (si es necesario)
                    Long auditorioId = r.getAuditorio().getId();
                    Long usuarioIdFromReserva = r.getUsuario().getId();
                    
                    if (auditorioId != null && usuarioIdFromReserva != null) {
                        reservasValidas.add(r);
                    }
                }
            } catch (Exception e) {
                // Ignorar reservas con problemas de carga
                System.err.println("Advertencia: Reserva con ID " + (r != null ? r.getId() : "null") + 
                                 " tiene relaciones inválidas: " + e.getMessage());
            }
        }
        return reservasValidas;
    }

    /**
     * Convierte una Reserva a DTO para evitar problemas de serialización
     */
    public ReservaDTO toDTO(Reserva reserva) {
        if (reserva == null) {
            return null;
        }
        
        ReservaDTO dto = new ReservaDTO();
        dto.setId(reserva.getId());
        dto.setFecha(reserva.getFecha());
        dto.setHoraInicio(reserva.getHoraInicio());
        dto.setHoraFin(reserva.getHoraFin());
        dto.setMotivo(reserva.getMotivo());
        dto.setEstado(reserva.getEstado());
        dto.setObservaciones(reserva.getObservaciones());
        
        // Convertir auditorio
        if (reserva.getAuditorio() != null) {
            ReservaDTO.AuditorioSimpleDTO auditorioDTO = new ReservaDTO.AuditorioSimpleDTO();
            auditorioDTO.setId(reserva.getAuditorio().getId());
            auditorioDTO.setNombre(reserva.getAuditorio().getNombre());
            auditorioDTO.setCapacidad(reserva.getAuditorio().getCapacidad());
            auditorioDTO.setUbicacion(reserva.getAuditorio().getUbicacion());
            dto.setAuditorio(auditorioDTO);
        }
        
        // Convertir usuario
        if (reserva.getUsuario() != null) {
            ReservaDTO.UsuarioSimpleDTO usuarioDTO = new ReservaDTO.UsuarioSimpleDTO();
            usuarioDTO.setId(reserva.getUsuario().getId());
            usuarioDTO.setEmail(reserva.getUsuario().getEmail());
            usuarioDTO.setNombre(reserva.getUsuario().getNombre());
            usuarioDTO.setApellido(reserva.getUsuario().getApellido());
            usuarioDTO.setRol(reserva.getUsuario().getRol() != null ? reserva.getUsuario().getRol().name() : null);
            dto.setUsuario(usuarioDTO);
        }
        
        return dto;
    }

    @Transactional(readOnly = true)
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
        
        // Las nuevas reservas empiezan en estado SOLICITADA
        if (reserva.getEstado() == null) {
            reserva.setEstado(EstadoReserva.SOLICITADA);
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





