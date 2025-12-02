
-- =========================
-- 1. ROLES
-- =========================
INSERT INTO rol (nombre_rol, descripcion)
VALUES 
('ADMIN', 'Administrador general del sistema'),
('MEDICO', 'Profesional médico'),
('PACIENTE', 'Paciente registrado');



-- =========================
-- 2. USUARIOS (superclase)
-- =========================
-- Formato: nombre, apellido, tipo_doc, documento, email, telefono, password_hash, id_rol

-- ADMIN
INSERT INTO usuario 
(nombre, apellido, tipo_documento, numero_documento, email, telefono, password_hash, id_rol)
VALUES
('Ana', 'García', 'CC', '10000000', 'admin@clinica.com', '3001111111', 'admin123', 1);

-- MÉDICOS
INSERT INTO usuario 
(nombre, apellido, tipo_documento, numero_documento, email, telefono, password_hash, id_rol)
VALUES
('Laura', 'Pérez', 'CC', '20000000', 'lperez@clinica.com', '3002222222', 'medico123', 2),
('Carlos', 'Ruiz', 'CC', '30000000', 'cruiz@clinica.com', '3003333333', 'medico123', 2);

-- PACIENTES
INSERT INTO usuario 
(nombre, apellido, tipo_documento, numero_documento, email, telefono, password_hash, id_rol)
VALUES
('Valentina', 'López', 'CC', '40000000', 'vlopez@clinica.com', '3004444444', 'paciente123', 3),
('Mateo', 'Gómez', 'CE', '50000000', 'mgomez@clinica.com', '3005555555', 'paciente123', 3);



-- =========================
-- 3. PACIENTES (subtipo)
-- =========================
-- id_paciente = id_usuario correspondientes

INSERT INTO paciente (id_paciente, fecha_nacimiento, direccion, sexo)
VALUES
(4, '2000-05-15', 'Calle 50 #22-30', 'F'),
(5, '1999-09-10', 'Cra 40 #10-20', 'M');



-- =========================
-- 4. MÉDICOS (subtipo)
-- =========================
INSERT INTO medico (id_medico, numero_licencia, anios_experiencia, estado)
VALUES
(2, 'LIC-001', 5, 'ACTIVO'),
(3, 'LIC-002', 10, 'ACTIVO');



-- =========================
-- 5. ESPECIALIDADES (atributo multivaluado)
-- =========================
INSERT INTO medico_especialidad (id_medico, especialidad)
VALUES
(2, 'Cardiología'),
(2, 'Medicina Interna'),
(3, 'Pediatría'),
(3, 'Urgencias');



-- =========================
-- 6. HORARIO DE MÉDICOS
-- =========================
INSERT INTO horario_medico (id_medico, dia_semana, hora_inicio, hora_fin, estado)
VALUES
-- Médico 2
(2, 'Lunes', '08:00', '12:00', 'ACTIVO'),
(2, 'Miércoles', '14:00', '18:00', 'ACTIVO'),
-- Médico 3
(3, 'Martes', '09:00', '13:00', 'ACTIVO'),
(3, 'Jueves', '10:00', '15:00', 'ACTIVO');



-- =========================
-- 7. CITAS MÉDICAS
-- =========================
INSERT INTO cita 
(fecha_cita, hora_inicio, hora_fin, motivo, estado_cita, id_paciente, id_medico, id_usuario_crea)
VALUES
('2025-12-01', '09:00', '09:30', 'Dolor en el pecho', 'AGENDADA', 4, 2, 1),
('2025-12-02', '10:00', '10:30', 'Consulta general', 'AGENDADA', 5, 3, 1),
('2025-12-03', '11:00', '11:30', 'Control médico', 'AGENDADA', 4, 2, 1);



-- =========================
-- 8. NOTIFICACIONES
-- =========================
INSERT INTO notificacion 
(tipo, fecha_envio, estado, mensaje, id_cita, id_usuario_destinatario)
VALUES
('EMAIL', CURRENT_TIMESTAMP, 'ENVIADA', 'Recordatorio de cita del 1 de diciembre', 1, 4),
('EMAIL', CURRENT_TIMESTAMP, 'ENVIADA', 'Recordatorio de cita del 2 de diciembre', 2, 5),
('EMAIL', CURRENT_TIMESTAMP, 'ENVIADA', 'Recordatorio de cita del 3 de diciembre', 3, 4);
