from django.db import models
from cloudinary.models import CloudinaryField
from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError
import cloudinary
import cloudinary.api
from cloudinary.exceptions import Error as CloudinaryError
import logging
import requests
import os
from datetime import date
from django.utils import timezone


logger = logging.getLogger(__name__)




#------------------------------------------------------------------------------
#------------------------------GESTOR PROVEEDORES------------------------------
#------------------------------------------------------------------------------

#------------------------------MODULO PROVEEDOR------------------------------
class Proveedor(models.Model):
    # Campos obligatorios y unicos
    # Campos obligatorios con restricciones de unicidad (1FN)
    NombreProveedor = models.CharField(max_length=100, unique=True,null=False, blank=False)
    RutProveedor = models.CharField(max_length=12, unique=True,null=False, blank=False,
        validators=[
            RegexValidator(
                regex=r'^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9kK]$',
                message='RUT debe tener formato XX.XXX.XXX-X'
            )
        ]
    )
    MarcaProveedor = models.CharField(max_length=100,unique=True ,null=False, blank=False)
    # --------------Campos opcionales--------------
    ComentarioProveedor = models.TextField(null=True, blank=True)
    # Campos de ubicación
    CiudadProveedor = models.CharField(max_length=100,null=True, blank=True)
    RegionProveedor = models.CharField(max_length=100,null=True, blank=True)
    PaisProveedor = models.CharField(max_length=100,null=True, blank=True)
    # Campos de contacto y multimedia
    TelefonoProveedor = models.CharField(max_length=15,null=True, blank=True)
    FotoProveedor = CloudinaryField('imagen',folder='proveedores/',null=True, blank=True)
    
    # Campos de auditoría
    FechaCreacionProveedor = models.DateTimeField(auto_now_add=True)
    FechaModificacionProveedor = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Proveedor"
        verbose_name_plural = "Proveedores"
        ordering = ['NombreProveedor']  # Cambiado a NombreProveedor
        
    def clean(self):
        if self.RutProveedor:
            self.RutProveedor = self.RutProveedor.upper()
            

            
#------------------------------MODULO FACTURA------------------------------
class Factura(models.Model):
    # Campos obligatorios
    FechaEmision = models.DateField(null=False, blank=False,verbose_name="Fecha de Emisión")
    # Campos multimedia opcionales
    FotoFactura = CloudinaryField("Foto de Factura",folder='facturas/',null=True, blank=True)
    DocumentoFactura = CloudinaryField("Documento de Factura",folder='facturas/documentos/',resource_type='raw',null=True, blank=True)
    
    # Este campo es NECESARIO mantenerlo
    documento_asset_id = models.CharField("Asset ID del Documento",max_length=255,blank=True,null=True,help_text="ID único del documento en Cloudinary")

    # Campo de relación
    Proveedor = models.ForeignKey(
        'Proveedor',
        on_delete=models.CASCADE,
        null=False, 
        blank=False,
        verbose_name="Proveedor"
    )
    
    class Meta:
        verbose_name = "Factura"
        verbose_name_plural = "Facturas"
        ordering = ['-FechaEmision']

    def __str__(self):
        return f"Factura {self.id} - {self.FechaEmision} - {self.Proveedor}"
#------------------------------MODULO ENVIO------------------------------
class Envio(models.Model):
    # Definición de choices para TipoEnvio
    TIPO_CHOICES = [
        ('material', 'Material'),
        ('herramienta', 'Herramienta'),
    ]

    NombreEnvio = models.CharField(max_length=100, null=False, blank=False)
    CantidadEnvio = models.PositiveIntegerField(null=False, blank=False)
    PrecioEnvio = models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False)
    TotalEnvio = models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False, editable=False)
    TipoEnvio = models.CharField(
        max_length=50, 
        null=False, 
        blank=False,
        choices=TIPO_CHOICES,
        help_text="Seleccione si el envío es de material o herramienta"
    )
    
    # Campos opcionales
    FechaCompraEnvio = models.DateField(auto_now_add=True)  # Se establece automáticamente cuando se crea el envío
    EnvioRecibido = models.BooleanField(default=False)
    DiasTranscurridos = models.IntegerField(default=0, editable=False)  # Contador de días
    DescripcionEnvio = models.TextField(null=True, blank=True)
    FotoEnvio = CloudinaryField('imagen', folder='envios/', null=True, blank=True)
    Proveedor = models.ForeignKey('Proveedor', on_delete=models.CASCADE, null=False, blank=False)

    class Meta:
        verbose_name = "Envío"
        verbose_name_plural = "Envíos"
        ordering = ['-FechaCompraEnvio']
    
    def save(self, *args, **kwargs):
        # Calcula el total
        self.TotalEnvio = self.CantidadEnvio * self.PrecioEnvio
        
        # Si es un nuevo envío, establece la fecha de compra
        if not self.pk:  # Si es un nuevo objeto
            self.FechaCompraEnvio = date.today()
        
        # Actualiza los días transcurridos si no está recibido
        if not self.EnvioRecibido:
            self.DiasTranscurridos = (date.today() - self.FechaCompraEnvio).days
        
        super(Envio, self).save(*args, **kwargs)
    
    @property
    def dias_transcurridos_actual(self):
        """
        Calcula los días transcurridos en tiempo real
        """
        if self.EnvioRecibido:
            return self.DiasTranscurridos
        return (date.today() - self.FechaCompraEnvio).days
    
    
    
    
    
    
