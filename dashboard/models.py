from django.db import models
from cloudinary.models import CloudinaryField
from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError

#------------------------------------------------------------------------------
#------------------------------GESTOR PROVEEDORES------------------------------
#------------------------------------------------------------------------------

#------------------------------MODULO PROVEEDOR------------------------------
class Proveedor(models.Model):
    # Campos obligatorios y unicos
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
    
    class Meta:
        verbose_name = "Proveedor"
        verbose_name_plural = "Proveedores"
        ordering = ['NombreProveedor']  # Cambiado a NombreProveedor
        
    def clean(self):
        if self.RutProveedor:
            self.RutProveedor = self.RutProveedor.upper()
            
#------------------------------MODULO FACTURA------------------------------
class Factura(models.Model):
    # Campos obligatorios y únicos
    FechaEmision = models.DateField(null=False, blank=False)
    # Campos multimedia
    FotoFactura = CloudinaryField('imagen',folder='facturas/',null=True, blank=True)
    # Campo FK
    Proveedor = models.ForeignKey('Proveedor',on_delete=models.CASCADE,null=False, blank=False)
    class Meta:
        verbose_name = "Factura"
        verbose_name_plural = "Facturas"
        ordering = ['-FechaEmision']  # Ordena por fecha de emisión descendente

#------------------------------MODULO ENVIO------------------------------
class Envio(models.Model):
    # Campos obligatorios
    NombreEnvio = models.CharField(max_length=100, null=False, blank=False)
    CantidadEnvio = models.PositiveIntegerField(null=False, blank=False)
    PrecioEnvio = models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False)
    TotalEnvio = models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False,editable=False)
    TipoEnvio = models.CharField(max_length=50, null=False, blank=False)
    # Campos opcionales
    FechaCompraEnvio = models.DateField(null=True, blank=True)
    EnvioRecibido = models.BooleanField(default=False)
    FechaRecibida = models.DateField(null=True, blank=True)
    DescripcionEnvio = models.TextField(null=True, blank=True)
    # Campo multimedia
    FotoEnvio = CloudinaryField('imagen', folder='envios/', null=True, blank=True)
    # Campo FK
    Proveedor = models.ForeignKey('Proveedor', on_delete=models.CASCADE, null=False, blank=False)
    class Meta:
        verbose_name = "Envío"
        verbose_name_plural = "Envíos"
        ordering = ['-FechaCompraEnvio']
    
    def clean(self):
        # Validación adicional para asegurar que el total sea correcto
        if self.CantidadEnvio and self.PrecioEnvio:
            total_calculado = self.CantidadEnvio * self.PrecioEnvio
            if self.TotalEnvio and self.TotalEnvio != total_calculado:
                raise ValidationError('El total debe ser igual a cantidad * precio')
        
    def save(self, *args, **kwargs):
        # Calcula el total antes de guardar
        self.TotalEnvio = self.CantidadEnvio * self.PrecioEnvio
        super(Envio, self).save(*args, **kwargs)