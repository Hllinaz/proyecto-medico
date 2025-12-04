from django.contrib import admin

# Register your models here.
from django.contrib import admin
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

admin.site.register(Rol)
admin.site.register(Usuario)
admin.site.register(Paciente)
admin.site.register(Medico)
admin.site.register(MedicoEspecialidad)
admin.site.register(HorarioMedico)
admin.site.register(Cita)
admin.site.register(Notificacion)
