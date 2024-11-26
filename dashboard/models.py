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
from django.dispatch import receiver
from django.db.models.signals import post_save
from django.contrib.auth.models import User




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
    # Nuevo campo para número de factura
    NumeroFactura = models.CharField(
        max_length=50, 
        verbose_name="Número de Factura",
        null=False,
        blank=False,
        help_text="Número o identificador único de la factura"
    )
    
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
        # Actualizado para incluir el número de factura
        return f"Factura {self.NumeroFactura} - {self.FechaEmision} - {self.Proveedor}"
#------------------------------MODULO ENVIO------------------------------
class Envio(models.Model):
    TIPO_CHOICES = [
        ('material', 'Material'),
        ('herramienta', 'Herramienta'),
    ]

    id = models.AutoField(primary_key=True)
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
    FechaCompraEnvio = models.DateField(auto_now_add=True) 
    EnvioRecibido = models.BooleanField(default=False)
    DiasTranscurridos = models.IntegerField(default=0, editable=False) #campo propio de la tabla Envio
    DescripcionEnvio = models.TextField(null=True, blank=True)
    FotoEnvio = CloudinaryField('imagen', folder='envios/', null=True, blank=True)
    Proveedor = models.ForeignKey('Proveedor', on_delete=models.CASCADE, null=False, blank=False)
    HoraCreacion = models.DateTimeField(default=timezone.now)
    
    Factura = models.ForeignKey(
        'Factura',
        on_delete=models.SET_NULL,  # Si se elimina la factura, el campo quedará como NULL
        null=True,  # Permite valores nulos en la base de datos
        blank=True, # Permite dejarlo vacío en formularios
        verbose_name="Factura",
        related_name='envios'
    )

    class Meta:
        verbose_name = "Envío"
        verbose_name_plural = "Envíos"
        ordering = ['-FechaCompraEnvio']

    def save(self, *args, **kwargs):
        # Validar que el ID 1 y 2 estén reservados para el tipo correcto
        if self.pk in [1, 2]:
            if self.pk == 1 and self.TipoEnvio != 'material':
                raise ValueError("El ID 1 está reservado para envíos de tipo material")
            if self.pk == 2 and self.TipoEnvio != 'herramienta':
                raise ValueError("El ID 2 está reservado para envíos de tipo herramienta")

        self.TotalEnvio = self.CantidadEnvio * self.PrecioEnvio
        
        if not self.pk:
            self.FechaCompraEnvio = date.today()
        
        if not self.EnvioRecibido:
            self.DiasTranscurridos = (date.today() - self.FechaCompraEnvio).days
        
        super(Envio, self).save(*args, **kwargs)
    def __str__(self):
        # Si tiene factura, muestra la información de la factura
        # Si no tiene factura, indica "Sin factura"
        factura_info = f"Factura: {self.Factura}" if self.Factura else "Sin factura"
        return f"Envío {self.id} - {factura_info}"

    @property
    def dias_transcurridos_actual(self):
        if self.EnvioRecibido:
            return self.DiasTranscurridos
        return (date.today() - self.FechaCompraEnvio).days

#-------------------------------------GESTOR MATERIAL-------------------------------------
class Material(models.Model):
    NombreMaterial = models.CharField(max_length=100, null=False, blank=False)
    StockMaterial = models.PositiveIntegerField(null=False, blank=False)
    PrecioMaterial = models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False)
    TotalMaterial = models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False, editable=False)
    FechaCompraMaterial = models.DateField(auto_now_add=True)
    DescripcionMaterial = models.TextField(null=True, blank=True)
    #-----Campos 
    ColorMaterial = models.CharField(max_length=50, null=True, blank=True)
    PesoMaterial = models.CharField(max_length=50, null=True, blank=True)
    DimensionesMaterial = models.CharField(max_length=100, null=True, blank=True)
    DetalleMaterial = models.TextField(null=True, blank=True)
    EstadoMaterial = models.CharField(max_length=50, null=True, blank=True)  # Añadido null=True, blank=True
    UbicacionMaterial = models.CharField(max_length=100, null=True, blank=True)  # Añadido null=True, blank=True
    FotoMaterial = CloudinaryField('imagen', folder='materiales/', null=True, blank=True)
    Envio = models.ForeignKey(Envio, on_delete=models.CASCADE, null=True, blank=True)
    Proveedor = models.ForeignKey('Proveedor', on_delete=models.SET_NULL, null=True, blank=True)
    RegistroFacturaMaterial = models.CharField(max_length=2, choices=[('Si', 'Si'), ('No', 'No')], default='No')

    def save(self, *args, **kwargs):
        self.TotalMaterial = self.StockMaterial * self.PrecioMaterial
        
        if self.Envio and self.Envio.EnvioRecibido:
            self.RegistroFacturaMaterial = 'Si'
        else:
            self.RegistroFacturaMaterial = 'No'
            
        super(Material, self).save(*args, **kwargs)
        
class Herramienta(models.Model):
    NombreHerramienta = models.CharField(max_length=100, null=False, blank=False)
    StockHerramienta = models.PositiveIntegerField(null=False, blank=False)
    PrecioHerramienta = models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False)
    TotalHerramienta = models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False, editable=False)
    FechaCompraHerramienta = models.DateField(auto_now_add=True)
    DescripcionHerramienta = models.TextField(null=True, blank=True)
    # Modificados para ser opcionales
    MarcaHerramienta = models.CharField(max_length=100, null=True, blank=True)  
    ModeloHerramienta = models.CharField(max_length=100, null=True, blank=True)  
    UbicacionHerramienta = models.CharField(max_length=100, null=True, blank=True)  
    FotoHerramienta = CloudinaryField('imagen', folder='herramientas/', null=True, blank=True)
    Envio = models.ForeignKey(Envio, on_delete=models.CASCADE, null=True, blank=True)
    Proveedor = models.ForeignKey('Proveedor', on_delete=models.SET_NULL, null=True, blank=True)
    RegistroFacturaHerramienta = models.CharField(max_length=2, choices=[('Si', 'Si'), ('No', 'No')], default='No')

    def save(self, *args, **kwargs):
        self.TotalHerramienta = self.StockHerramienta * self.PrecioHerramienta
        
        if self.Envio and self.Envio.EnvioRecibido:
            self.RegistroFacturaHerramienta = 'Si'
        else:
            self.RegistroFacturaHerramienta = 'No'
            
        super(Herramienta, self).save(*args, **kwargs)
@receiver(post_save, sender=Envio)
def crear_material_o_herramienta(sender, instance, created, **kwargs):
    # Solo proceder si el envío está marcado como recibido
    if instance.EnvioRecibido:
        # Si es material, eliminamos herramienta si existe y creamos material
        if instance.TipoEnvio == 'material':
            # Eliminar herramienta si existe
            Herramienta.objects.filter(Envio=instance).delete()
            
            # Crear material si no existe
            if not Material.objects.filter(Envio=instance).exists():
                Material.objects.create(
                    NombreMaterial=instance.NombreEnvio,
                    StockMaterial=instance.CantidadEnvio,
                    PrecioMaterial=instance.PrecioEnvio,
                    DescripcionMaterial=instance.DescripcionEnvio,
                    FotoMaterial=instance.FotoEnvio,
                    Envio=instance,
                    Proveedor=instance.Proveedor,
                    EstadoMaterial='Nuevo',  # Ya estaba correcto para Material
                    UbicacionMaterial='Por asignar'
                )
        
        # Si es herramienta, eliminamos material si existe y creamos herramienta
        elif instance.TipoEnvio == 'herramienta':
            # Eliminar material si existe
            Material.objects.filter(Envio=instance).delete()
            
            # Crear herramienta si no existe
            if not Herramienta.objects.filter(Envio=instance).exists():
                Herramienta.objects.create(
                    NombreHerramienta=instance.NombreEnvio,
                    StockHerramienta=instance.CantidadEnvio,
                    PrecioHerramienta=instance.PrecioEnvio,
                    DescripcionHerramienta=instance.DescripcionEnvio,
                    FotoHerramienta=instance.FotoEnvio,
                    Envio=instance,
                    Proveedor=instance.Proveedor,
                    MarcaHerramienta='Por especificar',
                    ModeloHerramienta='Por especificar',
                    UbicacionHerramienta='Por asignar',
                    EstadoHerramienta='Nuevo'  # Agregado estado 'Nuevo' para Herramienta
                )
    else:
        # Si el envío no está marcado como recibido, eliminamos ambos registros si existen
        Material.objects.filter(Envio=instance).delete()
        Herramienta.objects.filter(Envio=instance).delete()

class Categoria(models.Model):
    # Campos obligatorios
    NombreCategoria = models.CharField(max_length=100, unique=True, null=False, blank=False)
    # Campos opcionales
    DescripcionCategoria = models.TextField(null=True, blank=True)
    StockCategoria = models.PositiveIntegerField(default=0, editable=False)  # Campo automático, no editable
    FotoCategoria = CloudinaryField('imagen', folder='categorias/', null=True, blank=True)

    class Meta:
        verbose_name = "Categoría"
        verbose_name_plural = "Categorías"
        ordering = ['NombreCategoria']

    def __str__(self):
        return self.NombreCategoria

class Producto(models.Model):
    # Campos obligatorios
    NombreProducto = models.CharField(max_length=100, null=False, blank=False)
    StockProductoInicial = models.PositiveIntegerField(
        null=False, 
        blank=False,
        help_text="Cantidad inicial del producto"
    )
    StockProductoActual = models.PositiveIntegerField(
        editable=False,  # Hace que el campo no sea editable en el admin
        help_text="Cantidad actual disponible (se actualiza automáticamente)"
    )
    PrecioUnitarioProducto = models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False)
    PrecioTotalProducto = models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False, editable=False)
    Categoria = models.ForeignKey('Categoria', on_delete=models.CASCADE, null=False, blank=False, related_name='productos')
    
    # Campos de control de stock
    CantidadProductoVendido = models.PositiveIntegerField(default=0, editable=False)
    CantidadProductoDesechado = models.PositiveIntegerField(default=0, editable=False)
    
    # Campos opcionales
    DescripcionProducto = models.TextField(null=True, blank=True)
    UbicacionProducto = models.CharField(max_length=100, null=True, blank=True)
    EstadoProducto = models.CharField(max_length=50, null=True, blank=True)
    FechaProducto = models.DateField(auto_now_add=True)
    DiasProducto = models.IntegerField(default=0, editable=False)
    ProductoVendido = models.BooleanField(default=False, editable=False)
    HoraCreacion = models.DateTimeField(default=timezone.now)
    FotoProducto = CloudinaryField('imagen', folder='productos/', null=True, blank=True)

    class Meta:
        verbose_name = "Producto"
        verbose_name_plural = "Productos"
        ordering = ['-FechaProducto']

    def save(self, *args, **kwargs):
        # Si es un nuevo producto, inicializar el stock actual
        if not self.pk:
            self.StockProductoActual = self.StockProductoInicial
            self.FechaProducto = date.today()
        else:
            # Actualizar el stock actual basado en ventas y desechos
            self.StockProductoActual = max(
                0,  # Asegura que nunca sea negativo
                self.StockProductoInicial - (self.CantidadProductoVendido + self.CantidadProductoDesechado)
            )

        # Calcular el precio total basado en el stock actual
        self.PrecioTotalProducto = self.StockProductoActual * self.PrecioUnitarioProducto
        
        # Actualizar días transcurridos
        self.DiasProducto = (date.today() - self.FechaProducto).days
            
        # Actualizar estado de venta
        self.ProductoVendido = self.StockProductoActual == 0
        
        # Guardar el producto
        super(Producto, self).save(*args, **kwargs)
        
        # Actualizar el stock de la categoría
        total_stock = Producto.objects.filter(
            Categoria=self.Categoria
        ).aggregate(
            total=models.Sum('StockProductoActual')
        )['total'] or 0
        
        self.Categoria.StockCategoria = total_stock
        self.Categoria.save()

    def desechar_cantidad(self, cantidad):
        """Método para desechar una cantidad de producto"""
        if cantidad > self.StockProductoActual:
            raise ValidationError(f"No hay suficiente stock. Disponible: {self.StockProductoActual}")
        
        self.CantidadProductoDesechado += cantidad
        self.save()

    def vender_cantidad(self, cantidad):
        """Método para vender una cantidad de producto"""
        if cantidad > self.StockProductoActual:
            raise ValidationError(f"No hay suficiente stock. Disponible: {self.StockProductoActual}")
        
        self.CantidadProductoVendido += cantidad
        self.save()

    def __str__(self):
        return f"{self.NombreProducto} - Stock: {self.StockProductoActual}/{self.StockProductoInicial}"

    @property
    def porcentaje_stock_disponible(self):
        """Calcula el porcentaje de stock disponible"""
        if self.StockProductoInicial == 0:
            return 0
        return (self.StockProductoActual / self.StockProductoInicial) * 100
class Cliente(models.Model):
    TIPO_CHOICES = [
        ('particular', 'Particular'),
        ('empresa', 'Empresa'),
    ]
    # Campos obligatorios
    NombreCliente = models.CharField(max_length=100, null=False, blank=False)
    ApellidoCliente = models.CharField(max_length=100, null=False, blank=False)
    RutCliente = models.CharField(max_length=12, unique=True,null=False, blank=False,
        validators=[
            RegexValidator(
                regex=r'^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9kK]$',
                message='RUT debe tener formato XX.XXX.XXX-X'
            )
        ]
    )
    TipoCliente = models.CharField(max_length=20,choices=TIPO_CHOICES,default='particular')
    # Campos opcionales
    NombreCompañia = models.CharField(max_length=100, null=True, blank=True)
    ComentarioCliente = models.TextField(null=True, blank=True)
    TelefonoCliente = models.CharField(max_length=15, null=True, blank=True)
    FechaCliente = models.DateField(auto_now_add=True)
    # Campos de auditoría
    Usuario = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Usuario que registró al cliente"
    )
    FechaRegistro = models.DateTimeField(auto_now_add=True)
    UltimaModificacion = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Cliente"
        verbose_name_plural = "Clientes"
        ordering = ['NombreCliente']

    def __str__(self):
        if self.TipoCliente == 'empresa':
            return f"{self.NombreCompañia} - {self.RutCliente}"
        return f"{self.NombreCliente} {self.ApellidoCliente} - {self.RutCliente}"

class Ventas(models.Model):
    # Campos obligatorios
    NombreVenta = models.CharField(max_length=100, null=False, blank=False)
    CantidadVenta = models.PositiveIntegerField(null=False, blank=False)
    PrecioVenta = models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False)
    PrecioTotalVenta = models.DecimalField(max_digits=10, decimal_places=2, editable=False)
    FechaVenta = models.DateField(auto_now_add=True)
    
    # Relaciones
    Producto = models.ForeignKey(
        'Producto', 
        on_delete=models.PROTECT,
        related_name='ventas'
    )
    Cliente = models.ForeignKey(
        'Cliente', 
        on_delete=models.SET_DEFAULT,
        related_name='compras',
        null=True, 
        blank=True,
        default=None,
        help_text="Cliente que realizó la compra"
    )
    
    # Campo de auditoría
    Usuario = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL,
        null=True,
        help_text="Usuario que registró la venta"
    )
    FechaRegistro = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Venta"
        verbose_name_plural = "Ventas"
        ordering = ['-FechaVenta']

    def clean(self):
        # Verificar stock disponible usando el StockProductoActual
        if self.CantidadVenta > self.Producto.StockProductoActual:
            raise ValidationError(
                f"No hay suficiente stock. Disponible: {self.Producto.StockProductoActual}"
            )

    def save(self, *args, **kwargs):
        if not self.pk:  # Solo para nuevas ventas
            # Validar stock disponible
            self.clean()
            
            # Calcular precio total
            self.PrecioTotalVenta = self.CantidadVenta * self.PrecioVenta
            
            # Guardar la venta
            super().save(*args, **kwargs)
            
            # Actualizar el stock del producto usando el método vender_cantidad
            try:
                self.Producto.vender_cantidad(self.CantidadVenta)
            except ValidationError as e:
                # Si hay un error al actualizar el stock, revertir la venta
                self.delete()
                raise e
        else:
            # Para actualizaciones de ventas existentes, solo guardar los cambios
            # sin modificar el stock
            super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        # Al eliminar una venta, restaurar el stock vendido
        if self.pk:
            self.Producto.CantidadProductoVendido -= self.CantidadVenta
            self.Producto.save()
        super().delete(*args, **kwargs)

    def __str__(self):
        cliente = "Cliente no especificado" if self.Cliente is None else str(self.Cliente)
        return f"Venta {self.id} - {self.Producto.NombreProducto} a {cliente}"

    @property
    def nombre_cliente(self):
        """Retorna el nombre del cliente o 'Cliente no especificado'"""
        return str(self.Cliente) if self.Cliente else "Cliente no especificado"