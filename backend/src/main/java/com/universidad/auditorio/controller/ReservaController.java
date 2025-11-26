package com.universidad.auditorio.controller;

import com.universidad.auditorio.dto.ReservaRequestDTO;
import com.universidad.auditorio.model.Auditorio;
import com.universidad.auditorio.model.EstadoReserva;
import com.universidad.auditorio.model.Reserva;
import com.universidad.auditorio.model.Usuario;
import com.universidad.auditorio.service.ReservaService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reservas")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ReservaController {

    private final ReservaService reservaService;

    @GetMapping
    public ResponseEntity<List<Reserva>> getAllReservas() {
        return ResponseEntity.ok(reservaService.getAllReservas());
    }

    @GetMapping("/auditorio/{auditorioId}")
    public ResponseEntity<List<Reserva>> getReservasByAuditorio(@PathVariable Long auditorioId) {
        return ResponseEntity.ok(reservaService.getReservasByAuditorio(auditorioId));
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Reserva>> getReservasByUsuario(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(reservaService.getReservasByUsuario(usuarioId));
    }

    @GetMapping("/auditorio/{auditorioId}/fecha")
    public ResponseEntity<List<Reserva>> getReservasByAuditorioAndFecha(
            @PathVariable Long auditorioId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return ResponseEntity.ok(reservaService.getReservasByAuditorioAndFecha(auditorioId, fecha));
    }

    @PostMapping
    public ResponseEntity<?> createReserva(@RequestBody ReservaRequestDTO request) {
        try {
            // Convertir DTO a entidad Reserva
            Reserva reserva = new Reserva();
            Auditorio auditorio = new Auditorio();
            auditorio.setId(request.getAuditorioId());
            reserva.setAuditorio(auditorio);
            
            Usuario usuario = new Usuario();
            usuario.setId(request.getUsuarioId());
            reserva.setUsuario(usuario);
            
            reserva.setFecha(request.getFecha());
            reserva.setHoraInicio(request.getHoraInicio());
            reserva.setHoraFin(request.getHoraFin());
            reserva.setMotivo(request.getMotivo());
            reserva.setObservaciones(request.getObservaciones());
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(reservaService.createReserva(reserva));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateReserva(
            @PathVariable Long id,
            @RequestBody Reserva reserva) {
        try {
            return ResponseEntity.ok(reservaService.updateReserva(id, reserva));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstadoReserva(
            @PathVariable Long id,
            @RequestParam EstadoReserva estado) {
        try {
            return ResponseEntity.ok(reservaService.cambiarEstadoReserva(id, estado));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReserva(@PathVariable Long id) {
        try {
            reservaService.deleteReserva(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

