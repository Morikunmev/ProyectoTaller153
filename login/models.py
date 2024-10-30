from django.db import models
from django.contrib.auth.models import User
from cloudinary.models import CloudinaryField
from django.contrib.auth.hashers import make_password

class Usuario(models.Model):
    # Relación uno a uno con auth_user
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=False, blank=False)
    # Campos obligatorios
    RutUsuario = models.CharField(max_length=12, unique=True, null=False, blank=False)
    TipoUsuario = models.CharField(max_length=20, null=False, blank=False)
    # Campos opcionales
    EdadUsuario = models.PositiveIntegerField(null=True, blank=True)
    TelefonoUsuario = models.CharField(max_length=15, null=True, blank=True)
    FotoUsuario = CloudinaryField('imagen', folder='usuarios/', null=True, blank=True)
    class Meta:
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"