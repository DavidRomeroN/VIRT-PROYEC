package com.universidad.auditorio.controller;

import com.universidad.auditorio.dto.AuditorioDTO;
import com.universidad.auditorio.model.Auditorio;
import com.universidad.auditorio.service.AuditorioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/auditorios")
// Nota: CORS se maneja globalmente en SecurityConfig
@RequiredArgsConstructor
public class AuditorioController {

    private final AuditorioService auditorioService;

    @GetMapping
    public ResponseEntity<List<AuditorioDTO>> getAllAuditorios() {
        return ResponseEntity.ok(auditorioService.getAllAuditoriosDTO());
    }

    @GetMapping("/public")
    public ResponseEntity<List<AuditorioDTO>> getAuditoriosActivos() {
        return ResponseEntity.ok(auditorioService.getAuditoriosActivosDTO());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuditorioDTO> getAuditorioById(@PathVariable Long id) {
        return auditorioService.getAuditorioDTOById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(value = "/con-archivos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createAuditorioConArchivos(
            @RequestParam("nombre") String nombre,
            @RequestParam("capacidad") Integer capacidad,
            @RequestParam(value = "descripcion", required = false) String descripcion,
            @RequestParam(value = "ubicacion", required = false) String ubicacion,
            @RequestParam(value = "activo", required = false, defaultValue = "true") Boolean activo,
            @RequestParam(value = "imagen", required = false) MultipartFile imagen,
            @RequestParam(value = "video", required = false) MultipartFile video) {
        try {
            Auditorio auditorio = new Auditorio();
            auditorio.setNombre(nombre);
            auditorio.setCapacidad(capacidad);
            auditorio.setDescripcion(descripcion);
            auditorio.setUbicacion(ubicacion);
            auditorio.setActivo(activo);

            // 1. Guardar entidad base para tener ID
            Auditorio creado = auditorioService.createAuditorio(auditorio);

            // 2. Subir archivos si existen (esto actualiza las keys en BD)
            if (imagen != null && !imagen.isEmpty()) {
                auditorioService.uploadImagen(creado.getId(), imagen);
            }
            if (video != null && !video.isEmpty()) {
                auditorioService.uploadVideo(creado.getId(), video);
            }

            // 3. Recargar entidad actualizada desde BD
            creado = auditorioService.getAuditorioById(creado.getId()).orElse(creado);

            // 4. Convertir a DTO (AQUÍ SE GENERAN LAS URLS FIRMADAS)
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(auditorioService.toDTO(creado));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @PostMapping(consumes = {"application/json"})
    public ResponseEntity<?> createAuditorio(@RequestBody Auditorio auditorio) {
        try {
            Auditorio creado = auditorioService.createAuditorio(auditorio);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(auditorioService.toDTO(creado));
        } catch (RuntimeException e) {
            // Error de validación (nombre duplicado, etc.)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace(); // Para debugging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al crear auditorio: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Auditorio> updateAuditorio(
            @PathVariable Long id,
            @RequestBody Auditorio auditorio) {
        try {
            return ResponseEntity.ok(auditorioService.updateAuditorio(id, auditorio));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAuditorio(@PathVariable Long id) {
        try {
            auditorioService.deleteAuditorio(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/imagen")
    public ResponseEntity<String> uploadImagen(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        try {
            String url = auditorioService.uploadImagen(id, file);
            return ResponseEntity.ok(url);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al subir imagen: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/video")
    public ResponseEntity<String> uploadVideo(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        try {
            String url = auditorioService.uploadVideo(id, file);
            return ResponseEntity.ok(url);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al subir video: " + e.getMessage());
        }
    }
}

