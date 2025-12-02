from rest_framework import serializers
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
            'password_hash',
            'estado',
            'fecha_registro',
            'id_rol',
        ]
        read_only_fields = ['fecha_registro']


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
