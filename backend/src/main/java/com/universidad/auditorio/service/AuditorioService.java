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
    private final FileUrlService fileUrlService;

    public List<Auditorio> getAllAuditorios() {
        return auditorioRepository.findAll();
    }

    public List<Auditorio> getAuditoriosActivos() {
        return auditorioRepository.findByActivoTrue();
    }

    public Optional<Auditorio> getAuditorioById(Long id) {
        return auditorioRepository.findById(id);
    }

    /**
     * Convierte un Auditorio a DTO con URLs completas
     */
    public AuditorioDTO toDTO(Auditorio auditorio) {
        if (auditorio == null) {
            return null;
        }
        AuditorioDTO dto = new AuditorioDTO();
        dto.setId(auditorio.getId());
        dto.setNombre(auditorio.getNombre());
        dto.setCapacidad(auditorio.getCapacidad());
        dto.setDescripcion(auditorio.getDescripcion());
        dto.setUbicacion(auditorio.getUbicacion());
        dto.setActivo(auditorio.getActivo());
        // Construir URLs completas desde las llaves (manejar nulls)
        dto.setImagenUrl(auditorio.getImagenKey() != null ? 
            fileUrlService.buildUrl(auditorio.getImagenKey()) : null);
        dto.setVideoUrl(auditorio.getVideoKey() != null ? 
            fileUrlService.buildUrl(auditorio.getVideoKey()) : null);
        return dto;
    }

    /**
     * Obtiene un auditorio con URLs completas
     */
    public Optional<AuditorioDTO> getAuditorioDTOById(Long id) {
        return auditorioRepository.findById(id)
                .map(this::toDTO);
    }

    /**
     * Obtiene todos los auditorios con URLs completas
     */
    public List<AuditorioDTO> getAllAuditoriosDTO() {
        return auditorioRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene auditorios activos con URLs completas
     */
    public List<AuditorioDTO> getAuditoriosActivosDTO() {
        return auditorioRepository.findByActivoTrue().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Auditorio createAuditorio(Auditorio auditorio) {
        // Verificar si ya existe un auditorio con el mismo nombre
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
        
        // Si se envía una URL, extraer la llave antes de guardar
        if (auditorioDetails.getImagenKey() != null) {
            auditorio.setImagenKey(fileUrlService.extractKey(auditorioDetails.getImagenKey()));
        }
        if (auditorioDetails.getVideoKey() != null) {
            auditorio.setVideoKey(fileUrlService.extractKey(auditorioDetails.getVideoKey()));
        }
        
        return auditorioRepository.save(auditorio);
    }

    public void deleteAuditorio(Long id) {
        auditorioRepository.deleteById(id);
    }

    public String uploadImagen(Long auditorioId, MultipartFile file) throws Exception {
        Auditorio auditorio = auditorioRepository.findById(auditorioId)
                .orElseThrow(() -> new RuntimeException("Auditorio no encontrado"));
        
        String key; // Guardar solo la llave, no la URL completa
        
        // Intentar usar S3, si falla usar almacenamiento local
        try {
            System.out.println("Intentando subir imagen a S3...");
            // Eliminar imagen anterior si existe
            if (auditorio.getImagenKey() != null) {
                s3Service.deleteFile(auditorio.getImagenKey());
            }
            key = s3Service.uploadFile(file, "auditorios/imagenes");
            System.out.println("✓ Imagen subida exitosamente a S3 con key: " + key);
        } catch (Exception e) {
            // S3 no está configurado o hay error, usar almacenamiento local
            System.err.println("✗ Error al subir a S3: " + e.getMessage());
            System.err.println("  Causa: " + (e.getCause() != null ? e.getCause().getMessage() : "N/A"));
            e.printStackTrace();
            System.out.println("Usando almacenamiento local como fallback...");
            if (auditorio.getImagenKey() != null) {
                localStorageService.deleteFile(auditorio.getImagenKey());
            }
            key = localStorageService.uploadFile(file, "auditorios/imagenes");
            System.out.println("✓ Imagen guardada localmente con key: " + key);
        }
        
        // Guardar solo la llave en la BD
        auditorio.setImagenKey(key);
        auditorioRepository.save(auditorio);
        
        // Retornar URL completa para el frontend
        return fileUrlService.buildUrl(key);
    }

    public String uploadVideo(Long auditorioId, MultipartFile file) throws Exception {
        Auditorio auditorio = auditorioRepository.findById(auditorioId)
                .orElseThrow(() -> new RuntimeException("Auditorio no encontrado"));
        
        String key; // Guardar solo la llave, no la URL completa
        
        // Intentar usar S3, si falla usar almacenamiento local
        try {
            System.out.println("Intentando subir video a S3...");
            // Eliminar video anterior si existe
            if (auditorio.getVideoKey() != null) {
                s3Service.deleteFile(auditorio.getVideoKey());
            }
            key = s3Service.uploadFile(file, "auditorios/videos");
            System.out.println("✓ Video subido exitosamente a S3 con key: " + key);
        } catch (Exception e) {
            // S3 no está configurado o hay error, usar almacenamiento local
            System.err.println("✗ Error al subir a S3: " + e.getMessage());
            System.err.println("  Causa: " + (e.getCause() != null ? e.getCause().getMessage() : "N/A"));
            e.printStackTrace();
            System.out.println("Usando almacenamiento local como fallback...");
            if (auditorio.getVideoKey() != null) {
                localStorageService.deleteFile(auditorio.getVideoKey());
            }
            key = localStorageService.uploadFile(file, "auditorios/videos");
            System.out.println("✓ Video guardado localmente con key: " + key);
        }
        
        // Guardar solo la llave en la BD
        auditorio.setVideoKey(key);
        auditorioRepository.save(auditorio);
        
        // Retornar URL completa para el frontend
        return fileUrlService.buildUrl(key);
    }
}

