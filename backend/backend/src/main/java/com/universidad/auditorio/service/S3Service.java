package com.universidad.auditorio.service;

import com.amazonaws.AmazonServiceException;
import com.amazonaws.HttpMethod;
import com.amazonaws.SdkClientException;
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
    private AmazonS3 amazonS3;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    /**
     * Sube un archivo y retorna la KEY (ruta relativa), no la URL completa.
     */
    public String uploadFile(MultipartFile file, String folder) throws IOException {
        if (amazonS3 == null) {
            throw new IOException("AWS S3 no está configurado (Cliente Nulo)");
        }

        // Generar nombre único: folder/uuid_nombreOriginal
        String fileName = folder + "/" + UUID.randomUUID() + "_" + file.getOriginalFilename();

        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(file.getSize());
        metadata.setContentType(file.getContentType()); // Importante para que el navegador sepa que es imagen/video

        try {
            amazonS3.putObject(new PutObjectRequest(bucketName, fileName, file.getInputStream(), metadata));
            System.out.println(">>> S3 Upload exitoso: " + fileName);
        } catch (AmazonServiceException e) {
            throw new IOException("Error S3: " + e.getMessage(), e);
        } catch (SdkClientException e) {
            throw new IOException("Error conexión AWS: " + e.getMessage(), e);
        }

        return fileName;
    }

    /**
     * Elimina el archivo de S3 usando la Key.
     */
    public void deleteFile(String key) {
        if (amazonS3 == null || key == null || key.isEmpty()) return;
        try {
            amazonS3.deleteObject(bucketName, key);
            System.out.println(">>> S3 Delete exitoso: " + key);
        } catch (Exception e) {
            System.err.println("Error eliminando de S3: " + e.getMessage());
        }
    }

    /**
     * Genera una URL PRESIGNADA (Válida por 1 hora) para ver archivos privados.
     * Esta es la clave para que funcionen los GET.
     */
    public String getPresignedUrl(String key) {
        if (amazonS3 == null || key == null || key.isEmpty()) return null;

        // Si la llave ya parece una URL completa (http...), devolverla tal cual (caso legacy o local)
        if (key.startsWith("http")) return key;

        try {
            // La URL expira en 1 hora
            Date expiration = new Date();
            long expTimeMillis = expiration.getTime();
            expTimeMillis += 1000 * 60 * 60;
            expiration.setTime(expTimeMillis);

            GeneratePresignedUrlRequest generatePresignedUrlRequest =
                    new GeneratePresignedUrlRequest(bucketName, key)
                            .withMethod(HttpMethod.GET)
                            .withExpiration(expiration);

            URL url = amazonS3.generatePresignedUrl(generatePresignedUrlRequest);
            return url.toString();
        } catch (Exception e) {
            System.err.println("Error generando URL presignada: " + e.getMessage());
            return null;
        }
    }
}