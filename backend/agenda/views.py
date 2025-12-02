from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import DatabaseError
from django.contrib.auth.hashers import make_password


# Create your views here.
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
from .serializers import (
    RolSerializer,
    UsuarioSerializer,
    PacienteSerializer,
    MedicoSerializer,
    MedicoEspecialidadSerializer,
    HorarioMedicoSerializer,
    CitaSerializer,
    NotificacionSerializer,
)


class RolViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Rol.objects.all()
    serializer_class = RolSerializer


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        # Encriptar contraseña si viene en el campo password_hash
        if 'password_hash' in data:
            data['password_hash'] = make_password(data['password_hash'])

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class PacienteViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Paciente.objects.all()
    serializer_class = PacienteSerializer

    @action(detail=True, methods=['get'])
    def citas(self, request, pk=None):
        """Listar citas de un paciente específico"""
        paciente = self.get_object()
        citas = Cita.objects.filter(id_paciente=paciente)
        serializer = CitaSerializer(citas, many=True)
        return Response(serializer.data)


class MedicoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Medico.objects.all()
    serializer_class = MedicoSerializer

    @action(detail=True, methods=['get'])
    def citas(self, request, pk=None):
        """Listar citas de un médico específico"""
        medico = self.get_object()
        citas = Cita.objects.filter(id_medico=medico)
        serializer = CitaSerializer(citas, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def horarios(self, request, pk=None):
        """Listar horarios de un médico específico"""
        medico = self.get_object()
        horarios = HorarioMedico.objects.filter(id_medico=medico)
        serializer = HorarioMedicoSerializer(horarios, many=True)
        return Response(serializer.data)



class MedicoEspecialidadViewSet(viewsets.ModelViewSet):
    queryset = MedicoEspecialidad.objects.all()
    serializer_class = MedicoEspecialidadSerializer


class HorarioMedicoViewSet(viewsets.ModelViewSet):
    queryset = HorarioMedico.objects.all()
    serializer_class = HorarioMedicoSerializer


class CitaViewSet(viewsets.ModelViewSet):
    queryset = Cita.objects.all().order_by('fecha_cita', 'hora_inicio')
    serializer_class = CitaSerializer

    @action(detail=False, methods=['get'])
    def por_medico(self, request):
        """Listar citas filtradas por id_medico (query param)"""
        id_medico = request.query_params.get('id_medico')
        if not id_medico:
            return Response(
                {'detail': 'Debe proporcionar id_medico como parámetro.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        citas = Cita.objects.filter(id_medico_id=id_medico)
        serializer = CitaSerializer(citas, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def por_paciente(self, request):
        """Listar citas filtradas por id_paciente (query param)"""
        id_paciente = request.query_params.get('id_paciente')
        if not id_paciente:
            return Response(
                {'detail': 'Debe proporcionar id_paciente como parámetro.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        citas = Cita.objects.filter(id_paciente_id=id_paciente)
        serializer = CitaSerializer(citas, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancelar(self, request, pk=None):
        """Cancelar una cita: cambia estado_cita a CANCELADA"""
        cita = self.get_object()
        cita.estado_cita = 'CANCELADA'
        cita.save()
        return Response({'detail': 'Cita cancelada correctamente.'})

    @action(detail=True, methods=['post'])
    def reprogramar(self, request, pk=None):
        """
        Reprogramar una cita cambiando fecha/hora.
        El trigger en PostgreSQL valida solapamiento.
        """
        cita = self.get_object()
        nueva_fecha = request.data.get('fecha_cita')
        nueva_hora_inicio = request.data.get('hora_inicio')
        nueva_hora_fin = request.data.get('hora_fin')

        if not (nueva_fecha and nueva_hora_inicio and nueva_hora_fin):
            return Response(
                {'detail': 'Debe enviar fecha_cita, hora_inicio y hora_fin.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        cita.fecha_cita = nueva_fecha
        cita.hora_inicio = nueva_hora_inicio
        cita.hora_fin = nueva_hora_fin

        try:
            cita.save()  # aquí se dispara el trigger de tu 03_logic.sql
        except DatabaseError as e:
            return Response(
                {'detail': f'Error al reprogramar la cita: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response({'detail': 'Cita reprogramada correctamente.'})


class NotificacionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Notificacion.objects.all().order_by('-fecha_envio')
    serializer_class = NotificacionSerializer
