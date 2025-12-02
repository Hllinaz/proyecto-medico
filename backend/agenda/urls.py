from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .auth_views import LoginView
from .views import (
    RolViewSet,
    UsuarioViewSet,
    PacienteViewSet,
    MedicoViewSet,
    MedicoEspecialidadViewSet,
    HorarioMedicoViewSet,
    CitaViewSet,
    NotificacionViewSet,
    )

router = DefaultRouter()
router.register(r'roles', RolViewSet, basename='rol')
router.register(r'usuarios', UsuarioViewSet, basename='usuario')
router.register(r'pacientes', PacienteViewSet, basename='paciente')
router.register(r'medicos', MedicoViewSet, basename='medico')
router.register(r'medico-especialidad', MedicoEspecialidadViewSet, basename='medico-especialidad')
router.register(r'horarios-medico', HorarioMedicoViewSet, basename='horario-medico')
router.register(r'citas', CitaViewSet, basename='cita')
router.register(r'notificaciones', NotificacionViewSet, basename='notificacion')

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('', include(router.urls)),
]
