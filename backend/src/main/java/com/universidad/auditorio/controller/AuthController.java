package com.universidad.auditorio.controller;

import com.universidad.auditorio.model.Usuario;
import com.universidad.auditorio.service.UsuarioService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuthController {

    private final UsuarioService usuarioService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Usuario usuario) {
        try {
            Usuario nuevoUsuario = usuarioService.createUsuario(usuario);
            return ResponseEntity.ok(nuevoUsuario);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        return usuarioService.getUsuarioByEmail(request.getEmail())
                .map(usuario -> {
                    if (passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
                        return ResponseEntity.ok(usuario);
                    } else {
                        return ResponseEntity.status(401).body("Credenciales inválidas");
                    }
                })
                .orElse(ResponseEntity.status(401).body("Usuario no encontrado"));
    }

    @Data
    static class LoginRequest {
        private String email;
        private String password;
    }
}





