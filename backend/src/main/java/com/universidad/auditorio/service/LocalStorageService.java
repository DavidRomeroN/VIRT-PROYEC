package com.universidad.auditorio.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Servicio alternativo para almacenamiento local de archivos
 * Úsalo cuando no tengas S3 configurado (desarrollo local)
 */
@Service
public class LocalStorageService {

    @Value("${server.port:8080}")
    private String serverPort;

    private static final String UPLOAD_DIR = "uploads";

    public String uploadFile(MultipartFile file, String folder) throws IOException {
        // Crear directorio si no existe
        String uploadPath = UPLOAD_DIR + File.separator + folder;
        Path uploadDir = Paths.get(uploadPath);
        
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        // Generar nombre único para el archivo
        String originalFilename = file.getOriginalFilename();
        String fileName;
        
        if (originalFilename != null && !originalFilename.isEmpty()) {
            // El nombre original ya incluye la extensión, solo agregamos el UUID
            fileName = UUID.randomUUID().toString() + "_" + originalFilename;
        } else {
            // Si no hay nombre, usar un nombre genérico
            fileName = UUID.randomUUID().toString() + "_file";
        }

        // Guardar archivo
        Path filePath = uploadDir.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Retornar solo la llave/ruta relativa, no la URL completa
        return folder + "/" + fileName;
    }

    /**
     * Elimina un archivo usando su llave
     * @param key La llave del archivo (ej: "auditorios/imagenes/uuid-123_imagen.jpg")
     */
    public void deleteFile(String key) {
        try {
            // Si viene como URL, extraer la llave
            String fileKey = key;
            if (key.contains("http")) {
                // Es una URL, extraer la llave
                int index = key.indexOf("/auditorios/");
                if (index != -1) {
                    fileKey = key.substring(index + 1);
                }
            }
            
            String filePath = UPLOAD_DIR + File.separator + fileKey;
            Path path = Paths.get(filePath);
            if (Files.exists(path)) {
                Files.delete(path);
            }
        } catch (IOException e) {
            // Log error pero no lanzar excepción
            System.err.println("Error al eliminar archivo: " + e.getMessage());
        }
    }
}

