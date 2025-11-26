-- Base de datos para sistema de reserva de auditorios
CREATE DATABASE IF NOT EXISTS auditorio_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE auditorio_db;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('ESTUDIANTE', 'PROFESOR', 'ADMINISTRADOR') DEFAULT 'ESTUDIANTE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de auditorios
CREATE TABLE IF NOT EXISTS auditorios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    capacidad INT NOT NULL,
    descripcion TEXT,
    ubicacion VARCHAR(255),
    imagen_key VARCHAR(500),  -- Llave/ruta del archivo (ej: auditorios/imagenes/uuid-123_imagen.jpg)
    video_key VARCHAR(500),   -- Llave/ruta del archivo (ej: auditorios/videos/uuid-123_video.mp4)
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de reservas
CREATE TABLE IF NOT EXISTS reservas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    auditorio_id BIGINT NOT NULL,
    usuario_id BIGINT NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    motivo VARCHAR(500),
    estado ENUM('PENDIENTE', 'APROBADA', 'RECHAZADA', 'CANCELADA') DEFAULT 'PENDIENTE',
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (auditorio_id) REFERENCES auditorios(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_auditorio_fecha (auditorio_id, fecha),
    INDEX idx_usuario (usuario_id),
    INDEX idx_fecha (fecha)
);

-- Datos de ejemplo
INSERT INTO usuarios (email, nombre, apellido, password, rol) VALUES
('admin@universidad.edu', 'Admin', 'Sistema', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMINISTRADOR'),
('profesor@universidad.edu', 'Juan', 'Pérez', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'PROFESOR'),
('estudiante@universidad.edu', 'María', 'González', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ESTUDIANTE');

-- Password por defecto: password123

INSERT INTO auditorios (nombre, capacidad, descripcion, ubicacion, activo) VALUES
('Auditorio Principal', 500, 'Auditorio principal con sistema de sonido y proyector', 'Edificio A - Planta 1', TRUE),
('Auditorio de Ciencias', 200, 'Auditorio especializado para conferencias científicas', 'Edificio B - Planta 2', TRUE),
('Sala de Conferencias', 100, 'Sala pequeña para reuniones y presentaciones', 'Edificio C - Planta 1', TRUE),
('Auditorio de Artes', 300, 'Auditorio con escenario y equipamiento para eventos artísticos', 'Edificio D - Planta 1', TRUE);

