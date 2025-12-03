from rest_framework import serializers
from django.db import connection
from .models import (
    Rol,
    Usuario,
    Paciente,
    Medico,
    MedicoEspecialidad,
    HorarioMedico,
    Cita,
    Notificacion,
)


class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = ['id_rol', 'nombre_rol', 'descripcion']


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = [
            'id_usuario',
            'nombre',
            'apellido',
            'tipo_documento',
            'numero_documento',
            'email',
            'telefono',
            'password_hash',   #write_only
            'estado',
            'fecha_registro',
            'id_rol',
        ]
        read_only_fields = ['fecha_registro']
        extra_kwargs = {
            'password_hash': {'write_only': True},  # no se devuelve en respuestas de JSON
        }


class PacienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paciente
        fields = [
            'id_paciente',
            'fecha_nacimiento',
            'direccion',
            'sexo',
        ]


class MedicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medico
        fields = [
            'id_medico',
            'numero_licencia',
            'anios_experiencia',
            'estado',
        ]


class MedicoEspecialidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicoEspecialidad
        fields = ['id_medico', 'especialidad']


class HorarioMedicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = HorarioMedico
        fields = [
            'id_horario',
            'id_medico',
            'dia_semana',
            'hora_inicio',
            'hora_fin',
            'estado',
        ]


class CitaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cita
        fields = [
            'id_cita',
            'fecha_cita',
            'hora_inicio',
            'hora_fin',
            'motivo',
            'estado_cita',
            'fecha_creacion',
            'fecha_modificacion',
            'id_paciente',
            'id_medico',
            'id_usuario_crea',
        ]
        read_only_fields = ['fecha_creacion', 'fecha_modificacion']


class NotificacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notificacion
        fields = [
            'id_notificacion',
            'tipo',
            'fecha_envio',
            'estado',
            'mensaje',
            'id_cita',
            'id_usuario_destinatario',
        ]
        read_only_fields = ['fecha_envio']

class MedicoListadoSerializer(serializers.ModelSerializer):
    # nombre y apellido vienen del usuario relacionado
    nombre = serializers.CharField(source='id_medico.nombre', read_only=True)
    apellido = serializers.CharField(source='id_medico.apellido', read_only=True)
    especialidad = serializers.SerializerMethodField()

    class Meta:
        model = Medico
        fields = [
            'id_medico',
            'nombre',
            'apellido',
            'especialidad',
            'estado',
        ]

    def get_especialidad(self, obj):

        # obj es un Medico; su PK en la tabla es id_medico
        medico_id = obj.pk  # equivalente a usar obj.id_medico_id

        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT especialidad
                FROM medico_especialidad
                WHERE id_medico = %s
                """,
                [medico_id]
            )
            rows = cursor.fetchall()  # lista de tuplas [(esp1,), (esp2,), ...]

        if not rows:
            return None

        nombres = [r[0] for r in rows]
        return ", ".join(nombres)

    
class PacienteListadoSerializer(serializers.ModelSerializer):
    # Campos que vienen del usuario (id_paciente → usuario)
    nombre = serializers.CharField(source='id_paciente.nombre', read_only=True)
    apellido = serializers.CharField(source='id_paciente.apellido', read_only=True)
    tipo_documento = serializers.CharField(source='id_paciente.tipo_documento', read_only=True)
    numero_documento = serializers.CharField(source='id_paciente.numero_documento', read_only=True)

    class Meta:
        model = Paciente
        fields = [
            'id_paciente',
            'nombre',
            'apellido',
            'sexo',
            'tipo_documento',
            'numero_documento',
        ]

