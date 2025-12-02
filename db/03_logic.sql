-- ============================================================
-- 03_logic.sql
-- Vistas, funciones y triggers del Sistema de Citas Médicas
-- PostgreSQL
-- ============================================================


-- ============================================================
-- 1. VISTA: Agenda detallada por médico
--    - Muestra las citas con datos de médico y paciente
-- ============================================================
CREATE OR REPLACE VIEW vw_agenda_medico AS
SELECT
    m.id_medico,
    um.nombre || ' ' || um.apellido AS nombre_medico,
    c.id_cita,
    c.fecha_cita,
    c.hora_inicio,
    c.hora_fin,
    c.estado_cita,
    p.id_paciente,
    up.nombre || ' ' || up.apellido AS nombre_paciente,
    c.motivo
FROM cita c
JOIN medico m
    ON c.id_medico = m.id_medico
JOIN usuario um
    ON m.id_medico = um.id_usuario
JOIN paciente p
    ON c.id_paciente = p.id_paciente
JOIN usuario up
    ON p.id_paciente = up.id_usuario
ORDER BY m.id_medico, c.fecha_cita, c.hora_inicio;



-- ============================================================
-- 2. VISTA: Historial de citas por paciente
--    - Permite ver el historial de citas de cada paciente
-- ============================================================
CREATE OR REPLACE VIEW vw_historial_paciente AS
SELECT
    p.id_paciente,
    up.nombre || ' ' || up.apellido AS nombre_paciente,
    c.id_cita,
    c.fecha_cita,
    c.hora_inicio,
    c.hora_fin,
    c.estado_cita,
    c.motivo,
    m.id_medico,
    um.nombre || ' ' || um.apellido AS nombre_medico
FROM cita c
JOIN paciente p
    ON c.id_paciente = p.id_paciente
JOIN usuario up
    ON p.id_paciente = up.id_usuario
JOIN medico m
    ON c.id_medico = m.id_medico
JOIN usuario um
    ON m.id_medico = um.id_usuario
ORDER BY p.id_paciente, c.fecha_cita DESC, c.hora_inicio;



-- ============================================================
-- 3. FUNCIÓN: Verificar solapamiento de citas para un médico
--    - Devuelve TRUE si existe otra cita que se cruza en horario
--    - Solo considera citas en estado AGENDADA o REPROGRAMADA
-- ============================================================
CREATE OR REPLACE FUNCTION cita_solapa(
    p_id_medico    INTEGER,
    p_fecha        DATE,
    p_hora_inicio  TIME,
    p_hora_fin     TIME,
    p_id_cita      INTEGER DEFAULT NULL  -- para excluir la misma cita en UPDATE
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM cita c
        WHERE c.id_medico = p_id_medico
          AND c.fecha_cita = p_fecha
          AND c.estado_cita IN ('AGENDADA', 'REPROGRAMADA')
          -- condición de solapamiento de intervalos
          AND c.hora_inicio < p_hora_fin
          AND c.hora_fin > p_hora_inicio
          -- excluir la propia cita en caso de UPDATE
          AND (p_id_cita IS NULL OR c.id_cita <> p_id_cita)
    );
END;
$$ LANGUAGE plpgsql;



-- ============================================================
-- 4. FUNCIÓN TRIGGER: Validar solapamiento y actualizar fecha_modificacion
--    - Se ejecuta ANTES de INSERT o UPDATE en CITA
--    - Llama a cita_solapa(...)
--    - En UPDATE, actualiza fecha_modificacion
-- ============================================================
CREATE OR REPLACE FUNCTION fn_cita_before_save()
RETURNS TRIGGER AS $$
BEGIN
    -- Validar solapamiento de citas para el médico
    IF cita_solapa(
        NEW.id_medico,
        NEW.fecha_cita,
        NEW.hora_inicio,
        NEW.hora_fin,
        NEW.id_cita  -- NULL en INSERT, valor en UPDATE
    ) THEN
        RAISE EXCEPTION 'El médico ya tiene una cita en ese horario';
    END IF;

    -- En caso de UPDATE, actualizar fecha_modificacion
    IF TG_OP = 'UPDATE' THEN
        NEW.fecha_modificacion := CURRENT_TIMESTAMP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;



-- ============================================================
-- 5. TRIGGER: before_insert_update_cita
--    - Usa fn_cita_before_save
--    - Aplica en INSERT y UPDATE sobre CITA
-- ============================================================
CREATE TRIGGER trg_cita_before_ins_upd
BEFORE INSERT OR UPDATE ON cita
FOR EACH ROW
EXECUTE FUNCTION fn_cita_before_save();
