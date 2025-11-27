package com.universidad.auditorio.controller;

import com.universidad.auditorio.dto.AuditorioDTO;
import com.universidad.auditorio.model.Auditorio;
import com.universidad.auditorio.model.EstadoReserva;
import com.universidad.auditorio.model.Reserva;
import com.universidad.auditorio.model.RolUsuario;
import com.universidad.auditorio.model.Usuario;
import com.universidad.auditorio.service.AuditorioService;
import com.universidad.auditorio.service.ReservaService;
import com.universidad.auditorio.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
// Nota: CORS se maneja globalmente en SecurityConfig
@RequiredArgsConstructor
public class AdminController {

    private final ReservaService reservaService;
    private final AuditorioService auditorioService;
    private final UsuarioService usuarioService;

    /**
     * Obtener todas las reservas pendientes (SOLICITADA y PENDIENTE)
     */
    @GetMapping("/reservas/pendientes")
    public ResponseEntity<List<Reserva>> getReservasPendientes() {
        List<Reserva> todas = reservaService.getAllReservas();
        List<Reserva> pendientes = todas.stream()
                .filter(r -> r.getEstado() == EstadoReserva.SOLICITADA || 
                            r.getEstado() == EstadoReserva.PENDIENTE)
                .collect(Collectors.toList());
        return ResponseEntity.ok(pendientes);
    }

    /**
     * Obtener todas las reservas confirmadas (APROBADA)
     */
    @GetMapping("/reservas/confirmadas")
    public ResponseEntity<List<Reserva>> getReservasConfirmadas() {
        List<Reserva> todas = reservaService.getAllReservas();
        List<Reserva> confirmadas = todas.stream()
                .filter(r -> r.getEstado() == EstadoReserva.APROBADA)
                .collect(Collectors.toList());
        return ResponseEntity.ok(confirmadas);
    }

    /**
     * Aprobar una reserva (cambiar de SOLICITADA/PENDIENTE a APROBADA)
     */
    @PutMapping("/reservas/{id}/aprobar")
    public ResponseEntity<?> aprobarReserva(@PathVariable Long id) {
        try {
            Reserva reserva = reservaService.cambiarEstadoReserva(id, EstadoReserva.APROBADA);
            return ResponseEntity.ok(reserva);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error: " + e.getMessage());
        }
    }

    /**
     * Rechazar una reserva (cambiar a RECHAZADA)
     */
    @PutMapping("/reservas/{id}/rechazar")
    public ResponseEntity<?> rechazarReserva(
            @PathVariable Long id,
            @RequestParam(required = false) String observaciones) {
        try {
            Reserva reserva = reservaService.cambiarEstadoReserva(id, EstadoReserva.RECHAZADA);
            if (observaciones != null && !observaciones.isEmpty()) {
                reserva.setObservaciones(observaciones);
                reservaService.updateReserva(id, reserva);
            }
            return ResponseEntity.ok(reserva);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error: " + e.getMessage());
        }
    }

    /**
     * Cambiar una reserva de SOLICITADA a PENDIENTE (en espera)
     */
    @PutMapping("/reservas/{id}/poner-en-espera")
    public ResponseEntity<?> ponerReservaEnEspera(@PathVariable Long id) {
        try {
            Reserva reserva = reservaService.cambiarEstadoReserva(id, EstadoReserva.PENDIENTE);
            return ResponseEntity.ok(reserva);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error: " + e.getMessage());
        }
    }

    /**
     * Obtener todos los auditorios (solo admin)
     */
    @GetMapping("/auditorios")
    public ResponseEntity<List<AuditorioDTO>> getAllAuditorios() {
        return ResponseEntity.ok(auditorioService.getAllAuditoriosDTO());
    }

    /**
     * Obtener un auditorio por ID (solo admin)
     */
    @GetMapping("/auditorios/{id}")
    public ResponseEntity<AuditorioDTO> getAuditorioById(@PathVariable Long id) {
        return auditorioService.getAuditorioDTOById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Crear un nuevo auditorio (solo admin)
     * Soporta subida de imagen y video
     */
    @PostMapping(value = "/auditorios", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createAuditorio(
            @RequestParam("nombre") String nombre,
            @RequestParam("capacidad") Integer capacidad,
            @RequestParam(value = "descripcion", required = false) String descripcion,
            @RequestParam(value = "ubicacion", required = false) String ubicacion,
            @RequestParam(value = "activo", required = false, defaultValue = "true") Boolean activo,
            @RequestParam(value = "imagen", required = false) MultipartFile imagen,
            @RequestParam(value = "video", required = false) MultipartFile video) {
        try {
            // Crear el auditorio
            Auditorio auditorio = new Auditorio();
            auditorio.setNombre(nombre);
            auditorio.setCapacidad(capacidad);
            auditorio.setDescripcion(descripcion);
            auditorio.setUbicacion(ubicacion);
            auditorio.setActivo(activo);
            
            Auditorio creado = auditorioService.createAuditorio(auditorio);
            
            // Si hay imagen, subirla
            if (imagen != null && !imagen.isEmpty()) {
                auditorioService.uploadImagen(creado.getId(), imagen);
            }
            
            // Si hay video, subirlo
            if (video != null && !video.isEmpty()) {
                auditorioService.uploadVideo(creado.getId(), video);
            }
            
            // Recargar el auditorio para obtener las keys actualizadas
            creado = auditorioService.getAuditorioById(creado.getId())
                    .orElse(creado);
            
            // Retornar DTO con URLs completas
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(auditorioService.toDTO(creado));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al crear auditorio: " + e.getMessage());
        }
    }

    /**
     * Actualizar un auditorio (solo admin)
     * Soporta actualización de imagen y video
     */
    @PutMapping(value = "/auditorios/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateAuditorio(
            @PathVariable Long id,
            @RequestParam("nombre") String nombre,
            @RequestParam("capacidad") Integer capacidad,
            @RequestParam(value = "descripcion", required = false) String descripcion,
            @RequestParam(value = "ubicacion", required = false) String ubicacion,
            @RequestParam(value = "activo", required = false) Boolean activo,
            @RequestParam(value = "imagen", required = false) MultipartFile imagen,
            @RequestParam(value = "video", required = false) MultipartFile video) {
        try {
            // Obtener el auditorio existente
            Auditorio auditorio = auditorioService.getAuditorioById(id)
                    .orElseThrow(() -> new RuntimeException("Auditorio no encontrado"));
            
            // Actualizar campos básicos
            auditorio.setNombre(nombre);
            auditorio.setCapacidad(capacidad);
            auditorio.setDescripcion(descripcion);
            auditorio.setUbicacion(ubicacion);
            if (activo != null) {
                auditorio.setActivo(activo);
            }
            
            // Actualizar el auditorio
            Auditorio actualizado = auditorioService.updateAuditorio(id, auditorio);
            
            // Si hay nueva imagen, subirla
            if (imagen != null && !imagen.isEmpty()) {
                auditorioService.uploadImagen(id, imagen);
            }
            
            // Si hay nuevo video, subirlo
            if (video != null && !video.isEmpty()) {
                auditorioService.uploadVideo(id, video);
            }
            
            // Recargar el auditorio para obtener las keys actualizadas
            actualizado = auditorioService.getAuditorioById(id)
                    .orElse(actualizado);
            
            // Retornar DTO con URLs completas
            return ResponseEntity.ok(auditorioService.toDTO(actualizado));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al actualizar auditorio: " + e.getMessage());
        }
    }

    /**
     * Eliminar un auditorio (solo admin)
     */
    @DeleteMapping("/auditorios/{id}")
    public ResponseEntity<?> deleteAuditorio(@PathVariable Long id) {
        try {
            auditorioService.deleteAuditorio(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Error: " + e.getMessage());
        }
    }

    /**
     * Crear un nuevo usuario (solo admin)
     * El admin puede crear usuarios como estudiante, docente o administrador
     * Soporta subida de imagen de perfil
     */
    @PostMapping(value = "/usuarios", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createUsuario(
            @RequestParam("nombre") String nombre,
            @RequestParam("apellido") String apellido,
            @RequestParam("dni") String dni,
            @RequestParam("codigoUniversitario") String codigoUniversitario,
            @RequestParam("cicloEstudio") String cicloEstudio,
            @RequestParam("rol") String rol,
            @RequestParam(value = "ciclo", required = false) Integer ciclo,
            @RequestParam(value = "grupo", required = false) String grupo,
            @RequestParam(value = "carreraProfesional", required = false) String carreraProfesional,
            @RequestParam(value = "imagen", required = false) MultipartFile imagen) {
        try {
            // Crear el usuario
            Usuario usuario = new Usuario();
            usuario.setNombre(nombre);
            usuario.setApellido(apellido);
            usuario.setDni(dni);
            usuario.setCodigoUniversitario(codigoUniversitario);
            usuario.setCicloEstudio(cicloEstudio);
            usuario.setRol(RolUsuario.valueOf(rol));
            usuario.setCiclo(ciclo);
            usuario.setGrupo(grupo);
            usuario.setCarreraProfesional(carreraProfesional);
            
            Usuario nuevoUsuario = usuarioService.createUsuario(usuario);
            
            // Si hay imagen, subirla
            if (imagen != null && !imagen.isEmpty()) {
                usuarioService.uploadImagen(nuevoUsuario.getId(), imagen);
            }
            
            // Recargar el usuario para obtener la key actualizada
            nuevoUsuario = usuarioService.getUsuarioById(nuevoUsuario.getId())
                    .orElse(nuevoUsuario);
            
            nuevoUsuario.setPassword(null); // No devolver el password
            
            // Construir URL de imagen si existe
            if (nuevoUsuario.getImagenKey() != null) {
                // La imagenUrl se construirá en el frontend o se puede agregar aquí si se crea un DTO
                // Por ahora, el frontend puede construir la URL desde la key
            }
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(nuevoUsuario);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al crear usuario: " + e.getMessage());
        }
    }
    
    /**
     * Endpoint alternativo para crear usuario sin imagen (JSON)
     */
    @PostMapping(value = "/usuarios/json", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createUsuarioJson(@RequestBody Usuario usuario) {
        try {
            Usuario nuevoUsuario = usuarioService.createUsuario(usuario);
            nuevoUsuario.setPassword(null); // No devolver el password
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(nuevoUsuario);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al crear usuario: " + e.getMessage());
        }
    }

    /**
     * Obtener todas las reservas filtradas por rol de usuario
     */
    @GetMapping("/reservas/filtro")
    public ResponseEntity<List<Reserva>> getReservasFiltradas(
            @RequestParam(required = false) RolUsuario rol) {
        List<Reserva> todas = reservaService.getAllReservas();
        
        if (rol != null) {
            List<Reserva> filtradas = todas.stream()
                    .filter(r -> r.getUsuario() != null && 
                                r.getUsuario().getRol() == rol)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(filtradas);
        }
        
        return ResponseEntity.ok(todas);
    }

    /**
     * Obtener historial completo de reservas (todas las reservas realizadas o en curso)
     */
    @GetMapping("/reservas/historial")
    public ResponseEntity<List<Reserva>> getHistorialReservas() {
        List<Reserva> todas = reservaService.getAllReservas();
        // Filtrar solo las que no están canceladas o rechazadas (o incluir todas según necesidad)
        return ResponseEntity.ok(todas);
    }
}

