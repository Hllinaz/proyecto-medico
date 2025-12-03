from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import DatabaseError
from django.contrib.auth.hashers import make_password
from django.utils.dateparse import parse_date



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
    MedicoListadoSerializer,     
    PacienteListadoSerializer,   
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

        # Guardar el usuario
        usuario = serializer.save()

        # ======== AUTO-CREAR PACIENTE O MEDICO SEGÚN EL ROL ======== #
        # Suponemos que los roles tienen nombres tipo 'PACIENTE', 'MEDICO', 'DOCTOR', etc.

        try:
            nombre_rol = (usuario.id_rol.nombre_rol or "").upper()
        except AttributeError:
            nombre_rol = ""

        # Si el rol contiene la palabra 'PACIENTE' → crear en tabla paciente
        if "PACIENTE" in nombre_rol:
            Paciente.objects.get_or_create(
                id_paciente=usuario,  # OneToOne/ForeignKey al usuario
            )

        # Si el rol contiene 'MEDICO' o 'DOCTOR' → crear en tabla medico
        elif "MEDICO" in nombre_rol or "DOCTOR" in nombre_rol:
            numero_licencia = data.get('numero_licencia', f"LIC-{usuario.id_usuario}")
            anios_experiencia = data.get('anios_experiencia')

            Medico.objects.get_or_create(
                id_medico=usuario,
                defaults={
                    'numero_licencia': numero_licencia,
                    'anios_experiencia': anios_experiencia,
                    'estado': 'ACTIVO',
                }
            )

        # ============================================================ #

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)



class PacienteViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Paciente.objects.all()
    serializer_class = PacienteSerializer

    def get_queryset(self):
        # Trae también la info del usuario relacionado
        return Paciente.objects.select_related('id_paciente').all()

    def get_serializer_class(self):
        # Para la lista general usamos el formato especial
        if self.action == 'list':
            return PacienteListadoSerializer
        # Para detail, citas usamos el serializer normal
        return PacienteSerializer

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

    def get_queryset(self):
        # Trae también la info del usuario relacionado para eficiencia
        return Medico.objects.select_related('id_medico').all()

    def get_serializer_class(self):
        # Para la lista general usamos el formato especial
        if self.action == 'list':
            return MedicoListadoSerializer
        # Para detail, citas, horarios usamos el serializer normal
        return MedicoSerializer

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
    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """
        GET /api/citas/estadisticas/?fecha=YYYY-MM-DD&estado=AGENDADA

        Devuelve:
        - total_medicos
        - total_pacientes
        - total_citas_dia      (si se envía ?fecha=...)
        - total_citas_estado   (si se envía ?estado=...)
        """
        fecha_str = request.query_params.get('fecha')
        estado = request.query_params.get('estado')

        # Conteo de médicos y pacientes
        total_medicos = Medico.objects.count()
        total_pacientes = Paciente.objects.count()

        # Citas en un día específico
        total_citas_dia = 0
        if fecha_str:
            fecha = parse_date(fecha_str)
            if fecha:
                total_citas_dia = Cita.objects.filter(fecha_cita=fecha).count()

        # Citas con un estado específico
        total_citas_estado = 0
        if estado:
            total_citas_estado = Cita.objects.filter(estado_cita=estado).count()

        return Response({
            'total_medicos': total_medicos,
            'total_pacientes': total_pacientes,
            'total_citas_dia': total_citas_dia,
            'total_citas_estado': total_citas_estado,
        })



class NotificacionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Notificacion.objects.all().order_by('-fecha_envio')
    serializer_class = NotificacionSerializer
