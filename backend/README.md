# Backend – Sistema de Agendamiento de Citas Médicas

Este backend implementa la lógica de negocio y la API REST para el sistema de agendamiento de citas médicas de una clínica, utilizando:

- **PostgreSQL** como motor de base de datos relacional.
- **Django** como framework backend.
- **Django REST Framework (DRF)** para exponer la API REST.
- Scripts SQL para:
  - Crear el esquema de la BD.
  - Insertar datos iniciales.
  - Definir vistas, funciones y triggers (reglas de negocio en la BD).

---

## 1. Arquitectura general

Componentes principales:

- **BD relacional (PostgreSQL)**  
  - Tablas: `rol`, `usuario`, `paciente`, `medico`, `medico_especialidad`,
    `horario_medico`, `cita`, `notificacion`.
  - Integridad referencial mediante claves foráneas.
  - Borrado lógico mediante campos `estado` / `estado_cita`, en lugar de `ON DELETE CASCADE`.

- **Backend (Django + DRF)**  
  - Conectado a la BD existente (las tablas se crean con SQL, no con migraciones).
  - Modelos Django mapean las tablas ya creadas.
  - API REST para gestionar usuarios, pacientes, médicos, horarios, citas y notificaciones.

- **Frontend (Angular)**  
  - Consumirá esta API (fuera del alcance de este README, pero ya preparado para integrarse).

---

## 2. Estructura de carpetas relevante

```text
proyecto-medico/
├── backend/
│   ├── backend_api/          # Proyecto Django
│   ├── agenda/               # App Django con la lógica del sistema
│   │   ├── models.py         # Modelos conectados a las tablas SQL
│   │   ├── serializers.py    # Serializadores DRF
│   │   ├── views.py          # ViewSets / lógica de la API
│   │   ├── urls.py           # Rutas de la API de la app
│   ├── manage.py
│   └── venv/                 # Entorno virtual de Python
└── db/
    ├── 01_schema.sql         # Creación de tablas
    ├── 02_seed.sql           # Datos iniciales
    └── 03_logic.sql          # Vistas, funciones y triggers
