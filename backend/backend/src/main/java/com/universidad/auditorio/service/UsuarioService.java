package com.universidad.auditorio.service;

import com.universidad.auditorio.model.Usuario;
import com.universidad.auditorio.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final S3Service s3Service;
    private final LocalStorageService localStorageService;
    private final FileUrlService fileUrlService;

    public List<Usuario> getAllUsuarios() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> getUsuarioById(Long id) {
        return usuarioRepository.findById(id);
    }

    public Optional<Usuario> getUsuarioByEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

    public Optional<Usuario> getUsuarioByDni(String dni) {
        return usuarioRepository.findByDni(dni);
    }

    /**
     * Genera el email (username) a partir del nombre y apellido
     * Formato: nombre.apellido (en minúsculas, sin espacios, sin acentos)
     */
    public String generarEmail(String nombre, String apellido) {
        if (nombre == null || apellido == null) {
            throw new RuntimeException("Nombre y apellido son requeridos");
        }
        return nombre.toLowerCase()
                .trim()
                .replaceAll("[áàäâ]", "a")
                .replaceAll("[éèëê]", "e")
                .replaceAll("[íìïî]", "i")
                .replaceAll("[óòöô]", "o")
                .replaceAll("[úùüû]", "u")
                .replaceAll("[ñ]", "n")
                .replaceAll("[^a-z]", "") +
                "." +
                apellido.toLowerCase()
                .trim()
                .replaceAll("[áàäâ]", "a")
                .replaceAll("[éèëê]", "e")
                .replaceAll("[íìïî]", "i")
                .replaceAll("[óòöô]", "o")
                .replaceAll("[úùüû]", "u")
                .replaceAll("[ñ]", "n")
                .replaceAll("[^a-z]", "");
    }

    public Usuario createUsuario(Usuario usuario) {
        // Validar DNI
        if (usuario.getDni() == null || usuario.getDni().length() != 8 || !usuario.getDni().matches("\\d{8}")) {
            throw new RuntimeException("El DNI debe tener 8 dígitos");
        }

        // Validar código universitario
        if (usuario.getCodigoUniversitario() == null || usuario.getCodigoUniversitario().length() != 9 ||
            !usuario.getCodigoUniversitario().matches("\\d{9}")) {
            throw new RuntimeException("El código universitario debe tener 9 dígitos");
        }

        // Validar que no exista el DNI
        if (usuarioRepository.existsByDni(usuario.getDni())) {
            throw new RuntimeException("El DNI ya está registrado");
        }

        // Validar que no exista el código universitario
        if (usuarioRepository.existsByCodigoUniversitario(usuario.getCodigoUniversitario())) {
            throw new RuntimeException("El código universitario ya está registrado");
        }

        // Generar email si no se proporciona
        if (usuario.getEmail() == null || usuario.getEmail().isEmpty()) {
            usuario.setEmail(generarEmail(usuario.getNombre(), usuario.getApellido()));
        }

        // Validar que el email no exista
        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new RuntimeException("El email ya está registrado");
        }

        // La contraseña es el DNI (hasheado)
        usuario.setPassword(passwordEncoder.encode(usuario.getDni()));

        return usuarioRepository.save(usuario);
    }

    public Usuario updateUsuario(Long id, Usuario usuarioDetails) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.setNombre(usuarioDetails.getNombre());
        usuario.setApellido(usuarioDetails.getApellido());

        if (usuarioDetails.getPassword() != null && !usuarioDetails.getPassword().isEmpty()) {
            usuario.setPassword(passwordEncoder.encode(usuarioDetails.getPassword()));
        }

        if (usuarioDetails.getRol() != null) {
            usuario.setRol(usuarioDetails.getRol());
        }

        return usuarioRepository.save(usuario);
    }

    public void deleteUsuario(Long id) {
        usuarioRepository.deleteById(id);
    }

    /**
     * Sube una imagen de perfil para un usuario
     * Intenta usar S3, si falla usa almacenamiento local
     */
    public String uploadImagen(Long usuarioId, MultipartFile file) throws Exception {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        String key;

        try {
            // Eliminar anterior de S3
            if (usuario.getImagenKey() != null) {
                s3Service.deleteFile(usuario.getImagenKey());
            }
            // Subir nueva
            key = s3Service.uploadFile(file, "usuarios/imagenes");
        } catch (Exception e) {
            // Fallback local
            if (usuario.getImagenKey() != null) {
                localStorageService.deleteFile(usuario.getImagenKey());
            }
            key = localStorageService.uploadFile(file, "usuarios/imagenes");
        }

        usuario.setImagenKey(key);
        usuarioRepository.save(usuario);

        // CORRECCIÓN: Retornar URL presignada de S3
        String url = s3Service.getPresignedUrl(key);
        if (url == null) {
            url = "http://localhost:8080/" + key; // Fallback local
        }
        return url;
    }
}





