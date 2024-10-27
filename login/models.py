from django.db import models
from django.contrib.auth.models import AbstractUser
from cloudinary.models import CloudinaryField

class Usuario(AbstractUser):
    RutUsuario = models.CharField(max_length=12, unique=True, null=False, blank=False)
    NombreUsuario = models.CharField(max_length=30, null=False, blank=False)
    ApellidoUsuario = models.CharField(max_length=30, null=True, blank=True)
    ContraseñaUsuario = models.CharField(max_length=128, null=False, blank=False)
    TipoUsuario = models.CharField(max_length=20)
    EdadUsuario = models.PositiveIntegerField(null=True, blank=True)
    GmailUsuario = models.EmailField(max_length=254, null=False, blank=False)
    TelefonoUsuario = models.CharField(max_length=15, null=True, blank=True)
    FotoUsuario = CloudinaryField('imagen', folder='usuarios/', null=True, blank=True)

    class Meta:
        db_table = 'Usuario'  # Nombre de la tabla en la base de datos
        verbose_name = 'Usuario'  # Nombre singular para el admin de Django
        verbose_name_plural = 'Usuarios'  # Nombre plural para el admin de Django
        ordering = ['RutUsuario']  # Ordenamiento por defecto (por RUT en este caso)