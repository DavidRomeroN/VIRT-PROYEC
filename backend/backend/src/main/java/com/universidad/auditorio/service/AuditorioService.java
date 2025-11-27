package com.universidad.auditorio.service;

import com.universidad.auditorio.dto.AuditorioDTO;
import com.universidad.auditorio.model.Auditorio;
import com.universidad.auditorio.repository.AuditorioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditorioService {

    private final AuditorioRepository auditorioRepository;
    private final S3Service s3Service;
    private final LocalStorageService localStorageService;
    // Eliminamos dependencia directa de FileUrlService para S3, usaremos S3Service

    public List<AuditorioDTO> getAllAuditoriosDTO() {
        return auditorioRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<AuditorioDTO> getAuditoriosActivosDTO() {
        return auditorioRepository.findByActivoTrue().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<AuditorioDTO> getAuditorioDTOById(Long id) {
        return auditorioRepository.findById(id).map(this::toDTO);
    }

    public Optional<Auditorio> getAuditorioById(Long id) {
        return auditorioRepository.findById(id);
    }

    // --- Lógica Crítica: Conversión a DTO con URL firmada ---
    public AuditorioDTO toDTO(Auditorio auditorio) {
        if (auditorio == null) return null;

        AuditorioDTO dto = new AuditorioDTO();
        dto.setId(auditorio.getId());
        dto.setNombre(auditorio.getNombre());
        dto.setCapacidad(auditorio.getCapacidad());
        dto.setDescripcion(auditorio.getDescripcion());
        dto.setUbicacion(auditorio.getUbicacion());
        dto.setActivo(auditorio.getActivo());

        // Generar URL firmada para la imagen
        if (auditorio.getImagenKey() != null) {
            // Intentar obtener URL de S3, si falla (porque es local), construir URL local
            String url = s3Service.getPresignedUrl(auditorio.getImagenKey());
            if (url == null) {
                // Fallback para archivos locales (si no se usa S3)
                url = "http://localhost:8080/" + auditorio.getImagenKey();
            }
            dto.setImagenUrl(url);
        }

        // Generar URL firmada para el video
        if (auditorio.getVideoKey() != null) {
            String url = s3Service.getPresignedUrl(auditorio.getVideoKey());
            if (url == null) {
                url = "http://localhost:8080/" + auditorio.getVideoKey();
            }
            dto.setVideoUrl(url);
        }

        return dto;
    }

    public Auditorio createAuditorio(Auditorio auditorio) {
        if (auditorioRepository.findByNombre(auditorio.getNombre()).isPresent()) {
            throw new RuntimeException("Ya existe un auditorio con el nombre: " + auditorio.getNombre());
        }
        return auditorioRepository.save(auditorio);
    }

    public Auditorio updateAuditorio(Long id, Auditorio auditorioDetails) {
        Auditorio auditorio = auditorioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Auditorio no encontrado"));

        auditorio.setNombre(auditorioDetails.getNombre());
        auditorio.setCapacidad(auditorioDetails.getCapacidad());
        auditorio.setDescripcion(auditorioDetails.getDescripcion());
        auditorio.setUbicacion(auditorioDetails.getUbicacion());
        auditorio.setActivo(auditorioDetails.getActivo());

        return auditorioRepository.save(auditorio);
    }

    public void deleteAuditorio(Long id) {
        Auditorio auditorio = auditorioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Auditorio no encontrado"));

        // Eliminar archivos de S3 antes de borrar el registro
        if (auditorio.getImagenKey() != null) s3Service.deleteFile(auditorio.getImagenKey());
        if (auditorio.getVideoKey() != null) s3Service.deleteFile(auditorio.getVideoKey());

        auditorioRepository.deleteById(id);
    }

    public String uploadImagen(Long auditorioId, MultipartFile file) throws Exception {
        Auditorio auditorio = auditorioRepository.findById(auditorioId)
                .orElseThrow(() -> new RuntimeException("Auditorio no encontrado"));

        String key;
        try {
            // Borrar anterior si existe
            if (auditorio.getImagenKey() != null) s3Service.deleteFile(auditorio.getImagenKey());

            // Subir nueva
            key = s3Service.uploadFile(file, "auditorios/imagenes");
        } catch (Exception e) {
            System.out.println("Fallback a local storage: " + e.getMessage());
            key = localStorageService.uploadFile(file, "auditorios/imagenes");
        }

        auditorio.setImagenKey(key);
        auditorioRepository.save(auditorio);

        // Retornar URL firmada inmediatamente para mostrar en frontend
        return s3Service.getPresignedUrl(key);
    }

    public String uploadVideo(Long auditorioId, MultipartFile file) throws Exception {
        Auditorio auditorio = auditorioRepository.findById(auditorioId)
                .orElseThrow(() -> new RuntimeException("Auditorio no encontrado"));

        String key;
        try {
            if (auditorio.getVideoKey() != null) s3Service.deleteFile(auditorio.getVideoKey());
            key = s3Service.uploadFile(file, "auditorios/videos");
        } catch (Exception e) {
            key = localStorageService.uploadFile(file, "auditorios/videos");
        }

        auditorio.setVideoKey(key);
        auditorioRepository.save(auditorio);
        return s3Service.getPresignedUrl(key);
    }
}