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
import re




logger = logging.getLogger(__name__)




#------------------------------------------------------------------------------
#------------------------------GESTOR PROVEEDORES------------------------------
#------------------------------------------------------------------------------

#------------------------------MODULO PROVEEDOR------------------------------
class Proveedor(models.Model):
    # Campos obligatorios con restricciones de unicidad (1FN)
    NombreProveedor = models.CharField(max_length=100, unique=True, null=False, blank=False)
    RutProveedor = models.CharField(
        max_length=12, 
        unique=True,
        null=False, 
        blank=False,
        validators=[
            RegexValidator(
                regex=r'^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9kK]$',
                message='RUT debe tener formato XX.XXX.XXX-X'
            )
        ]
    )
    MarcaProveedor = models.CharField(max_length=100, unique=True, null=False, blank=False)
    # --------------Campos opcionales--------------
    ComentarioProveedor = models.TextField(null=True, blank=True)
    # Campos de ubicación
    CiudadProveedor = models.CharField(max_length=100, null=True, blank=True)
    RegionProveedor = models.CharField(max_length=100, null=True, blank=True)
    PaisProveedor = models.CharField(max_length=100, null=True, blank=True)
    # Campos de contacto y multimedia
    TelefonoProveedor = models.CharField(max_length=15, null=True, blank=True)
    FotoProveedor = CloudinaryField('imagen', folder='proveedores/', null=True, blank=True)
    
    # Campos de auditoría
    FechaCreacionProveedor = models.DateTimeField(auto_now_add=True)
    FechaModificacionProveedor = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Proveedor"
        verbose_name_plural = "Proveedores"
        ordering = ['NombreProveedor']
        
    def clean(self):
        if self.RutProveedor:
            self.RutProveedor = self.RutProveedor.upper()
            self.validar_rut_chileno()

    def validar_rut_chileno(self):
        """Valida que el RUT chileno sea válido"""
        rut = self.RutProveedor
        
        # Obtener el cuerpo y dígito verificador
        rut_limpio = rut.replace(".", "").replace("-", "").upper()
        cuerpo = rut_limpio[:-1]
        dv = rut_limpio[-1]
        
        try:
            cuerpo = int(cuerpo)
            if cuerpo == 0:
                raise ValidationError({
                    'RutProveedor': 'RUT no válido'
                })
        except ValueError:
            raise ValidationError({
                'RutProveedor': 'RUT no válido'
            })
        
        # Calcular el dígito verificador
        suma = 0
        multiplicador = 2
        
        for d in reversed(str(cuerpo)):
            suma += int(d) * multiplicador
            multiplicador = multiplicador + 1 if multiplicador < 7 else 2
        
        dv_esperado = str(11 - (suma % 11))
        if dv_esperado == '11':
            dv_esperado = '0'
        elif dv_esperado == '10':
            dv_esperado = 'K'
        
        if dv != dv_esperado:
            raise ValidationError({
                'RutProveedor': 'RUT no válido (dígito verificador incorrecto)'
            })

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
        
    def __str__(self):
        return f"{self.NombreProveedor} - {self.MarcaProveedor}"
            

            
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
    StockOriginal = models.PositiveIntegerField(editable=False, help_text="Stock inicial con el que se registró el material")
    PrecioMaterial = models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False)
    TotalMaterial = models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False, editable=False)
    
    FechaCompraMaterial = models.DateField(auto_now_add=True)
    # Campos opcionales
    DescripcionMaterial = models.TextField(null=True, blank=True)
    ColorMaterial = models.CharField(max_length=50, null=True, blank=True)
    PesoMaterial = models.CharField(max_length=50, null=True, blank=True)
    DimensionesMaterial = models.CharField(max_length=100, null=True, blank=True)
    DetalleMaterial = models.TextField(null=True, blank=True)
    EstadoMaterial = models.CharField(max_length=50, null=True, blank=True)
    UbicacionMaterial = models.CharField(max_length=100, null=True, blank=True)
    FotoMaterial = CloudinaryField('imagen', folder='materiales/', null=True, blank=True)
    # Relaciones
    Envio = models.ForeignKey(Envio, on_delete=models.CASCADE, null=True, blank=True)
    Proveedor = models.ForeignKey('Proveedor', on_delete=models.SET_NULL, null=True, blank=True)
    RegistroFacturaMaterial = models.CharField(max_length=2, choices=[('Si', 'Si'), ('No', 'No')], default='No')
    class Meta:
        verbose_name = "Material"
        verbose_name_plural = "Materiales"
        ordering = ['NombreMaterial']

    def __str__(self):
        return f"{self.NombreMaterial} (Stock: {self.StockMaterial}/{self.StockOriginal})"
    def save(self, *args, **kwargs):
        # Si es un nuevo registro (no tiene pk), establecer StockOriginal igual al StockMaterial inicial
        if not self.pk:
            self.StockOriginal = self.StockMaterial
        
        self.TotalMaterial = self.StockMaterial * self.PrecioMaterial
        
        if self.Envio and self.Envio.EnvioRecibido:
            self.RegistroFacturaMaterial = 'Si'
        else:
            self.RegistroFacturaMaterial = 'No'
            
        super(Material, self).save(*args, **kwargs)

    def actualizar_stock(self, cantidad_usada):
        """
        Actualiza el stock del material y valida que haya suficiente.
        
        Args:
            cantidad_usada (int): Cantidad a descontar del stock
            
        Raises:
            ValidationError: Si no hay suficiente stock
        """
        if cantidad_usada > self.StockMaterial:
            raise ValidationError(
                f"Stock insuficiente de {self.NombreMaterial}. "
                f"Disponible: {self.StockMaterial}, Solicitado: {cantidad_usada}"
            )
        
        self.StockMaterial -= cantidad_usada
        self.save()

    def restaurar_stock(self, cantidad):
        """
        Restaura una cantidad al stock del material.
        
        Args:
            cantidad (int): Cantidad a restaurar al stock
        """
        self.StockMaterial += cantidad
        if self.StockMaterial > self.StockOriginal:
            raise ValidationError(
                f"La cantidad a restaurar excede el stock original. "
                f"Stock Original: {self.StockOriginal}, Stock Actual: {self.StockMaterial}"
            )
        self.save()

    @property
    def stock_usado(self):
        """Retorna la cantidad de material que se ha usado en productos"""
        return self.StockOriginal - self.StockMaterial

    @property
    def porcentaje_stock_disponible(self):
        """Calcula el porcentaje de stock disponible"""
        if self.StockOriginal == 0:
            return 0
        return (self.StockMaterial / self.StockOriginal) * 100
        
class Herramienta(models.Model):
    NombreHerramienta = models.CharField(max_length=100, null=False, blank=False)
    StockHerramienta = models.PositiveIntegerField(null=False, blank=False)
    PrecioHerramienta = models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False)
    TotalHerramienta = models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False, editable=False)
    FechaCompraHerramienta = models.DateField(auto_now_add=True)
    # Modificados para ser opcionales
    DescripcionHerramienta = models.TextField(null=True, blank=True)
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
                    EstadoMaterial='Nuevo',
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
                    UbicacionHerramienta='Por asignar'
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
    StockCategoria = models.PositiveIntegerField(default=0, editable=False)
    FotoCategoria = CloudinaryField('imagen', folder='categorias/', null=True, blank=True)
    # Campos de tracking
    CantidadCategoriaPerdida = models.PositiveIntegerField(default=0,editable=False,help_text="Cantidad total de productos perdidos en esta categoría")
    CantidadCategoriaVenta = models.PositiveIntegerField(default=0,editable=False,help_text="Cantidad total de productos vendidos en esta categoría")
    TotalCategoriaVenta = models.DecimalField(max_digits=12,decimal_places=2,default=0,editable=False,
help_text="Total acumulado de ventas en esta categoría"
    )
    TotalCategoriaPerdida = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        editable=False,
        help_text="Total acumulado de pérdidas en esta categoría"
    )

    class Meta:
        verbose_name = "Categoría"
        verbose_name_plural = "Categorías"
        ordering = ['NombreCategoria']

    def __str__(self):
        return self.NombreCategoria

    def actualizar_totales(self):
        """Actualiza todos los totales de la categoría"""
        productos = self.productos.all()
        
        # Actualizar cantidades
        self.CantidadCategoriaPerdida = sum(p.CantidadProductoDesechado for p in productos)
        self.CantidadCategoriaVenta = sum(p.CantidadProductoVendido for p in productos)
        
        # Actualizar totales directamente
        self.TotalCategoriaVenta = sum(
            v.PrecioTotalVenta 
            for p in productos 
            for v in p.ventas.all()
        )
        
        self.TotalCategoriaPerdida = sum(
            p.ValorTotalPerdida 
            for p in productos 
            for p in p.perdidas.all()
        )
        
        self.save()


class Producto(models.Model):
    # Campos obligatorios
    NombreProducto = models.CharField(max_length=100, null=False, blank=False)
    StockProductoInicial = models.PositiveIntegerField(null=False, blank=False, help_text="Cantidad inicial del producto")
    StockProductoActual = models.PositiveIntegerField(editable=False, help_text="Cantidad actual disponible (se actualiza automáticamente)")
    PrecioUnitarioProducto = models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False)
    PrecioTotalProducto = models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False, editable=False)
    Categoria = models.ForeignKey('Categoria', on_delete=models.CASCADE, null=True, blank=True, related_name='productos')
    Materiales = models.ManyToManyField(
        'Material',
        through='ProductoMaterial',
        related_name='productos'
    )
    
    # Campos de control de stock
    CantidadProductoVendido = models.PositiveIntegerField(default=0, editable=False)
    CantidadProductoDesechado = models.PositiveIntegerField(default=0, editable=False)
    
    # Campos opcionales
    DescripcionProducto = models.TextField(null=True, blank=True)
    UbicacionProducto = models.CharField(max_length=100, null=True, blank=True)
    EstadoProducto = models.CharField(max_length=50, null=True, blank=True)
    FechaProducto = models.DateField(auto_now_add=True)
    DiasProducto = models.IntegerField(default=0, editable=False)
    ProductoAgotado = models.BooleanField(default=False, editable=False)
    HoraCreacion = models.DateTimeField(default=timezone.now)
    FotoProducto = CloudinaryField('imagen', folder='productos/', null=True, blank=True)

    class Meta:
        verbose_name = "Producto"
        verbose_name_plural = "Productos"
        ordering = ['-FechaProducto']

    def save(self, *args, **kwargs):
        # Inicialización para nuevo producto
        if not self.pk:
            self.StockProductoActual = self.StockProductoInicial
            self.FechaProducto = date.today()
            self.PrecioTotalProducto = self.StockProductoInicial * self.PrecioUnitarioProducto
        
        # Actualizar días del producto
        self.DiasProducto = (date.today() - self.FechaProducto).days
        
        # Guardar el producto
        super(Producto, self).save(*args, **kwargs)
        
        # Actualizar el stock de la categoría si existe
        if self.Categoria:
            try:
                total_stock = Producto.objects.filter(
                    Categoria=self.Categoria
                ).aggregate(
                    total=models.Sum('StockProductoActual')
                ).get('total', 0) or 0
                
                self.Categoria.StockCategoria = total_stock
                self.Categoria.save()
            except Exception as e:
                print(f"Error al actualizar stock de categoría: {e}")

    def vender_cantidad(self, cantidad):
        """Método para vender una cantidad de producto"""
        cantidad = int(cantidad)  # Asegurarnos que es un entero
        
        # Refrescar el objeto desde la base de datos
        self.refresh_from_db()
        
        # Verificar contra StockProductoActual
        if cantidad > self.StockProductoActual:
            raise ValidationError(f"No hay suficiente stock. Disponible: {self.StockProductoActual}")
        
        # Actualizar la cantidad vendida
        nuevo_vendido = self.CantidadProductoVendido + cantidad
        nuevo_stock = self.StockProductoInicial - (nuevo_vendido + self.CantidadProductoDesechado)
        
        # Actualizamos usando update para evitar condiciones de carrera
        Producto.objects.filter(pk=self.pk).update(
            CantidadProductoVendido=nuevo_vendido,
            StockProductoActual=nuevo_stock,
            PrecioTotalProducto=nuevo_stock * self.PrecioUnitarioProducto,
            ProductoAgotado=nuevo_stock == 0
        )
        
        # Refrescar el objeto para reflejar los cambios
        self.refresh_from_db()

    def desechar_cantidad(self, cantidad):
        """Método para desechar una cantidad de producto"""
        cantidad = int(cantidad)  # Asegurarnos que es un entero
        
        # Refrescar el objeto desde la base de datos
        self.refresh_from_db()
        
        # Verificar contra StockProductoActual
        if cantidad > self.StockProductoActual:
            raise ValidationError(f"No hay suficiente stock. Disponible: {self.StockProductoActual}")
        
        # Actualizar la cantidad desechada
        nuevo_desechado = self.CantidadProductoDesechado + cantidad
        nuevo_stock = self.StockProductoInicial - (self.CantidadProductoVendido + nuevo_desechado)
        
        # Actualizamos usando update para evitar condiciones de carrera
        Producto.objects.filter(pk=self.pk).update(
            CantidadProductoDesechado=nuevo_desechado,
            StockProductoActual=nuevo_stock,
            PrecioTotalProducto=nuevo_stock * self.PrecioUnitarioProducto,
            ProductoAgotado=nuevo_stock == 0
        )
        
        # Refrescar el objeto para reflejar los cambios
        self.refresh_from_db()

    def __str__(self):
        return f"{self.NombreProducto} - Stock: {self.StockProductoActual}/{self.StockProductoInicial}"

    @property
    def porcentaje_stock_disponible(self):
        """Calcula el porcentaje de stock disponible"""
        if self.StockProductoInicial == 0:
            return 0
        return (self.StockProductoActual / self.StockProductoInicial) * 100
class ProductoMaterial(models.Model):
    # Relaciones con Producto y Material
    Producto = models.ForeignKey('Producto',on_delete=models.CASCADE,related_name='materiales_usados',null=False,blank=False,help_text="Producto en el que se usó el material")
    Material = models.ForeignKey(
    'Material',on_delete=models.CASCADE,related_name='productos_asociados',null=False,blank=False,
    help_text="Material utilizado en el producto"
)
    # Cantidad utilizada
    CantidadUsada = models.PositiveIntegerField(null=False,blank=False,help_text="Cantidad del material utilizada en este producto")
    # Campo de descripción
    DescripcionUso = models.TextField(null=True,blank=True,help_text="Descripción detallada de cómo se utilizó el material en el producto"
    )
    
    # Campos de auditoría
    FechaRegistro = models.DateTimeField(auto_now_add=True)
    UltimaModificacion = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Material del Producto"
        verbose_name_plural = "Materiales del Producto"
        unique_together = ['Producto', 'Material']
        ordering = ['Producto', 'Material']

    def clean(self):
        if not self.pk:  # Solo para nuevos registros
            # Verificar si hay suficiente stock disponible
            if self.Material.StockMaterial < self.CantidadUsada:
                raise ValidationError(
                    f"No hay suficiente stock del material '{self.Material.NombreMaterial}'. "
                    f"Disponible: {self.Material.StockMaterial}, Solicitado: {self.CantidadUsada}"
                )

    def save(self, *args, **kwargs):
        if not self.pk:  # Solo para nuevos registros
            # Validar el stock disponible
            self.clean()
            
            # Guardar el registro
            super().save(*args, **kwargs)
            
            # Usar el método actualizar_stock de Material
            self.Material.actualizar_stock(self.CantidadUsada)
        else:
            # Para actualizaciones, calcular la diferencia
            original = ProductoMaterial.objects.get(pk=self.pk)
            diferencia = self.CantidadUsada - original.CantidadUsada
            
            if diferencia > 0:
                # Si se necesita más material, actualizar stock
                self.Material.actualizar_stock(diferencia)
            elif diferencia < 0:
                # Si se necesita menos material, restaurar stock
                self.Material.restaurar_stock(abs(diferencia))
            
            super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        # Usar el método restaurar_stock de Material
        self.Material.restaurar_stock(self.CantidadUsada)
        super().delete(*args, **kwargs)

    def __str__(self):
        return f"{self.Producto.NombreProducto} - {self.Material.NombreMaterial} ({self.CantidadUsada})"

    @property
    def detalle_uso(self):
        """Retorna una cadena con el detalle de uso del material"""
        return f"Cantidad usada: {self.CantidadUsada} de {self.Material.StockOriginal} de {self.Material.NombreMaterial}"

    @property
    def detalle_uso_json(self):
        """Retorna un diccionario con el detalle de uso del material"""
        return {
            'cantidad_usada': self.CantidadUsada,
            'stock_original': self.Material.StockOriginal,
            'stock_actual': self.Material.StockMaterial,
            'nombre_material': self.Material.NombreMaterial
        }
        
class Perdidas(models.Model):
    # Campos obligatorios
    NombrePerdida = models.CharField(max_length=100, null=False, blank=False)
    CantidadPerdida = models.PositiveIntegerField(null=False, blank=False)
    ValorUnitarioPerdida = models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False)
    ValorTotalPerdida = models.DecimalField(max_digits=10, decimal_places=2, editable=False)
    FechaPerdida = models.DateField(auto_now_add=True)
    
    MOTIVO_CHOICES = [
        ('caducidad', 'Caducidad'),
        ('daño', 'Daño'),
        ('robo', 'Robo'),
        ('error_inventario', 'Error de Inventario'),
        ('otros', 'Otros')
    ]
    MotivoPerdida = models.CharField(
        max_length=20, 
        choices=MOTIVO_CHOICES, 
        default='otros'
    )
    
    # Relaciones
    Producto = models.ForeignKey('Producto', on_delete=models.CASCADE, related_name='perdidas')
    
    # Campos opcionales
    DescripcionPerdida = models.TextField(null=True, blank=True)
    Usuario = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        help_text="Usuario que registró la pérdida"
    )
    FechaRegistro = models.DateTimeField(auto_now_add=True)
    UltimaModificacion = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Pérdida"
        verbose_name_plural = "Pérdidas"
        ordering = ['-FechaPerdida']

    def save(self, *args, **kwargs):
        if not self.pk:
            self.ValorTotalPerdida = self.CantidadPerdida * self.ValorUnitarioPerdida
        super().save(*args, **kwargs)


    def __str__(self):
        return f"Pérdida de {self.Producto.NombreProducto} - {self.CantidadPerdida} unidades"

    @property
    def impacto_financiero(self):
        """Calcula el impacto financiero de la pérdida"""
        return {
            'valor_total': self.ValorTotalPerdida,
            'porcentaje_stock': (self.CantidadPerdida / self.Producto.StockProductoInicial) * 100 if self.Producto.StockProductoInicial > 0 else 0,
            'motivo': self.get_MotivoPerdida_display()
        }
    
class Ventas(models.Model):
    # Campos obligatorios
    NombreVenta = models.CharField(max_length=100, null=False, blank=False)
    CantidadVenta = models.PositiveIntegerField(null=False, blank=False)
    PrecioVenta = models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False)
    PrecioTotalVenta = models.DecimalField(max_digits=10, decimal_places=2, editable=False)
    FechaVenta = models.DateField(auto_now_add=True)
    cliente_eliminado = models.BooleanField(default=False)  # Nuevo campo

    # Relaciones
    Producto = models.ForeignKey(
        'Producto', 
        on_delete=models.CASCADE,
        related_name='ventas'
    )
    cliente = models.ForeignKey(
        'Cliente', 
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='ventas',
        help_text="Cliente asociado a la venta (opcional)"
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
        if self.CantidadVenta > self.Producto.StockProductoActual:
            raise ValidationError(
                f"No hay suficiente stock. Disponible: {self.Producto.StockProductoActual}"
            )

    def save(self, *args, **kwargs):
        if not self.pk:
            self.PrecioTotalVenta = self.CantidadVenta * self.PrecioVenta
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        if self.pk:
            self.Producto.CantidadProductoVendido -= self.CantidadVenta
            self.Producto.save()
        super().delete(*args, **kwargs)

    def __str__(self):
        if self.cliente_eliminado:
            return f"Venta {self.id} - {self.Producto.NombreProducto} a Cliente eliminado"
        return f"Venta {self.id} - {self.Producto.NombreProducto} a {str(self.cliente) if self.cliente else 'Cliente no especificado'}"

class Cliente(models.Model):
    TIPO_CHOICES = [
        ('particular', 'Particular'),
        ('empresa', 'Empresa'),
    ]
    
    # Campos obligatorios
    NombreCliente = models.CharField(
        max_length=100, 
        null=False, 
        blank=False,
        validators=[
            RegexValidator(
                regex=r'^[A-Za-zÁáÉéÍíÓóÚúÜüÑñ\s]+$',
                message='El nombre solo debe contener letras y espacios'
            )
        ]
    )
    ApellidoCliente = models.CharField(
        max_length=100, 
        null=False, 
        blank=False,
        validators=[
            RegexValidator(
                regex=r'^[A-Za-zÁáÉéÍíÓóÚúÜüÑñ\s]+$',
                message='El apellido solo debe contener letras y espacios'
            )
        ]
    )
    RutCliente = models.CharField(
        max_length=12, 
        unique=True, 
        null=False, 
        blank=False
    )
    TipoCliente = models.CharField(
        max_length=20, 
        choices=TIPO_CHOICES, 
        default='particular'
    )
    
    # Campos de tracking
    CantidadTotalCompras = models.PositiveIntegerField(
        default=0,
        editable=False,
        help_text="Cantidad total de productos comprados por el cliente"
    )
    TotalDineroCompras = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        editable=False,
        help_text="Total en dinero de todas las compras del cliente"
    )
    
    # Campos opcionales
    NombreCompañia = models.CharField(max_length=100, null=True, blank=True)
    ComentarioCliente = models.TextField(null=True, blank=True)
    TelefonoCliente = models.CharField(
        max_length=15, 
        null=True, 
        blank=True,
        validators=[
            RegexValidator(
                regex=r'^\+?569\d{8}$',
                message='El teléfono debe tener formato +569XXXXXXXX o 569XXXXXXXX'
            )
        ]
    )
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

    def clean(self):
        """Validaciones personalizadas del modelo"""
        super().clean()
        
        # Validar RUT
        if self.RutCliente:
            self.validar_rut_chileno(self.RutCliente)
        
        # Validar campos según tipo de cliente
        if self.TipoCliente == 'empresa':
            if not self.NombreCompañia:
                raise ValidationError({
                    'NombreCompañia': 'El nombre de la compañía es obligatorio para clientes tipo empresa'
                })
        else:  # particular
            if not self.NombreCliente or not self.ApellidoCliente:
                raise ValidationError('Nombre y apellido son obligatorios para clientes particulares')

    @staticmethod
    def validar_rut_chileno(rut):
        """Validación completa de RUT chileno"""
        # Verificar formato inicial
        if not re.match(r'^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9kK]$', rut):
            raise ValidationError('El formato del RUT debe ser XX.XXX.XXX-X')
        
        # Limpiar el RUT para validación
        rut_limpio = rut.replace(".", "").replace("-", "").upper()
        
        # Separar cuerpo y dígito verificador
        cuerpo = rut_limpio[:-1]
        dv = rut_limpio[-1]
        
        try:
            cuerpo = int(cuerpo)
            # Validar que el cuerpo no sea 0
            if cuerpo == 0:
                raise ValidationError('RUT no válido')
        except ValueError:
            raise ValidationError('RUT no válido')
        
        # Calcular dígito verificador
        suma = 0
        multiplicador = 2
        
        for d in reversed(str(cuerpo)):
            suma += int(d) * multiplicador
            multiplicador = multiplicador + 1 if multiplicador < 7 else 2
        
        dv_esperado = str(11 - (suma % 11))
        if dv_esperado == '11':
            dv_esperado = '0'
        elif dv_esperado == '10':
            dv_esperado = 'K'
        
        if dv != dv_esperado:
            raise ValidationError('RUT no válido (dígito verificador incorrecto)')

    def actualizar_totales(self):
        """Actualiza los totales del cliente basado en sus ventas"""
        ventas = self.ventas.all()
        self.CantidadTotalCompras = sum(v.CantidadVenta for v in ventas)
        self.TotalDineroCompras = sum(v.PrecioTotalVenta for v in ventas)
        self.save()

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        if self.TipoCliente == 'empresa':
            return f"{self.NombreCompañia} - {self.RutCliente}"
        return f"{self.NombreCliente} {self.ApellidoCliente} - {self.RutCliente}"
#----RUTA PARA VENTA




#-----RESPALDOS-----
class Producto_Respaldo(models.Model):
    # Datos de auditoría
    FechaEliminacion = models.DateTimeField(auto_now_add=True)
    EliminadoPor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    
    # Campos del producto original
    NombreProducto = models.CharField(max_length=100)
    StockProductoInicial = models.PositiveIntegerField()
    StockProductoActual = models.PositiveIntegerField()
    PrecioUnitarioProducto = models.DecimalField(max_digits=10, decimal_places=2)
    PrecioTotalProducto = models.DecimalField(max_digits=10, decimal_places=2)
    CategoriaOriginal = models.CharField(max_length=100, null=True, blank=True)
    MaterialesUsados = models.TextField(null=True, blank=True)  # Guardado como JSON
    
    # Campos de control de stock
    CantidadProductoVendido = models.PositiveIntegerField()
    CantidadProductoDesechado = models.PositiveIntegerField()
    
    # Campos opcionales
    DescripcionProducto = models.TextField(null=True, blank=True)
    UbicacionProducto = models.CharField(max_length=100, null=True, blank=True)
    EstadoProducto = models.CharField(max_length=50, null=True, blank=True)
    FechaProducto = models.DateField()
    DiasProducto = models.IntegerField()
    ProductoAgotado = models.BooleanField()
    FotoProductoURL = models.URLField(null=True, blank=True)
    
    class Meta:
        verbose_name = "Producto en Respaldo"
        verbose_name_plural = "Productos en Respaldo"
        ordering = ['-FechaEliminacion']

    def __str__(self):
        return f"{self.NombreProducto} (Eliminado el {self.FechaEliminacion})"