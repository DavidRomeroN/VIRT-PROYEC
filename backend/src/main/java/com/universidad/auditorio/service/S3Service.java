package com.universidad.auditorio.service;

import com.amazonaws.HttpMethod;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.GeneratePresignedUrlRequest;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URL;
import java.util.Date;
import java.util.UUID;

@Service
public class S3Service {

    @Autowired(required = false)
    private AmazonS3 amazonS3; // Opcional: si no hay S3 configurado, se usará LocalStorageService

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    /**
     * Sube un archivo a S3 directamente desde memoria (sin archivos temporales en disco)
     * Retorna la llave (key) para guardar en BD.
     */
    public String uploadFile(MultipartFile file, String folder) throws IOException {
        if (amazonS3 == null) {
            throw new IllegalStateException("AWS S3 no está configurado");
        }
        
        // Verificar que el bucket existe
        if (!amazonS3.doesBucketExistV2(bucketName)) {
            throw new IllegalStateException("El bucket S3 '" + bucketName + "' no existe");
        }
        
        // 1. Generar nombre único
        String fileName = folder + "/" + UUID.randomUUID() + "_" + file.getOriginalFilename();
        System.out.println("  Subiendo archivo a S3: " + fileName);
        System.out.println("  Bucket: " + bucketName);
        System.out.println("  Tamaño: " + file.getSize() + " bytes");

        // 2. Configurar metadatos (Vital para que el navegador sepa que es una imagen)
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(file.getSize());
        metadata.setContentType(file.getContentType()); // Ej: image/jpeg

        // 3. Subir directamente el InputStream (Más rápido y eficiente)
        try {
            amazonS3.putObject(new PutObjectRequest(bucketName, fileName, file.getInputStream(), metadata));
            System.out.println("  ✓ Archivo subido exitosamente a S3");
        } catch (Exception e) {
            System.err.println("  ✗ Error al subir archivo a S3: " + e.getMessage());
            throw new IOException("Error al subir archivo a S3: " + e.getMessage(), e);
        }

        // Retornar solo la llave (Key)
        return fileName;
    }

    /**
     * NUEVO: Genera una URL temporal válida por X minutos para ver una imagen privada
     * @param key La llave guardada en BD (ej: "auditorios/foto1.jpg")
     * @return URL completa firmada (ej: https://s3.../foto1.jpg?Signature=...)
     */
    public String getPresignedUrl(String key) {
        if (amazonS3 == null) {
            throw new IllegalStateException("AWS S3 no está configurado");
        }
        // Definir expiración (ej: 15 minutos)
        Date expiration = new Date();
        long expTimeMillis = expiration.getTime();
        expTimeMillis += 1000 * 60 * 15; // 15 minutos
        expiration.setTime(expTimeMillis);

        // Generar la URL firmada
        GeneratePresignedUrlRequest generatePresignedUrlRequest =
                new GeneratePresignedUrlRequest(bucketName, key)
                        .withMethod(HttpMethod.GET)
                        .withExpiration(expiration);

        URL url = amazonS3.generatePresignedUrl(generatePresignedUrlRequest);
        return url.toString();
    }

    /**
     * Elimina un archivo de S3 usando su llave
     */
    public void deleteFile(String key) {
        if (amazonS3 == null || key == null || key.isEmpty()) {
            return; // Si S3 no está configurado, no hacer nada
        }
        // Mantenemos tu lógica de limpieza por si acaso viene una URL completa,
        // pero idealmente deberías enviar solo el KEY desde el controller.
        String fileKey = extractKeyFromUrlOrString(key);
        amazonS3.deleteObject(bucketName, fileKey);
    }

    // Método auxiliar para limpiar la llave si por error envían una URL
    private String extractKeyFromUrlOrString(String input) {
        if (input == null || input.isEmpty()) {
            return input;
        }
        
        if (input.contains("http")) {
            // Lógica simple: buscar dónde empieza el nombre del bucket o la carpeta raíz
            // Asumimos que la llave está al final
            int lastSlash = input.lastIndexOf(bucketName);
            if (lastSlash != -1) {
                return input.substring(lastSlash + bucketName.length() + 1);
            }
            // Si es una URL compleja, intentar obtener desde la ruta relativa
            // (Esto depende de tu estructura exacta, pero para keys guardados limpios no hace falta)
        }
        return input;
    }
}

