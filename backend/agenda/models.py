from django.db import models


class Rol(models.Model):
    id_rol = models.AutoField(primary_key=True)
    nombre_rol = models.CharField(max_length=30)
    descripcion = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'rol'
        managed = False  # Tabla creada por SQL, Django no la migra


class Usuario(models.Model):
    id_usuario = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=80)
    apellido = models.CharField(max_length=80)
    tipo_documento = models.CharField(max_length=10, blank=True, null=True)
    numero_documento = models.CharField(max_length=30, blank=True, null=True)
    email = models.EmailField(max_length=120, unique=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    password_hash = models.CharField(max_length=255)
    estado = models.CharField(max_length=20, default='ACTIVO')
    fecha_registro = models.DateTimeField(auto_now_add=True)
    id_rol = models.ForeignKey(
        Rol,
        models.DO_NOTHING,
        db_column='id_rol',
    )

    class Meta:
        db_table = 'usuario'
        managed = False


class Paciente(models.Model):
    id_paciente = models.OneToOneField(
        Usuario,
        models.DO_NOTHING,
        db_column='id_paciente',
        primary_key=True,
    )
    fecha_nacimiento = models.DateField(blank=True, null=True)
    direccion = models.CharField(max_length=200, blank=True, null=True)
    sexo = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        db_table = 'paciente'
        managed = False


class Medico(models.Model):
    id_medico = models.OneToOneField(
        Usuario,
        models.DO_NOTHING,
        db_column='id_medico',
        primary_key=True,
    )
    numero_licencia = models.CharField(max_length=50)
    anios_experiencia = models.IntegerField(blank=True, null=True)
    estado = models.CharField(max_length=20, default='ACTIVO')

    class Meta:
        db_table = 'medico'
        managed = False


class MedicoEspecialidad(models.Model):
    id = models.AutoField(primary_key=True, db_column='id')
    id_medico = models.ForeignKey(
        Medico,
        models.DO_NOTHING,
        db_column='id_medico',
    )
    especialidad = models.CharField(max_length=100)

    class Meta:
        db_table = 'medico_especialidad'
        managed = False
        unique_together = (('id_medico', 'especialidad'),)



class HorarioMedico(models.Model):
    id_horario = models.AutoField(primary_key=True)
    dia_semana = models.CharField(max_length=10)
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    estado = models.CharField(max_length=20, default='ACTIVO')
    id_medico = models.ForeignKey(
        Medico,
        models.DO_NOTHING,
        db_column='id_medico',
    )

    class Meta:
        db_table = 'horario_medico'
    managed = False


class Cita(models.Model):
    id_cita = models.AutoField(primary_key=True)
    fecha_cita = models.DateField()
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    motivo = models.TextField(blank=True, null=True)
    estado_cita = models.CharField(max_length=20, default='AGENDADA')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_modificacion = models.DateTimeField(blank=True, null=True)
    id_paciente = models.ForeignKey(
        Paciente,
        models.DO_NOTHING,
        db_column='id_paciente',
    )
    id_medico = models.ForeignKey(
        Medico,
        models.DO_NOTHING,
        db_column='id_medico',
    )
    id_usuario_crea = models.ForeignKey(
        Usuario,
        models.DO_NOTHING,
        db_column='id_usuario_crea',
        blank=True,
        null=True,
        related_name='citas_creadas',
    )

    class Meta:
        db_table = 'cita'
        managed = False


class Notificacion(models.Model):
    id_notificacion = models.AutoField(primary_key=True)
    tipo = models.CharField(max_length=20, blank=True, null=True)
    fecha_envio = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20, blank=True, null=True)
    mensaje = models.TextField()
    id_cita = models.ForeignKey(
        Cita,
        models.DO_NOTHING,
        db_column='id_cita',
    )
    id_usuario_destinatario = models.ForeignKey(
        Usuario,
        models.DO_NOTHING,
        db_column='id_usuario_destinatario',
    )

    class Meta:
        db_table = 'notificacion'
        managed = False
