-- ============================================
-- SCHEMA SQL - Sistema de Reserva de Auditorios
-- LAMB University
-- ============================================

-- Eliminar tablas si existen (en orden inverso de dependencias)
DROP TABLE IF EXISTS reservas;
DROP TABLE IF EXISTS auditorios;
DROP TABLE IF EXISTS usuarios;

-- ============================================
-- TABLA: usuarios
-- ============================================
CREATE TABLE usuarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    dni VARCHAR(8) NOT NULL UNIQUE,
    codigo_universitario VARCHAR(9) NOT NULL UNIQUE,
    ciclo_estudio VARCHAR(255) NOT NULL,
    rol VARCHAR(50) DEFAULT 'ESTUDIANTE',
    ciclo INTEGER,
    grupo VARCHAR(10),
    carrera_profesional VARCHAR(255),
    imagen_key VARCHAR(500),
    INDEX idx_email (email),
    INDEX idx_dni (dni),
    INDEX idx_codigo_universitario (codigo_universitario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: auditorios
-- ============================================
CREATE TABLE auditorios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    capacidad INTEGER NOT NULL,
    descripcion TEXT,
    ubicacion VARCHAR(255),
    imagen_key VARCHAR(500),
    video_key VARCHAR(500),
    activo BOOLEAN DEFAULT TRUE,
    INDEX idx_nombre (nombre),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: reservas
-- ============================================
CREATE TABLE reservas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    auditorio_id BIGINT NOT NULL,
    usuario_id BIGINT NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    motivo VARCHAR(500),
    estado VARCHAR(50) DEFAULT 'SOLICITADA',
    observaciones TEXT,
    FOREIGN KEY (auditorio_id) REFERENCES auditorios(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_auditorio_id (auditorio_id),
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_fecha (fecha),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DATOS INICIALES: Usuarios de Prueba
-- ============================================
-- Contraseña para todos: 12345678
-- Hash BCrypt generado: (se generará al iniciar la aplicación con HashGenerator)
-- NOTA: Ejecuta la aplicación Spring Boot y copia el hash que aparece en consola
-- Luego actualiza este archivo con el hash correcto

-- Hash BCrypt válido para "12345678" (10 rounds)
-- NOTA: El componente PasswordUpdater actualizará automáticamente los passwords
-- al iniciar la aplicación si no son válidos. Este hash es solo un placeholder.
-- Hash generado: $2a$10$7FpKddDvQlfrM8Sh0s/Z2Or27NkLf2nEDetdADyn50r2J5aw.CJgK

-- Usuario Estudiante: david.romero / 12345678
INSERT INTO usuarios (
    email, nombre, apellido, password, dni, codigo_universitario, 
    ciclo_estudio, rol, ciclo, grupo, carrera_profesional
) VALUES (
    'david.romero',
    'David',
    'Romero Nina',
    '$2a$10$7FpKddDvQlfrM8Sh0s/Z2Or27NkLf2nEDetdADyn50r2J5aw.CJgK',
    '12345678',
    '123456789',
    '2024-1',
    'ESTUDIANTE',
    5,
    '1',
    'Ingeniería de Sistemas'
);

-- Usuario Docente: docente.prueba / 12345678
INSERT INTO usuarios (
    email, nombre, apellido, password, dni, codigo_universitario, 
    ciclo_estudio, rol, carrera_profesional
) VALUES (
    'docente.prueba',
    'Docente',
    'Prueba',
    '$2a$10$7FpKddDvQlfrM8Sh0s/Z2Or27NkLf2nEDetdADyn50r2J5aw.CJgK',
    '87654321',
    '987654321',
    '2024-1',
    'PROFESOR',
    'Ingeniería de Sistemas, Ingeniería de Software'
);

-- Usuario Administrador: admin.admin / 12345678
-- IMPORTANTE: La contraseña es "12345678" (el DNI del admin es "11111111" pero la contraseña es "12345678")
INSERT INTO usuarios (
    email, nombre, apellido, password, dni, codigo_universitario, 
    ciclo_estudio, rol
) VALUES (
    'admin.admin',
    'Admin',
    'Administrador',
    '$2a$10$7FpKddDvQlfrM8Sh0s/Z2Or27NkLf2nEDetdADyn50r2J5aw.CJgK',
    '11111111',
    '111111111',
    '2024-1',
    'ADMINISTRADOR'
);

-- ============================================
-- DATOS INICIALES: Auditorios de Ejemplo
-- ============================================
INSERT INTO auditorios (nombre, capacidad, descripcion, ubicacion, activo) VALUES
    ('Auditorio Principal', 500, 'Auditorio principal con sistema de sonido y proyección', 'Edificio A - Piso 3', TRUE),
    ('Auditorio Pequeño', 100, 'Auditorio para eventos pequeños y presentaciones', 'Edificio B - Piso 2', TRUE),
    ('Sala de Conferencias', 50, 'Sala equipada para conferencias y reuniones', 'Edificio C - Piso 1', TRUE);
