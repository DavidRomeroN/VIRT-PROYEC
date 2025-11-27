package com.universidad.auditorio.config;

import com.universidad.auditorio.model.Usuario;
import com.universidad.auditorio.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Componente que actualiza los passwords de los usuarios de prueba
 * si el hash no es válido. Se ejecuta al iniciar la aplicación.
 */
@Component
@RequiredArgsConstructor
public class PasswordUpdater implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Contraseña para todos los usuarios de prueba
        String testPassword = "12345678";
        String correctHash = passwordEncoder.encode(testPassword);
        
        System.out.println("========================================");
        System.out.println("ACTUALIZANDO PASSWORDS DE USUARIOS DE PRUEBA");
        System.out.println("Hash BCrypt correcto para '12345678':");
        System.out.println(correctHash);
        System.out.println("========================================");
        
        // Lista de emails de usuarios de prueba que deben tener password "12345678"
        List<String> testUserEmails = List.of("david.romero", "docente.prueba", "admin.admin");
        
        // Actualizar usuarios de prueba
        List<Usuario> usuarios = usuarioRepository.findAll();
        int updated = 0;
        
        for (Usuario usuario : usuarios) {
            // Si es un usuario de prueba, actualizar su password
            if (testUserEmails.contains(usuario.getEmail())) {
                // Verificar si el password actual no funciona o necesita actualización
                boolean needsUpdate = true;
                if (usuario.getPassword() != null) {
                    // Verificar si el hash actual funciona
                    try {
                        needsUpdate = !passwordEncoder.matches(testPassword, usuario.getPassword());
                    } catch (Exception e) {
                        // Si hay error al verificar, necesita actualización
                        needsUpdate = true;
                    }
                }
                
                if (needsUpdate) {
                    // Actualizar con el hash correcto
                    usuario.setPassword(correctHash);
                    usuarioRepository.save(usuario);
                    updated++;
                    System.out.println("✓ Actualizado: " + usuario.getEmail() + " (Rol: " + usuario.getRol() + ")");
                } else {
                    System.out.println("✓ Ya actualizado: " + usuario.getEmail() + " (Rol: " + usuario.getRol() + ")");
                }
            }
        }
        
        if (updated > 0) {
            System.out.println("========================================");
            System.out.println("Se actualizaron " + updated + " usuarios de prueba");
            System.out.println("========================================");
        } else {
            System.out.println("Todos los usuarios de prueba ya están actualizados");
            System.out.println("========================================");
        }
    }
}

