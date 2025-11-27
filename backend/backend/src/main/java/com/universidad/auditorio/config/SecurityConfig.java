package com.universidad.auditorio.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // IMPORTANTE: Permitir OPTIONS primero (preflight CORS debe ser lo primero)
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // Endpoints públicos
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/auditorios/**").permitAll() // Todos los endpoints de auditorios son públicos
                .requestMatchers("/api/reservas/**").permitAll() // Permitir reservas sin autenticación (para desarrollo)
                .requestMatchers("/api/usuarios/**").authenticated() // Usuarios requieren autenticación
                // Por defecto permitir acceso (para desarrollo)
                .anyRequest().permitAll()
            );
        
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Obtener orígenes permitidos desde variable de entorno o usar valores por defecto
        String corsOriginsEnv = System.getenv().getOrDefault("CORS_ORIGINS", "");
        List<String> allowedOrigins;
        
        if (corsOriginsEnv.isEmpty()) {
            // Valores por defecto: localhost, todos los buckets S3 y CloudFront
            allowedOrigins = Arrays.asList(
                "http://localhost:4200",
                // Bucket anterior (legacy)
                "http://pagina-web-auditorios-sin-cloudfront.s3-website-us-east-1.amazonaws.com",
                "https://pagina-web-auditorios-sin-cloudfront.s3-website-us-east-1.amazonaws.com",
                // Bucket actual
                "http://rontend-auditorio-reservas-upeu.s3-website-us-east-1.amazonaws.com",
                "https://rontend-auditorio-reservas-upeu.s3-website-us-east-1.amazonaws.com",
                // CloudFront
                "https://d28vzm0n3rhsde.cloudfront.net"
            );
        } else {
            // Si hay variable de entorno, usar esos valores (separados por coma)
            allowedOrigins = Arrays.asList(corsOriginsEnv.split(","));
        }
        
        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type", "Access-Control-Allow-Origin", "Access-Control-Allow-Credentials"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L); // Cache preflight requests for 1 hour
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

