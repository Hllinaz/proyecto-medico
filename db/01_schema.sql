CREATE TABLE rol (
    id_rol         SERIAL PRIMARY KEY,
    nombre_rol     VARCHAR(30) NOT NULL,
    descripcion    TEXT
);
CREATE TABLE usuario (
    id_usuario       SERIAL PRIMARY KEY,
    nombre           VARCHAR(80) NOT NULL,
    apellido         VARCHAR(80) NOT NULL,
    tipo_documento   VARCHAR(10),
    numero_documento VARCHAR(30),
    email            VARCHAR(120) UNIQUE NOT NULL,
    telefono         VARCHAR(20),
    password_hash    VARCHAR(255) NOT NULL,
    estado           VARCHAR(20) DEFAULT 'ACTIVO' NOT NULL,
    fecha_registro   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    id_rol           INTEGER NOT NULL,
    CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol)
        REFERENCES rol(id_rol)
);

CREATE TABLE paciente (
    id_paciente      INTEGER PRIMARY KEY,
    fecha_nacimiento DATE,
    direccion        VARCHAR(200),
    sexo             VARCHAR(20),

    CONSTRAINT fk_paciente_usuario
        FOREIGN KEY (id_paciente) REFERENCES usuario(id_usuario)
);

CREATE TABLE medico (
    id_medico         INTEGER PRIMARY KEY,
    numero_licencia   VARCHAR(50) NOT NULL,
    anios_experiencia INTEGER,
    estado            VARCHAR(20) DEFAULT 'ACTIVO' NOT NULL,

    CONSTRAINT fk_medico_usuario
        FOREIGN KEY (id_medico) REFERENCES usuario(id_usuario)
);

CREATE TABLE medico_especialidad (
    id_medico    INTEGER NOT NULL,
    especialidad VARCHAR(100) NOT NULL,

    PRIMARY KEY (id_medico, especialidad),

    CONSTRAINT fk_medico_especialidad
        FOREIGN KEY (id_medico) REFERENCES medico(id_medico)
);

CREATE TABLE horario_medico (
    id_horario   SERIAL PRIMARY KEY,
    dia_semana   VARCHAR(10) NOT NULL,
    hora_inicio  TIME NOT NULL,
    hora_fin     TIME NOT NULL,
    estado       VARCHAR(20) DEFAULT 'ACTIVO' NOT NULL,

    id_medico    INTEGER NOT NULL,
    CONSTRAINT fk_horario_medico FOREIGN KEY (id_medico)
        REFERENCES medico(id_medico)
);

CREATE TABLE cita (
    id_cita            SERIAL PRIMARY KEY,
    fecha_cita         DATE NOT NULL,
    hora_inicio        TIME NOT NULL,
    hora_fin           TIME NOT NULL,
    motivo             TEXT,
    estado_cita        VARCHAR(20) DEFAULT 'AGENDADA' NOT NULL,
    fecha_creacion     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP,

    id_paciente        INTEGER NOT NULL,
    id_medico          INTEGER NOT NULL,
    id_usuario_crea    INTEGER,

    CONSTRAINT fk_cita_paciente FOREIGN KEY (id_paciente)
        REFERENCES paciente(id_paciente),

    CONSTRAINT fk_cita_medico FOREIGN KEY (id_medico)
        REFERENCES medico(id_medico),

    CONSTRAINT fk_cita_usuario_crea FOREIGN KEY (id_usuario_crea)
        REFERENCES usuario(id_usuario)
);

CREATE TABLE notificacion (
    id_notificacion       SERIAL PRIMARY KEY,
    tipo                  VARCHAR(20),
    fecha_envio           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado                VARCHAR(20) NOT NULL,
    mensaje               TEXT NOT NULL,

    id_cita               INTEGER NOT NULL,
    id_usuario_destinatario INTEGER NOT NULL,

    CONSTRAINT fk_notif_cita FOREIGN KEY (id_cita)
        REFERENCES cita(id_cita),

    CONSTRAINT fk_notif_usuario FOREIGN KEY (id_usuario_destinatario)
        REFERENCES usuario(id_usuario)
);