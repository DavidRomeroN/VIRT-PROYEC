package com.universidad.auditorio.controller;

import com.universidad.auditorio.model.Usuario;
import com.universidad.auditorio.service.UsuarioService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
// Nota: CORS se maneja globalmente en SecurityConfig
// Removido @CrossOrigin(origins = "*") porque entra en conflicto con allowCredentials
@RequiredArgsConstructor
public class AuthController {

    private final UsuarioService usuarioService;
    private final PasswordEncoder passwordEncoder;

    /**
     * Endpoint para crear usuarios (solo para administradores o carga masiva)
     * Los usuarios ya tienen sus datos registrados, no se registran ellos mismos
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Usuario usuario) {
        try {
            Usuario nuevoUsuario = usuarioService.createUsuario(usuario);
            // No devolver el password
            nuevoUsuario.setPassword(null);
            return ResponseEntity.ok(nuevoUsuario);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    /**
     * Login con email (nombre.apellido) y contraseña (DNI)
     * Ejemplo: email: "david.romero", password: "12345678" (DNI)
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // Buscar usuario por email (nombre.apellido)
        return usuarioService.getUsuarioByEmail(request.getEmail())
                .map(usuario -> {
                    // La contraseña es el DNI (sin hashear en el request)
                    if (passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
                        // No devolver el password
                        usuario.setPassword(null);
                        return ResponseEntity.ok(usuario);
                    } else {
                        return ResponseEntity.status(401).body("Credenciales inválidas");
                    }
                })
                .orElse(ResponseEntity.status(401).body("Usuario no encontrado"));
    }

    /**
     * Endpoint temporal para regenerar usuarios con hashes correctos
     * SOLO PARA DESARROLLO - ELIMINAR EN PRODUCCIÓN
     */
    @PostMapping("/regenerate-users")
    public ResponseEntity<?> regenerateUsers() {
        try {
            // Regenerar hash para "12345678"
            String newHash = passwordEncoder.encode("12345678");
            
            return ResponseEntity.ok(Map.of(
                "message", "Hash BCrypt generado para '12345678'",
                "hash", newHash,
                "instrucciones", "Actualiza el schema.sql con este hash y reinicia la aplicación"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @Data
    static class LoginRequest {
        private String email; // nombre.apellido (ej: david.romero)
        private String password; // DNI de 8 dígitos
    }
}





