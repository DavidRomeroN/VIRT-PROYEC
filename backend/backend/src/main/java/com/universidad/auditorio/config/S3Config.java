package com.universidad.auditorio.config;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class S3Config {

    @Value("${aws.s3.region:us-east-1}")
    private String region;

    @Bean
    public AmazonS3 s3Client() {
        // Al no especificar credenciales explícitamente, el SDK buscará automáticamente:
        // 1. Variables de entorno
        // 2. Propiedades de sistema Java
        // 3. Credenciales en ~/.aws/credentials
        // 4. IAM ROLE del EC2 (¡Esto es lo que queremos!)
        return AmazonS3ClientBuilder.standard()
                .withRegion(region)
                .build();
    }
}