from django.db import models
from django.contrib.auth.models import User
from cloudinary.models import CloudinaryField
from django.contrib.auth.hashers import make_password
from django.core.exceptions import ValidationError
import re

class Usuario(models.Model):
    TIPO_USUARIO_CHOICES = [
        ('Administrador', 'Administrador'),
        ('Colaborador', 'Colaborador'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=False, blank=False)
    RutUsuario = models.CharField(max_length=12, unique=True, null=False, blank=False)
    TipoUsuario = models.CharField(
        max_length=20, 
        choices=TIPO_USUARIO_CHOICES,
        null=False, 
        blank=False
    )
    EdadUsuario = models.PositiveIntegerField(null=True, blank=True)
    TelefonoUsuario = models.CharField(max_length=15, null=True, blank=True)
    FotoUsuario = CloudinaryField('imagen', folder='usuarios/', null=True, blank=True)

    class Meta:
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"

    def clean(self):
        super().clean()
        if self.RutUsuario:
            self.validar_rut_chileno(self.RutUsuario)

    @staticmethod
    def validar_rut_chileno(rut):
        # Eliminar puntos y convertir guión en K si es necesario
        rut = rut.replace(".", "").replace("-", "").upper()
        
        # Verificar el formato usando expresión regular
        if not re.match(r'^[0-9]{7,8}[0-9K]$', rut):
            raise ValidationError('El formato del RUT no es válido. Debe ser como "12345678-9" o "12.345.678-9"')

        # Separar el cuerpo del dígito verificador
        cuerpo = rut[:-1]
        dv = rut[-1]

        try:
            # Convertir el cuerpo a integer
            cuerpo = int(cuerpo)
        except ValueError:
            raise ValidationError('El RUT no es válido')

        # Calcular el dígito verificador
        suma = 0
        multiplicador = 2
        
        # Reversar el cuerpo y multiplicar cada dígito por el multiplicador
        for d in reversed(str(cuerpo)):
            suma += int(d) * multiplicador
            multiplicador = multiplicador + 1 if multiplicador < 7 else 2

        dv_esperado = str(11 - (suma % 11))
        if dv_esperado == '11':
            dv_esperado = '0'
        elif dv_esperado == '10':
            dv_esperado = 'K'

        # Comparar el dígito verificador calculado con el proporcionado
        if dv != dv_esperado:
            raise ValidationError('El RUT no es válido (dígito verificador incorrecto)')

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)