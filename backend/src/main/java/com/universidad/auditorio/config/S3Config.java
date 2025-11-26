package com.universidad.auditorio.config;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicSessionCredentials;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuración para el cliente de Amazon S3.
 * 
 * Esta clase configura y proporciona un bean de AmazonS3 para interactuar
 * con el servicio de almacenamiento S3 de AWS. Utiliza credenciales de sesión
 * temporales (BasicSessionCredentials) que requieren access key, secret key y
 * session token.
 * 
 * @author Sistema de Reserva de Auditorios
 * @version 2.0
 */
@Configuration
public class S3Config {

    private static final Logger logger = LoggerFactory.getLogger(S3Config.class);
    private static final String LOG_PREFIX = "🔷 [S3 Config]";

    @Value("${aws.s3.access-key:}")
    private String accessKey;

    @Value("${aws.s3.secret-key:}")
    private String secretKey;

    @Value("${aws.s3.session-token:}")
    private String sessionToken;

    @Value("${aws.s3.region:us-east-1}")
    private String region;

    @Value("${aws.s3.bucket-name:}")
    private String bucketName;

    /**
     * Crea y configura el cliente de Amazon S3.
     * 
     * Valida que todas las credenciales necesarias estén presentes antes de
     * crear el cliente. Si faltan credenciales, retorna null y registra una
     * advertencia en los logs.
     * 
     * @return Instancia configurada de AmazonS3, o null si faltan credenciales
     */
    @Bean
    public AmazonS3 amazonS3() {
        logger.info("{} Iniciando configuración del cliente AWS S3...", LOG_PREFIX);
        
        // Validar que tengamos los 3 datos necesarios
        if (!areCredentialsValid()) {
            logger.warn("{} ⚠️  AWS S3 no configurado: Faltan credenciales o token de sesión.", LOG_PREFIX);
            logger.warn("{} Configure las variables de entorno: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN", LOG_PREFIX);
            return null;
        }

        try {
            logger.info("{} Configurando cliente AWS S3 con credenciales de sesión...", LOG_PREFIX);
            logger.info("{} Región: {}", LOG_PREFIX, region);
            if (!bucketName.isEmpty()) {
                logger.info("{} Bucket: {}", LOG_PREFIX, bucketName);
            }
            
            // Ocultar la mayor parte de la access key por seguridad
            String maskedAccessKey = maskAccessKey(accessKey);
            logger.debug("{} Access Key: {}...", LOG_PREFIX, maskedAccessKey);

            // Crear credenciales de sesión (requieren 3 parámetros)
            BasicSessionCredentials credentials = new BasicSessionCredentials(
                accessKey, 
                secretKey, 
                sessionToken
            );

            AmazonS3 s3Client = AmazonS3ClientBuilder.standard()
                    .withRegion(region)
                    .withCredentials(new AWSStaticCredentialsProvider(credentials))
                    .build();

            logger.info("{} ✅ Cliente AWS S3 configurado exitosamente", LOG_PREFIX);
            return s3Client;

        } catch (Exception e) {
            logger.error("{} ❌ Error al crear cliente AWS S3: {}", LOG_PREFIX, e.getMessage(), e);
            return null;
        }
    }

    /**
     * Valida que todas las credenciales necesarias estén presentes y no estén vacías.
     * 
     * @return true si todas las credenciales son válidas, false en caso contrario
     */
    private boolean areCredentialsValid() {
        return accessKey != null && !accessKey.trim().isEmpty() &&
               secretKey != null && !secretKey.trim().isEmpty() &&
               sessionToken != null && !sessionToken.trim().isEmpty();
    }

    /**
     * Enmascara una access key mostrando solo los primeros caracteres.
     * 
     * @param accessKey La access key a enmascarar
     * @return La access key enmascarada (primeros 4 caracteres + "...")
     */
    private String maskAccessKey(String accessKey) {
        if (accessKey == null || accessKey.length() <= 4) {
            return "****";
        }
        return accessKey.substring(0, 4);
    }
}