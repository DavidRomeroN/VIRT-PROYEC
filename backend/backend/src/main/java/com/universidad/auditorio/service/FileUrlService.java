package com.universidad.auditorio.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Servicio para construir URLs completas a partir de las llaves almacenadas en BD
 */
@Service
public class FileUrlService {

    @Value("${cloudfront.distribution-domain:}")
    private String cloudfrontDomain;

    @Value("${aws.s3.bucket-name:}")
    private String bucketName;

    @Value("${aws.s3.region:us-east-1}")
    private String region;

    @Value("${server.port:8080}")
    private String serverPort;

    /**
     * Construye la URL completa a partir de la llave almacenada
     * @param key La llave/ruta del archivo (ej: auditorios/imagenes/uuid-123_imagen.jpg)
     * @return URL completa para acceder al archivo
     */
    public String buildUrl(String key) {
        if (key == null || key.isEmpty()) {
            return null;
        }

        // Si hay CloudFront configurado, usar esa URL
        if (!cloudfrontDomain.isEmpty()) {
            return "https://" + cloudfrontDomain + "/" + key;
        }

        // Si hay bucket S3 configurado, construir URL de S3
        if (!bucketName.isEmpty()) {
            return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, key);
        }

        // Si no hay S3, asumir almacenamiento local
        return "http://localhost:" + serverPort + "/" + key;
    }

    /**
     * Extrae la llave de una URL (útil para migración o conversión)
     * @param url URL completa del archivo
     * @return La llave extraída
     */
    public String extractKey(String url) {
        if (url == null || url.isEmpty()) {
            return null;
        }

        // Si es URL de CloudFront
        if (url.contains(cloudfrontDomain)) {
            int index = url.indexOf(cloudfrontDomain) + cloudfrontDomain.length() + 1;
            return url.substring(index);
        }

        // Si es URL de S3
        if (url.contains("s3.amazonaws.com") || url.contains("s3.")) {
            int index = url.indexOf(bucketName);
            if (index != -1) {
                index = url.indexOf("/", index + bucketName.length()) + 1;
                return url.substring(index);
            }
        }

        // Si es URL local
        if (url.contains("localhost") || url.contains("127.0.0.1")) {
            int index = url.indexOf("/", url.indexOf("://") + 3);
            if (index != -1) {
                return url.substring(index + 1);
            }
        }

        // Si ya es una llave (no URL), retornarla tal cual
        return url;
    }
}





