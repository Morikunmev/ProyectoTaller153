import json
import logging
import os
import re
import requests
from datetime import datetime
from io import BytesIO
from decimal import Decimal, InvalidOperation as DecimalException

# Django imports
from django.contrib.auth import logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.db import IntegrityError, models
from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
import time
import hashlib
import base64
# Cloudinary imports
import cloudinary
import cloudinary.api
import cloudinary.uploader
from cloudinary.models import CloudinaryField
from cloudinary.utils import cloudinary_url
from cloudinary_storage.storage import MediaCloudinaryStorage
from cloudinary.exceptions import Error as CloudinaryError
from datetime import date
from django.views import View
from django.db.models import F,CharField
from django.db import transaction
from django.db.models.functions import Concat
from django.db.models import Value
from django.db.models import Avg





# Excel imports
import xlsxwriter
from django.http import JsonResponse
from decimal import Decimal, InvalidOperation

from django.conf import settings
from django.core.mail import send_mail
from django.urls import reverse

from cloudinary.uploader import upload
from django.core.mail import EmailMessage





# Local imports
from .models import Proveedor, Factura, Envio, Material, Herramienta, Producto,ProductoMaterial, Categoria, Cliente, Ventas, Perdidas, User


from login.models import Usuario
from django.http import FileResponse, HttpResponse
from django.shortcuts import get_object_or_404
import requests
from urllib.parse import urlparse
import os
import mimetypes
from django.db import connection
from django.views.decorators.http import require_http_methods


# Configurar logging
logger = logging.getLogger(__name__)




#Exportar proveedores a Excel
def exportar_proveedores_excel(request):
    # Crear un buffer en memoria
    output = BytesIO()
    
    # Crear un nuevo archivo Excel con la opción remove_timezone
    workbook = xlsxwriter.Workbook(output, {'remove_timezone': True})
    worksheet = workbook.add_worksheet('Proveedores')
    
    # Agregar formatos
    header_format = workbook.add_format({
        'bold': True,
        'bg_color': '#000000',
        'font_color': 'white',
        'border': 1
    })
    
    date_format = workbook.add_format({
        'num_format': 'dd/mm/yyyy hh:mm',
    })
    
    # Definir encabezados
    headers = [
        'Nombre', 'RUT', 'Marca', 'Comentario', 'Ciudad', 
        'Región', 'País', 'Teléfono', 'Fecha Creación', 
        'Última Modificación'
    ]
    
    # Escribir encabezados
    for col, header in enumerate(headers):
        worksheet.write(0, col, header, header_format)
        worksheet.set_column(col, col, 15)  # Establecer ancho de columna
    
    # Obtener datos de proveedores
    proveedores = Proveedor.objects.all().order_by('NombreProveedor')
    
    # Escribir datos
    for row, proveedor in enumerate(proveedores, start=1):
        # Convertir fechas a la zona horaria local y remover la información de zona horaria
        fecha_creacion = timezone.localtime(proveedor.FechaCreacionProveedor).replace(tzinfo=None)
        fecha_modificacion = timezone.localtime(proveedor.FechaModificacionProveedor).replace(tzinfo=None)
        
        worksheet.write(row, 0, proveedor.NombreProveedor)
        worksheet.write(row, 1, proveedor.RutProveedor)
        worksheet.write(row, 2, proveedor.MarcaProveedor)
        worksheet.write(row, 3, proveedor.ComentarioProveedor or '')
        worksheet.write(row, 4, proveedor.CiudadProveedor or '')
        worksheet.write(row, 5, proveedor.RegionProveedor or '')
        worksheet.write(row, 6, proveedor.PaisProveedor or '')
        worksheet.write(row, 7, proveedor.TelefonoProveedor or '')
        worksheet.write_datetime(row, 8, fecha_creacion, date_format)
        worksheet.write_datetime(row, 9, fecha_modificacion, date_format)

    # Ajustar anchos de columna automáticamente basado en el contenido
    for col, header in enumerate(headers):
        worksheet.set_column(col, col, len(header) + 2)
    
    workbook.close()
    
    # Preparar la respuesta
    output.seek(0)
    
    # Generar nombre del archivo con la fecha actual
    filename = f'Proveedores_{timezone.localtime().strftime("%Y%m%d_%H%M%S")}.xlsx'
    
    response = HttpResponse(
        output.read(),
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    
    return response

def exportar_facturas_excel(request):
    # Crear un buffer en memoria
    output = BytesIO()
    
    # Crear un nuevo archivo Excel con la opción remove_timezone
    workbook = xlsxwriter.Workbook(output, {'remove_timezone': True})
    # Hoja para los datos
    worksheet_data = workbook.add_worksheet('Facturas')
    # Hojas para los gráficos
    worksheet_charts = workbook.add_worksheet('Gráficos')
    # Agregar formatos
    header_format = workbook.add_format({
        'bold': True,
        'bg_color': '#000000',
        'font_color': 'white',
        'border': 1
    })
    date_format = workbook.add_format({
        'num_format': 'dd/mm/yyyy',
    })

    # Definir encabezados
    headers = [
        'ID',
        'N° Factura',
        'Fecha Emisión',
        'Nombre Proveedor',
        'RUT Proveedor',
        'Marca Proveedor'
    ]
    # Escribir encabezados en hoja de datos
    for col, header in enumerate(headers):
        worksheet_data.write(0, col, header, header_format)
        worksheet_data.set_column(col, col, 15)

    # Obtener datos de facturas
    facturas = Factura.objects.all().select_related('Proveedor').order_by('-FechaEmision')

    # Escribir datos
    for row, factura in enumerate(facturas, start=1):
        worksheet_data.write(row, 0, factura.id)
        worksheet_data.write(row, 1, factura.NumeroFactura)
        worksheet_data.write_datetime(row, 2, factura.FechaEmision, date_format)
        worksheet_data.write(row, 3, factura.Proveedor.NombreProveedor)
        worksheet_data.write(row, 4, factura.Proveedor.RutProveedor)
        worksheet_data.write(row, 5, factura.Proveedor.MarcaProveedor)

    # Ajustar anchos de columna
    worksheet_data.set_column('A:A', 8)  # ID
    worksheet_data.set_column('B:B', 15)  # N° Factura
    worksheet_data.set_column('C:F', 20)  # Resto de columnas

    # Preparar datos para los gráficos
    proveedores_dict = {}
    for factura in facturas:
        proveedor = factura.Proveedor.NombreProveedor
        proveedores_dict[proveedor] = proveedores_dict.get(proveedor, 0) + 1

    # Escribir datos para gráficos en hoja de gráficos
    worksheet_charts.write_row('A1', ['Proveedor'], header_format)
    worksheet_charts.write_row('B1', ['Cantidad de Facturas'], header_format)
    
    for i, (proveedor, cantidad) in enumerate(proveedores_dict.items(), start=2):
        worksheet_charts.write(f'A{i}', proveedor)
        worksheet_charts.write(f'B{i}', cantidad)

    # Crear y añadir gráficos
    # 1. Gráfico de Columnas
    column_chart = workbook.add_chart({'type': 'column'})
    column_chart.add_series({
        'name': 'Facturas por Proveedor',
        'categories': f'=Gráficos!$A$2:$A${len(proveedores_dict)+1}',
        'values': f'=Gráficos!$B$2:$B${len(proveedores_dict)+1}',
        'data_labels': {'value': True},
    })
    column_chart.set_title({'name': 'Facturas por Proveedor (Columnas)'})
    column_chart.set_size({'width': 500, 'height': 300})
    worksheet_charts.insert_chart('D2', column_chart)

    # 2. Gráfico de Pie
    pie_chart = workbook.add_chart({'type': 'pie'})
    pie_chart.add_series({
        'categories': f'=Gráficos!$A$2:$A${len(proveedores_dict)+1}',
        'values': f'=Gráficos!$B$2:$B${len(proveedores_dict)+1}',
        'data_labels': {'percentage': True},
    })
    pie_chart.set_title({'name': 'Distribución de Facturas (%)'})
    pie_chart.set_size({'width': 500, 'height': 300})
    worksheet_charts.insert_chart('D18', pie_chart)

    # 3. Gráfico de Barras
    bar_chart = workbook.add_chart({'type': 'bar'})
    bar_chart.add_series({
        'name': 'Facturas por Proveedor',
        'categories': f'=Gráficos!$A$2:$A${len(proveedores_dict)+1}',
        'values': f'=Gráficos!$B$2:$B${len(proveedores_dict)+1}',
        'data_labels': {'value': True},
    })
    bar_chart.set_title({'name': 'Facturas por Proveedor (Barras)'})
    bar_chart.set_size({'width': 500, 'height': 300})
    worksheet_charts.insert_chart('D34', bar_chart)

    # 4. Gráfico de Línea
    line_chart = workbook.add_chart({'type': 'line'})
    line_chart.add_series({
        'name': 'Facturas por Proveedor',
        'categories': f'=Gráficos!$A$2:$A${len(proveedores_dict)+1}',
        'values': f'=Gráficos!$B$2:$B${len(proveedores_dict)+1}',
        'data_labels': {'value': True},
        'marker': {'type': 'circle', 'size': 8},
    })
    line_chart.set_title({'name': 'Tendencia de Facturas por Proveedor'})
    line_chart.set_size({'width': 500, 'height': 300})
    worksheet_charts.insert_chart('K2', line_chart)

    # 5. Gráfico de Área
    area_chart = workbook.add_chart({'type': 'area'})
    area_chart.add_series({
        'name': 'Facturas por Proveedor',
        'categories': f'=Gráficos!$A$2:$A${len(proveedores_dict)+1}',
        'values': f'=Gráficos!$B$2:$B${len(proveedores_dict)+1}',
        'data_labels': {'value': True},
    })
    area_chart.set_title({'name': 'Acumulación de Facturas por Proveedor'})
    area_chart.set_size({'width': 500, 'height': 300})
    worksheet_charts.insert_chart('K18', area_chart)

    workbook.close()

    # Preparar la respuesta
    output.seek(0)
    filename = f'Facturas_con_graficos_{timezone.localtime().strftime("%Y%m%d_%H%M%S")}.xlsx'
    
    response = HttpResponse(
        output.read(),
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    
    return response


#--------------------------LOGICA PARA MOSTRAR USUARIO --------------------------------

@login_required(login_url='login')
@ensure_csrf_cookie
def get_current_user(request):
    if request.method == 'GET':
        try:
            user = request.user
            # Manejar superusuario (user.id == 1)
            if user.id == 1:
                return JsonResponse({
                    'user': {
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'email': user.email,
                    },
                    'TipoUsuario': 'Superadmin'
                })
            
            try:
                usuario = Usuario.objects.get(user=user)
                return JsonResponse({
                    'user': {
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'email': user.email,
                    },
                    'RutUsuario': usuario.RutUsuario,
                    'TipoUsuario': usuario.TipoUsuario,
                    'FotoUsuario': usuario.FotoUsuario.url if usuario.FotoUsuario else None,
                })
            except Usuario.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'message': 'Usuario no encontrado'
                }, status=404)
                
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)
    
    return JsonResponse({
        'success': False,
        'message': 'Método no permitido'
    }, status=405)



#--------------------------LOGICA DE LOGIN --------------------------------
@login_required(login_url='login')
def dashboard(request):
    return render(request, 'home/dashboard.html')

def logout(request):
    auth_logout(request)  # Cerrar la sesión del usuario
    return redirect('login')  # Redirigir al usuario a la página de inicio de sesión







#--------------------------GESTOR PROVEEDORES --------------------------------
@login_required(login_url='login')
def mod_proveedor(request):
    return render(request, 'proveedor/proveedor.html')

# Nueva vista para crear proveedor
#@ensure_csrf_cookie  #es un decorador de DJANGO que garantiza que se envie una cookie CSRF al cliente,
@login_required(login_url='login')
@ensure_csrf_cookie 
def crear_proveedor(request):
    if request.method == 'POST':
        try:
            data = request.POST
            
            # Validaciones de campos requeridos
            campos_requeridos = ['NombreProveedor', 'RutProveedor', 'MarcaProveedor']
            errores = {}
            
            for campo in campos_requeridos:
                if not data.get(campo):
                    errores[campo] = f'El campo {campo} es requerido'
            
            if errores:
                return JsonResponse({
                    'success': False,
                    'errors': errores
                }, status=400)
            
            # Normalizar RUT (convertir a mayúsculas)
            rut = data.get('RutProveedor').upper()
            
            # Validar formato RUT con regex
            rut_regex = re.compile(r'^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9kK]$')
            if not rut_regex.match(rut):
                return JsonResponse({
                    'success': False,
                    'errors': {
                        'RutProveedor': 'RUT debe tener formato XX.XXX.XXX-X'
                    }
                }, status=400)
            
            # Verificar duplicados
            validaciones_unicidad = {
                'NombreProveedor': 'Este nombre de proveedor ya existe',
                'RutProveedor': 'Este RUT ya existe',
                'MarcaProveedor': 'Esta marca ya existe'
            }
            
            for campo, mensaje in validaciones_unicidad.items():
                if Proveedor.objects.filter(**{campo: data.get(campo)}).exists():
                    return JsonResponse({
                        'success': False,
                        'errors': {campo: mensaje}
                    }, status=400)
            
            # Crear el proveedor con los campos actualizados
            nuevo_proveedor = Proveedor(
                NombreProveedor=data.get('NombreProveedor'),
                RutProveedor=rut,
                MarcaProveedor=data.get('MarcaProveedor'),
                ComentarioProveedor=data.get('ComentarioProveedor'),
                CiudadProveedor=data.get('CiudadProveedor'),
                RegionProveedor=data.get('RegionProveedor'),
                PaisProveedor=data.get('PaisProveedor'),
                TelefonoProveedor=data.get('TelefonoProveedor')
            )
            
            # Validar teléfono si se proporciona
            if data.get('TelefonoProveedor'):
                telefono = data.get('TelefonoProveedor')
                if not telefono.isdigit() or len(telefono) > 15:
                    return JsonResponse({
                        'success': False,
                        'errors': {
                            'TelefonoProveedor': 'El teléfono debe contener solo números y tener máximo 15 dígitos'
                        }
                    }, status=400)
            
            # Manejar la foto si existe
            if 'FotoProveedor' in request.FILES:
                foto = request.FILES['FotoProveedor']
                # Validar tipo de archivo
                allowed_types = ['image/jpeg', 'image/png', 'image/gif']
                if foto.content_type not in allowed_types:
                    return JsonResponse({
                        'success': False,
                        'errors': {
                            'FotoProveedor': 'El archivo debe ser una imagen (JPEG, PNG o GIF)'
                        }
                    }, status=400)
                nuevo_proveedor.FotoProveedor = foto
            
            # Validar el modelo completo
            try:
                nuevo_proveedor.full_clean()
            except ValidationError as e:
                errores_formateados = {}
                for campo, errores in e.message_dict.items():
                    errores_formateados[campo] = errores[0] if errores else str(errores)
                return JsonResponse({
                    'success': False,
                    'errors': errores_formateados
                }, status=400)
            
            # Guardar el proveedor
            nuevo_proveedor.save()
            
            # Retornar respuesta exitosa
            return JsonResponse({
                'success': True,
                'message': 'Proveedor creado exitosamente',
                'proveedor': {
                    'id': nuevo_proveedor.id,
                    'NombreProveedor': nuevo_proveedor.NombreProveedor,
                    'RutProveedor': nuevo_proveedor.RutProveedor,
                    'MarcaProveedor': nuevo_proveedor.MarcaProveedor,
                    'ComentarioProveedor': nuevo_proveedor.ComentarioProveedor,
                    'CiudadProveedor': nuevo_proveedor.CiudadProveedor,
                    'RegionProveedor': nuevo_proveedor.RegionProveedor,
                    'PaisProveedor': nuevo_proveedor.PaisProveedor,
                    'TelefonoProveedor': nuevo_proveedor.TelefonoProveedor,
                    'FotoProveedor': nuevo_proveedor.FotoProveedor.url if nuevo_proveedor.FotoProveedor else None,
                    'FechaCreacionProveedor': nuevo_proveedor.FechaCreacionProveedor.isoformat() if nuevo_proveedor.FechaCreacionProveedor else None,
                    'FechaModificacionProveedor': nuevo_proveedor.FechaModificacionProveedor.isoformat() if nuevo_proveedor.FechaModificacionProveedor else None
                }
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'errors': {
                    'general': f'Error al crear el proveedor: {str(e)}'
                }
            }, status=400)
    
    return JsonResponse({
        'success': False,
        'errors': {
            'general': 'Método no permitido'
        }
    }, status=405)

@login_required(login_url='login')
def listar_proveedores(request):
    if request.method == 'GET':
        try:
            proveedores = Proveedor.objects.all()
            data = []
            for proveedor in proveedores:
                data.append({
                    'id': proveedor.id,
                    # Campos obligatorios
                    'NombreProveedor': proveedor.NombreProveedor,
                    'RutProveedor': proveedor.RutProveedor,
                    'MarcaProveedor': proveedor.MarcaProveedor,
                    # Campo de comentario
                    'ComentarioProveedor': proveedor.ComentarioProveedor or '',
                    # Campos de ubicación
                    'CiudadProveedor': proveedor.CiudadProveedor or '',
                    'RegionProveedor': proveedor.RegionProveedor or '',
                    'PaisProveedor': proveedor.PaisProveedor or '',
                    # Campos de contacto y multimedia
                    'TelefonoProveedor': proveedor.TelefonoProveedor or '',
                    'FotoProveedor': proveedor.FotoProveedor.url if proveedor.FotoProveedor else None,
                    # Campos de auditoría
                    'FechaCreacionProveedor': proveedor.FechaCreacionProveedor.isoformat() if proveedor.FechaCreacionProveedor else None,
                    'FechaModificacionProveedor': proveedor.FechaModificacionProveedor.isoformat() if proveedor.FechaModificacionProveedor else None
                })
            return JsonResponse({
                'success': True,
                'proveedores': data
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)
    return JsonResponse({
        'success': False, 
        'message': 'Método no permitido'
    }, status=405)

@login_required(login_url='login')
@ensure_csrf_cookie
def eliminar_proveedor(request, proveedor_id):
    if request.method == 'DELETE':
        try:
            # Obtener el proveedor
            proveedor = get_object_or_404(Proveedor, id=proveedor_id)
            
            # Guardar el nombre para la respuesta
            nombre_proveedor = proveedor.NombreProveedor
            
            # Si existe una foto, eliminarla de Cloudinary
            if proveedor.FotoProveedor:
                try:
                    # Obtener la URL de la imagen
                    url = proveedor.FotoProveedor.url
                    
                    # Extraer el public_id del formato "proveedores/xxxxxx"
                    # La URL será algo como: https://res.cloudinary.com/tu-cloud/image/upload/v1234567/proveedores/xxxxxx
                    parts = url.split('/')
                    # Obtener las dos últimas partes para formar "proveedores/xxxxxx"
                    public_id = f"{parts[-2]}/{parts[-1].split('.')[0]}"
                    
                    print(f"Intentando eliminar imagen con public_id: {public_id}")
                    
                    # Configurar Cloudinary
                    cloudinary.config(
                        cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
                        api_key=os.getenv('CLOUDINARY_API_KEY'),
                        api_secret=os.getenv('CLOUDINARY_API_SECRET')
                    )
                    
                    # Eliminar la imagen especificando el tipo y resource_type
                    result = cloudinary.uploader.destroy(
                        public_id,
                        resource_type="image",
                        type="upload"
                    )
                    print(f"Resultado de eliminación Cloudinary: {result}")
                    
                except Exception as cloud_error:
                    print(f"Error al eliminar imagen de Cloudinary: {str(cloud_error)}")
                    print(f"URL de la imagen: {proveedor.FotoProveedor.url}")
            
            # Eliminar el proveedor
            proveedor.delete()
            
            return JsonResponse({
                'success': True,
                'message': f'Proveedor {nombre_proveedor} y sus archivos asociados fueron eliminados exitosamente'
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Error al eliminar el proveedor: {str(e)}'
            }, status=500)
            
    return JsonResponse({
        'success': False,
        'message': 'Método no permitido'
    }, status=405)
    
    
    
    
@login_required(login_url='login')
@ensure_csrf_cookie
def actualizar_proveedor(request, proveedor_id):
    if request.method == 'PUT' or request.method == 'POST':
        try:
            proveedor = get_object_or_404(Proveedor, id=proveedor_id)
            data = request.POST
            
            # Validar campos requeridos
            campos_requeridos = ['NombreProveedor', 'RutProveedor', 'MarcaProveedor']
            errores = {}
            
            for campo in campos_requeridos:
                if not data.get(campo):
                    errores[campo] = f'El campo {campo} es requerido'
            
            if errores:
                return JsonResponse({
                    'success': False,
                    'errors': errores
                }, status=400)
            
            # Validar formato del RUT
            rut = data.get('RutProveedor').upper()
            rut_regex = re.compile(r'^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9kK]$')
            if not rut_regex.match(rut):
                return JsonResponse({
                    'success': False,
                    'errors': {
                        'RutProveedor': 'RUT debe tener formato XX.XXX.XXX-X'
                    }
                }, status=400)
            
            # Verificar campos únicos (excluyendo el registro actual)
            validaciones_unicidad = {
                'NombreProveedor': 'Este nombre de proveedor ya existe',
                'RutProveedor': 'Este RUT ya existe',
                'MarcaProveedor': 'Esta marca ya existe'
            }
            
            for campo, mensaje in validaciones_unicidad.items():
                if Proveedor.objects.filter(**{campo: data.get(campo)}).exclude(id=proveedor_id).exists():
                    return JsonResponse({
                        'success': False,
                        'errors': {campo: mensaje}
                    }, status=400)
            
            # Validar teléfono si se proporciona
            if data.get('TelefonoProveedor'):
                telefono = data.get('TelefonoProveedor')
                if not telefono.isdigit() or len(telefono) > 15:
                    return JsonResponse({
                        'success': False,
                        'errors': {
                            'TelefonoProveedor': 'El teléfono debe contener solo números y tener máximo 15 dígitos'
                        }
                    }, status=400)

            # Manejar la actualización de la foto
            if 'FotoProveedor' in request.FILES:
                foto = request.FILES['FotoProveedor']
                # Validar tipo de archivo
                allowed_types = ['image/jpeg', 'image/png', 'image/gif']
                if foto.content_type not in allowed_types:
                    return JsonResponse({
                        'success': False,
                        'errors': {
                            'FotoProveedor': 'El archivo debe ser una imagen (JPEG, PNG o GIF)'
                        }
                    }, status=400)
                
                try:
                    # Guardar la referencia de la foto actual
                    foto_anterior = None
                    if proveedor.FotoProveedor:
                        foto_anterior = proveedor.FotoProveedor
                        
                    # Asignar la nueva foto
                    proveedor.FotoProveedor = foto
                    
                    # Guardar el proveedor con la nueva foto
                    proveedor.save()
                    
                    # Una vez confirmado que se guardó la nueva foto, eliminar la anterior
                    if foto_anterior:
                        try:
                            # Obtener el public_id de la foto anterior
                            url = foto_anterior.url
                            parts = url.split('/')
                            public_id = f"{parts[-2]}/{parts[-1].split('.')[0]}"
                            
                            # Configurar Cloudinary
                            cloudinary.config(
                                cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
                                api_key=os.getenv('CLOUDINARY_API_KEY'),
                                api_secret=os.getenv('CLOUDINARY_API_SECRET')
                            )
                            
                            # Eliminar la imagen anterior
                            result = cloudinary.uploader.destroy(
                                public_id,
                                resource_type="image",
                                type="upload",
                                invalidate=True
                            )
                            print(f"Resultado de eliminación Cloudinary: {result}")
                            
                        except Exception as cloud_error:
                            print(f"Error al eliminar imagen anterior de Cloudinary: {str(cloud_error)}")
                            # No lanzamos el error para que no afecte la actualización
                
                except Exception as e:
                    return JsonResponse({
                        'success': False,
                        'errors': {
                            'FotoProveedor': f'Error al actualizar la foto: {str(e)}'
                        }
                    }, status=400)

            # Actualizar los campos del proveedor
            proveedor.NombreProveedor = data.get('NombreProveedor')
            proveedor.RutProveedor = rut
            proveedor.MarcaProveedor = data.get('MarcaProveedor')
            proveedor.ComentarioProveedor = data.get('ComentarioProveedor')
            proveedor.CiudadProveedor = data.get('CiudadProveedor')
            proveedor.RegionProveedor = data.get('RegionProveedor')
            proveedor.PaisProveedor = data.get('PaisProveedor')
            proveedor.TelefonoProveedor = data.get('TelefonoProveedor')
            
            # Validar y guardar
            try:
                proveedor.full_clean()
                proveedor.save()
            except ValidationError as e:
                errores_formateados = {}
                for campo, errores in e.message_dict.items():
                    errores_formateados[campo] = errores[0] if errores else str(errores)
                return JsonResponse({
                    'success': False,
                    'errors': errores_formateados
                }, status=400)

            # Devolver respuesta exitosa
            return JsonResponse({
                'success': True,
                'message': 'Proveedor actualizado exitosamente',
                'proveedor': {
                    'id': proveedor.id,
                    'NombreProveedor': proveedor.NombreProveedor,
                    'RutProveedor': proveedor.RutProveedor,
                    'MarcaProveedor': proveedor.MarcaProveedor,
                    'ComentarioProveedor': proveedor.ComentarioProveedor,
                    'CiudadProveedor': proveedor.CiudadProveedor,
                    'RegionProveedor': proveedor.RegionProveedor,
                    'PaisProveedor': proveedor.PaisProveedor,
                    'TelefonoProveedor': proveedor.TelefonoProveedor,
                    'FotoProveedor': proveedor.FotoProveedor.url if proveedor.FotoProveedor else None,
                    'FechaCreacionProveedor': proveedor.FechaCreacionProveedor.isoformat() if proveedor.FechaCreacionProveedor else None,
                    'FechaModificacionProveedor': proveedor.FechaModificacionProveedor.isoformat() if proveedor.FechaModificacionProveedor else None
                }
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'errors': {
                    'general': f'Error al actualizar el proveedor: {str(e)}'
                }
            }, status=400)

    return JsonResponse({
        'success': False,
        'errors': {
            'general': 'Método no permitido'
        }
    }, status=405)
#--------------------------GESTOR FACTURA --------------------------------
@login_required(login_url='login')
def mod_factura(request):
    return render(request, 'proveedor/factura.html')

ALLOWED_FILE_TYPES = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/bmp': '.bmp',
    'image/webp': '.webp',
    'image/tiff': '.tiff',
    'image/svg+xml': '.svg',
    'application/pdf': '.pdf'
}

@login_required(login_url='login')
@ensure_csrf_cookie 
def crear_factura(request):
    if request.method == 'POST':
        try:
            data = request.POST
            print("Datos recibidos:", data)  # Añadir este print
            print("Archivos recibidos:", request.FILES)  # Añadir este print
            
            # Validaciones de campos requeridos
            campos_requeridos = ['FechaEmision', 'Proveedor', 'NumeroFactura']
            errores = {}
            
            for campo in campos_requeridos:
                if not data.get(campo):
                    errores[campo] = f'El campo {campo} es requerido'
            
            if errores:
                return JsonResponse({
                    'success': False,
                    'errors': errores
                }, status=400)
            
            try:
                fecha_emision = datetime.strptime(data.get('FechaEmision'), '%Y-%m-%d').date()
            except ValueError:
                return JsonResponse({
                    'success': False,
                    'errors': {
                        'FechaEmision': 'El formato de fecha debe ser YYYY-MM-DD'
                    }
                }, status=400)
            
            try:
                proveedor = Proveedor.objects.get(id=data.get('Proveedor'))
            except (Proveedor.DoesNotExist, ValueError):
                return JsonResponse({
                    'success': False,
                    'errors': {
                        'Proveedor': 'Proveedor no válido'
                    }
                }, status=400)

            # Validar número de factura único
            if Factura.objects.filter(NumeroFactura=data.get('NumeroFactura')).exists():
                return JsonResponse({
                    'success': False,
                    'errors': {
                        'NumeroFactura': 'Este número de factura ya existe'
                    }
                }, status=400)
            
            nueva_factura = Factura(
                NumeroFactura=data.get('NumeroFactura'),
                FechaEmision=fecha_emision,
                Proveedor=proveedor
            )
            
            # Manejar la foto
            if 'FotoFactura' in request.FILES:
                foto = request.FILES['FotoFactura']
                if foto.content_type not in ALLOWED_FILE_TYPES:
                    return JsonResponse({
                        'success': False,
                        'errors': {
                            'FotoFactura': 'Formato no válido. Formatos permitidos: JPG, PNG, GIF, BMP, WEBP, TIFF, SVG, PDF'
                        }
                    }, status=400)

                if foto.size > 10 * 1024 * 1024:
                    return JsonResponse({
                        'success': False,
                        'errors': {
                            'FotoFactura': 'El archivo es demasiado grande. El tamaño máximo permitido es 10MB'
                        }
                    }, status=400)

                nueva_factura.FotoFactura = foto

            # Manejar el documento
            if 'DocumentoFactura' in request.FILES:
                documento = request.FILES['DocumentoFactura']
                
                # Validar que sea PDF
                if documento.content_type != 'application/pdf':
                    return JsonResponse({
                        'success': False,
                        'errors': {
                            'DocumentoFactura': 'Solo se permiten archivos PDF'
                        }
                    }, status=400)

                # Validación adicional de extensión
                if not documento.name.lower().endswith('.pdf'):
                    return JsonResponse({
                        'success': False,
                        'errors': {
                            'DocumentoFactura': 'El archivo debe tener extensión .pdf'
                        }
                    }, status=400)

                if documento.size > 10 * 1024 * 1024:
                    return JsonResponse({
                        'success': False,
                        'errors': {
                            'DocumentoFactura': 'El archivo es demasiado grande. El tamaño máximo permitido es 10MB'
                        }
                    }, status=400)

                try:
                    # Configurar Cloudinary
                    cloudinary.config( 
                        cloud_name = "dfqlvd3d4", 
                        api_key = "576329879718141", 
                        api_secret = "ji5zZ-PxQ2z8hzmN4rdYypGH12M"
                    )

                    logger.info("Iniciando subida de documento a Cloudinary")
                    upload_result = cloudinary.uploader.upload(
                        documento,
                        resource_type='raw',
                        folder='facturas/documentos/',
                        public_id=f'factura_doc_{datetime.now().strftime("%Y%m%d_%H%M%S")}'
                    )
                    
                    logger.info(f"Documento subido exitosamente. Public ID: {upload_result.get('public_id')}")
                    nueva_factura.DocumentoFactura = upload_result['url']

                except CloudinaryError as e:
                    logger.error(f"Error al subir documento a Cloudinary: {str(e)}")
                    return JsonResponse({
                        'success': False,
                        'errors': {
                            'DocumentoFactura': f'Error al subir el documento: {str(e)}'
                        }
                    }, status=400)

            try:
                nueva_factura.full_clean()
            except ValidationError as e:
                errores_formateados = {campo: errores[0] if errores else str(errores) 
                                     for campo, errores in e.message_dict.items()}
                return JsonResponse({
                    'success': False,
                    'errors': errores_formateados
                }, status=400)
            
            nueva_factura.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Factura creada exitosamente',
                'factura': {
                    'id': nueva_factura.id,
                    'NumeroFactura': nueva_factura.NumeroFactura,
                    'FechaEmision': nueva_factura.FechaEmision.isoformat(),
                    'Proveedor': {
                        'id': nueva_factura.Proveedor.id,
                        'NombreProveedor': nueva_factura.Proveedor.NombreProveedor,
                        'RutProveedor': nueva_factura.Proveedor.RutProveedor
                    },
                    'FotoFactura': nueva_factura.FotoFactura.url if nueva_factura.FotoFactura else None,
                    'DocumentoFactura': nueva_factura.DocumentoFactura.url if nueva_factura.DocumentoFactura else None
                }
            })
            
        except Exception as e:
            logger.error(f"Error al crear factura: {str(e)}")
            return JsonResponse({
                'success': False,
                'errors': {
                    'general': f'Error al crear la factura: {str(e)}'
                }
            }, status=400)
    
    return JsonResponse({
        'success': False,
        'errors': {
            'general': 'Método no permitido'
        }
    }, status=405)

@login_required(login_url='login')
def listar_facturas(request):
    if request.method == 'GET':
        try:
            # Incluir ordenamiento por fecha de emisión descendente
            facturas = Factura.objects.all().select_related('Proveedor').order_by('-FechaEmision')
            data = []
            for factura in facturas:
                data.append({
                    'id': factura.id,
                    'NumeroFactura': factura.NumeroFactura,  # Añadido el número de factura
                    'FechaEmision': factura.FechaEmision.isoformat() if factura.FechaEmision else None,
                    'Proveedor': {
                        'id': factura.Proveedor.id,
                        'NombreProveedor': factura.Proveedor.NombreProveedor,
                        'RutProveedor': factura.Proveedor.RutProveedor,
                        'MarcaProveedor': factura.Proveedor.MarcaProveedor
                    },
                    'FotoFactura': factura.FotoFactura.url if factura.FotoFactura else None,
                    'DocumentoFactura': factura.DocumentoFactura.url if factura.DocumentoFactura else None
                })
            return JsonResponse({
                'success': True,
                'facturas': data
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)
    return JsonResponse({
        'success': False, 
        'message': 'Método no permitido'
    }, status=405)

@login_required(login_url='login')
@ensure_csrf_cookie
def eliminar_factura(request, factura_id):
    if request.method == 'DELETE':
        try:
            # Obtener la factura
            factura = get_object_or_404(Factura, id=factura_id)
            
            # Guardar información para la respuesta
            fecha_emision = factura.FechaEmision
            nombre_proveedor = factura.Proveedor.NombreProveedor
            numero_factura = factura.NumeroFactura  # Añadido
            
            # Si existe un documento, eliminarlo de Cloudinary
            if factura.DocumentoFactura:
                try:
                    # Obtener la URL del documento como string
                    url = str(factura.DocumentoFactura)
                    print(f"URL original del documento: {url}")
                    
                    # Extraer el public_id del formato "facturas/documentos/xxxxx"
                    if 'facturas/documentos' in url:
                        start_idx = url.find('facturas/documentos')
                        # Añadir .pdf al final si no está presente
                        public_id = url[start_idx:]
                        if not public_id.endswith('.pdf'):
                            public_id = f"{public_id}.pdf"
                    
                    print(f"Intentando eliminar documento con public_id: {public_id}")
                    
                    # Configurar Cloudinary
                    cloudinary.config(
                        cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
                        api_key=os.getenv('CLOUDINARY_API_KEY'),
                        api_secret=os.getenv('CLOUDINARY_API_SECRET')
                    )
                    
                    # Eliminar el documento
                    result = cloudinary.uploader.destroy(
                        public_id,
                        resource_type="raw",
                        type="upload"
                    )
                    print(f"Resultado de eliminación documento Cloudinary: {result}")
                    
                except Exception as cloud_error:
                    print(f"Error al eliminar documento de Cloudinary: {str(cloud_error)}")
                    print(f"URL del documento: {url}")
            
            # Si existe una foto, eliminarla de Cloudinary
            if factura.FotoFactura:
                try:
                    # Obtener la URL de la imagen
                    url = factura.FotoFactura.url
                    
                    # Extraer el public_id
                    parts = url.split('/')
                    public_id = f"{parts[-2]}/{parts[-1].split('.')[0]}"
                    
                    print(f"Intentando eliminar foto con public_id: {public_id}")
                    
                    # Configurar Cloudinary (no necesario si ya se configuró arriba)
                    if not factura.DocumentoFactura:
                        cloudinary.config(
                            cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
                            api_key=os.getenv('CLOUDINARY_API_KEY'),
                            api_secret=os.getenv('CLOUDINARY_API_SECRET')
                        )
                    
                    # Eliminar la foto
                    result = cloudinary.uploader.destroy(
                        public_id,
                        resource_type="image",
                        type="upload"
                    )
                    print(f"Resultado de eliminación foto Cloudinary: {result}")
                    
                except Exception as cloud_error:
                    print(f"Error al eliminar foto de Cloudinary: {str(cloud_error)}")
                    print(f"URL de la foto: {factura.FotoFactura.url}")
            
            # Eliminar la factura
            factura.delete()
            
            return JsonResponse({
                'success': True,
                'message': f'Factura N° {numero_factura} del {fecha_emision} del proveedor {nombre_proveedor} y sus archivos asociados fueron eliminados exitosamente'
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Error al eliminar la factura: {str(e)}'
            }, status=500)
            
    return JsonResponse({
        'success': False,
        'message': 'Método no permitido'
    }, status=405)
    
    
@login_required(login_url='login')
@ensure_csrf_cookie
def actualizar_factura(request, factura_id):
    if request.method in ['PUT', 'POST']:
        try:
            factura = get_object_or_404(Factura, id=factura_id)
            data = request.POST
            
            # Debug: Imprimir todos los datos recibidos
            print("Datos recibidos:", dict(data))
            
            campos_requeridos = ['FechaEmision', 'Proveedor', 'NumeroFactura']
            errores = {}
            
            for campo in campos_requeridos:
                if not data.get(campo):
                    errores[campo] = f'El campo {campo} es requerido'
            
            if errores:
                return JsonResponse({'success': False, 'errors': errores}, status=400)
            
            # Validar número de factura único
            numero_factura = data.get('NumeroFactura')
            if Factura.objects.exclude(id=factura_id).filter(NumeroFactura=numero_factura).exists():
                return JsonResponse({
                    'success': False,
                    'errors': {'NumeroFactura': 'Este número de factura ya existe'}
                }, status=400)
            
            try:
                fecha_emision = datetime.strptime(data.get('FechaEmision'), '%Y-%m-%d').date()
            except ValueError:
                return JsonResponse({
                    'success': False,
                    'errors': {'FechaEmision': 'El formato de fecha debe ser YYYY-MM-DD'}
                }, status=400)
            
            try:
                proveedor = Proveedor.objects.get(id=data.get('Proveedor'))
            except (Proveedor.DoesNotExist, ValueError):
                return JsonResponse({
                    'success': False,
                    'errors': {'Proveedor': 'Proveedor no válido'}
                }, status=400)

            # Manejar actualización y eliminación de archivos
            archivos = {
                'FotoFactura': {'field': 'FotoFactura', 'resource_type': 'image'},
                'DocumentoFactura': {'field': 'DocumentoFactura', 'resource_type': 'raw'}
            }
            
            for archivo_key, archivo_info in archivos.items():
                print(f"\nProcesando {archivo_key}")
                
                eliminar_archivo = data.get(f'eliminar_{archivo_key}', '').lower() == 'true'
                archivo_actual = getattr(factura, archivo_key)

                print(f"Valor recibido para eliminar_{archivo_key}: {data.get(f'eliminar_{archivo_key}')}")
                print(f"¿Eliminar archivo?: {eliminar_archivo}")
                print(f"¿Existe archivo actual?: {bool(archivo_actual)}")
                
                if eliminar_archivo and archivo_actual:
                    try:
                        # Obtener la URL del archivo actual
                        if archivo_key == 'DocumentoFactura':
                            # Manejar documento de manera especial
                            url = str(archivo_actual)
                            print(f"URL original del documento: {url}")
                            
                            # Extraer el public_id del formato "facturas/documentos/xxxxx"
                            if 'facturas/documentos' in url:
                                start_idx = url.find('facturas/documentos')
                                public_id = url[start_idx:]
                                if not public_id.endswith('.pdf'):
                                    public_id = f"{public_id}.pdf"
                            print(f"Public ID del documento: {public_id}")
                        else:
                            # Mantener el manejo original para FotoFactura
                            url = archivo_actual.url
                            parts = url.split('/')
                            public_id = f"{parts[-2]}/{parts[-1].split('.')[0]}"
                            print(f"Public ID de la foto: {public_id}")
                        
                        # Configurar Cloudinary
                        cloudinary.config(
                            cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
                            api_key=os.getenv('CLOUDINARY_API_KEY'),
                            api_secret=os.getenv('CLOUDINARY_API_SECRET')
                        )
                        
                        # Eliminar archivo de Cloudinary
                        result = cloudinary.uploader.destroy(
                            public_id,
                            resource_type=archivo_info['resource_type'],
                            type="upload",
                            invalidate=True
                        )
                        print(f"Resultado de eliminación Cloudinary: {result}")
                        
                        # Limpiar el campo en el modelo
                        setattr(factura, archivo_key, None)
                        
                    except Exception as e:
                        print(f"Error al eliminar archivo de Cloudinary: {str(e)}")
                        print(f"URL del archivo: {url}")
                        return JsonResponse({
                            'success': False,
                            'errors': {archivo_key: f'Error al eliminar el archivo: {str(e)}'}
                        }, status=400)
                
                # Si hay un nuevo archivo, procesarlo
                elif archivo_key in request.FILES:
                    nuevo_archivo = request.FILES[archivo_key]
                    
                    if nuevo_archivo.size > 10 * 1024 * 1024:
                        return JsonResponse({
                            'success': False,
                            'errors': {
                                archivo_key: 'El archivo es demasiado grande. El tamaño máximo permitido es 10MB'
                            }
                        }, status=400)
                    
                    if archivo_key == 'FotoFactura' and nuevo_archivo.content_type not in ALLOWED_FILE_TYPES:
                        return JsonResponse({
                            'success': False,
                            'errors': {
                                archivo_key: 'Formato no válido. Formatos permitidos: JPG, PNG, GIF, BMP, WEBP, TIFF, SVG, PDF'
                            }
                        }, status=400)
                    
                    try:
                        # Si hay un archivo anterior, eliminarlo de Cloudinary
                        if archivo_actual:
                            try:
                                if archivo_key == 'DocumentoFactura':
                                    url = str(archivo_actual)
                                    if 'facturas/documentos' in url:
                                        start_idx = url.find('facturas/documentos')
                                        public_id = url[start_idx:]
                                        if not public_id.endswith('.pdf'):
                                            public_id = f"{public_id}.pdf"
                                else:
                                    url = archivo_actual.url
                                    parts = url.split('/')
                                    public_id = f"{parts[-2]}/{parts[-1].split('.')[0]}"
                                
                                cloudinary.config(
                                    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
                                    api_key=os.getenv('CLOUDINARY_API_KEY'),
                                    api_secret=os.getenv('CLOUDINARY_API_SECRET')
                                )
                                
                                cloudinary.uploader.destroy(
                                    public_id,
                                    resource_type=archivo_info['resource_type'],
                                    type="upload",
                                    invalidate=True
                                )
                            except Exception as cloud_error:
                                print(f"Error al eliminar archivo anterior de Cloudinary: {str(cloud_error)}")
                                print(f"URL del archivo: {url}")
                        
                        # Asignar nuevo archivo
                        setattr(factura, archivo_key, nuevo_archivo)
                        
                    except Exception as e:
                        return JsonResponse({
                            'success': False,
                            'errors': {archivo_key: f'Error al actualizar el archivo: {str(e)}'}
                        }, status=400)

            # Actualizar campos básicos
            factura.NumeroFactura = numero_factura
            factura.FechaEmision = fecha_emision
            factura.Proveedor = proveedor
            
            try:
                factura.full_clean()
                factura.save()
            except ValidationError as e:
                errores_formateados = {campo: errores[0] if errores else str(errores) 
                                     for campo, errores in e.message_dict.items()}
                return JsonResponse({'success': False, 'errors': errores_formateados}, status=400)

            return JsonResponse({
                'success': True,
                'message': 'Factura actualizada exitosamente',
                'factura': {
                    'id': factura.id,
                    'NumeroFactura': factura.NumeroFactura,
                    'FechaEmision': factura.FechaEmision.isoformat(),
                    'Proveedor': {
                        'id': factura.Proveedor.id,
                        'NombreProveedor': factura.Proveedor.NombreProveedor,
                        'RutProveedor': factura.Proveedor.RutProveedor,
                        'MarcaProveedor': factura.Proveedor.MarcaProveedor
                    },
                    'FotoFactura': factura.FotoFactura.url if factura.FotoFactura else None,
                    'DocumentoFactura': factura.DocumentoFactura.url if factura.DocumentoFactura else None
                }
            })
            
        except Exception as e:
            print(f"Error general: {str(e)}")
            return JsonResponse({
                'success': False,
                'errors': {'general': f'Error al actualizar la factura: {str(e)}'}
            }, status=400)

    return JsonResponse({
        'success': False,
        'errors': {'general': 'Método no permitido'}
    }, status=405)
    
    
@login_required(login_url='login')
def ver_documento_factura(request, factura_id):
    try:
        # Obtener la factura
        factura = get_object_or_404(Factura, id=factura_id)
        if not factura.DocumentoFactura:
            return JsonResponse({
                'success': False,
                'error': 'La factura no tiene un documento adjunto'
            }, status=404)
        
        try:
            # Configurar Cloudinary
            cloudinary.config(
                cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
                api_key=os.getenv('CLOUDINARY_API_KEY'),
                api_secret=os.getenv('CLOUDINARY_API_SECRET')
            )
            
            # Obtener la URL del documento y extraer el public_id
            documento_url = str(factura.DocumentoFactura)
            print(f"URL completa: {documento_url}")
            
            # Extraer el public_id de la URL
            if '/upload/' in documento_url:
                public_id = documento_url.split('/upload/')[1]
                if 'v' in public_id and '/' in public_id:
                    public_id = public_id.split('/', 1)[1]
            else:
                public_id = documento_url
                
            # Añadir .pdf si no está presente
            if not public_id.endswith('.pdf'):
                public_id = f"{public_id}.pdf"
            
            print(f"Public ID con extensión: {public_id}")
            
            try:
                # Intentar obtener los detalles del recurso
                resource = cloudinary.api.resource(
                    public_id,
                    resource_type="raw",
                    type="upload"
                )
                
                asset_id = resource.get('asset_id')
                if asset_id:
                    # Guardar el asset_id para futuras consultas
                    factura.documento_asset_id = asset_id
                    factura.save(update_fields=['documento_asset_id'])
                    print(f"Asset ID encontrado y guardado: {asset_id}")
                    
                    # Construir la URL de la consola
                    console_url = (
                        "https://console.cloudinary.com/pm/c-00d414a3fe21470ca107ecd78a0ee5/"
                        f"media-explorer/facturas/documentos?assetId={asset_id}"
                    )
                    
                    return JsonResponse({
                        'success': True,
                        'url': console_url
                    })
                
            except cloudinary.exceptions.NotFound:
                print(f"No se pudo encontrar el recurso directamente, intentando listar recursos")
                
                # Si no se encuentra directamente, intentar listando los recursos
                response = cloudinary.api.resources(
                    type="upload",
                    resource_type="raw",
                    prefix="facturas/documentos",
                    max_results=500
                )
                
                print("Recursos encontrados:")
                for resource in response.get('resources', []):
                    print(f"- {resource['public_id']}")
                    if resource['public_id'] == public_id:
                        asset_id = resource['asset_id']
                        print(f"Asset ID encontrado en lista: {asset_id}")
                        
                        # Guardar el asset_id para futuras consultas
                        factura.documento_asset_id = asset_id
                        factura.save(update_fields=['documento_asset_id'])
                        
                        # Construir la URL de la consola
                        console_url = (
                            "https://console.cloudinary.com/pm/c-00d414a3fe21470ca107ecd78a0ee5/"
                            f"media-explorer/facturas/documentos?assetId={asset_id}"
                        )
                        
                        return JsonResponse({
                            'success': True,
                            'url': console_url
                        })
            
            return JsonResponse({
                'success': False,
                'error': 'No se pudo encontrar el asset_id del documento'
            }, status=404)
            
        except Exception as e:
            error_msg = f"Error al generar URL del documento: {str(e)}"
            print(error_msg)
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            return JsonResponse({
                'success': False,
                'error': error_msg
            }, status=500)
            
    except Exception as e:
        error_msg = f"Error general: {str(e)}"
        print(error_msg)
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return JsonResponse({
            'success': False,
            'error': error_msg
        }, status=500)

#------------------------------------------------------------------------------
#------------------------------GESTOR PROVEEDORES------------------------------
#------------------------------------------------------------------------------

#--------------------------GESTOR ENVIO --------------------------------
@login_required(login_url='login')
def mod_envio(request):
    return render(request, 'proveedor/envio.html')


@login_required(login_url='login')
def listar_envios(request):
    if request.method == 'GET':
        try:
            # Agregamos 'Factura' al select_related para optimizar las consultas
            envios = Envio.objects.all().select_related('Proveedor', 'Factura')
            data = []
            for envio in envios:
                # Preparar datos de factura
                factura_data = None
                if envio.Factura:
                    factura_data = {
                        'id': envio.Factura.id,
                        # Puedes agregar más campos de la factura si los necesitas
                    }

                data.append({
                    'id': envio.id,
                    'NombreEnvio': envio.NombreEnvio,
                    'CantidadEnvio': envio.CantidadEnvio,
                    'PrecioEnvio': str(envio.PrecioEnvio),
                    'TotalEnvio': str(envio.TotalEnvio),
                    'TipoEnvio': envio.TipoEnvio,
                    'FechaCompraEnvio': envio.FechaCompraEnvio.isoformat() if envio.FechaCompraEnvio else None,
                    'EnvioRecibido': envio.EnvioRecibido,
                    'DiasTranscurridos': envio.dias_transcurridos_actual,
                    'DescripcionEnvio': envio.DescripcionEnvio,
                    'Proveedor': {
                        'id': envio.Proveedor.id,
                        'NombreProveedor': envio.Proveedor.NombreProveedor,
                        'RutProveedor': envio.Proveedor.RutProveedor,
                        'MarcaProveedor': envio.Proveedor.MarcaProveedor
                    },
                    'FotoEnvio': envio.FotoEnvio.url if envio.FotoEnvio else None,
                    'Factura': factura_data  # Agregamos la información de la factura
                })
            return JsonResponse({
                'success': True,
                'envios': data
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)
    return JsonResponse({
        'success': False, 
        'message': 'Método no permitido'
    }, status=405)

@login_required(login_url='login')
@ensure_csrf_cookie 
def crear_envio(request):
    if request.method == 'POST':
        try:
            data = request.POST
            
            # Validaciones de campos requeridos
            campos_requeridos = ['NombreEnvio', 'CantidadEnvio', 'PrecioEnvio', 'TipoEnvio', 'Proveedor']
            errores = {}
            
            for campo in campos_requeridos:
                if not data.get(campo):
                    errores[campo] = f'El campo {campo} es requerido'
            
            if errores:
                return JsonResponse({
                    'success': False,
                    'errors': errores
                }, status=400)
            
            # Validación de tipo de envío
            tipo_envio = data.get('TipoEnvio')
            if tipo_envio not in ['material', 'herramienta']:
                return JsonResponse({
                    'success': False,
                    'errors': {
                        'TipoEnvio': 'El tipo de envío debe ser material o herramienta'
                    }
                }, status=400)
            
            # Validación y conversión de campos numéricos
            try:
                cantidad_envio = int(data.get('CantidadEnvio'))
                if cantidad_envio <= 0:
                    raise ValueError('La cantidad debe ser mayor a 0')
            except ValueError:
                return JsonResponse({
                    'success': False,
                    'errors': {
                        'CantidadEnvio': 'La cantidad debe ser un número entero positivo'
                    }
                }, status=400)

            try:
                precio_envio = Decimal(data.get('PrecioEnvio'))
                if precio_envio <= 0:
                    raise ValueError('El precio debe ser mayor a 0')
            except (ValueError, DecimalException):
                return JsonResponse({
                    'success': False,
                    'errors': {
                        'PrecioEnvio': 'El precio debe ser un número positivo'
                    }
                }, status=400)

            # Validación de fecha de compra opcional
            fecha_compra = None
            if data.get('FechaCompraEnvio'):
                try:
                    fecha_compra = datetime.strptime(data.get('FechaCompraEnvio'), '%Y-%m-%d').date()
                except ValueError:
                    return JsonResponse({
                        'success': False,
                        'errors': {
                            'FechaCompraEnvio': 'El formato de fecha debe ser YYYY-MM-DD'
                        }
                    }, status=400)
            
            try:
                proveedor = Proveedor.objects.get(id=data.get('Proveedor'))
            except (Proveedor.DoesNotExist, ValueError):
                return JsonResponse({
                    'success': False,
                    'errors': {
                        'Proveedor': 'Proveedor no válido'
                    }
                }, status=400)

            # Validación de Factura opcional
            factura = None
            if data.get('Factura'):
                try:
                    factura = Factura.objects.get(id=data.get('Factura'))
                except (Factura.DoesNotExist, ValueError):
                    return JsonResponse({
                        'success': False,
                        'errors': {
                            'Factura': 'Factura no válida'
                        }
                    }, status=400)
            
            nuevo_envio = Envio(
                NombreEnvio=data.get('NombreEnvio'),
                CantidadEnvio=cantidad_envio,
                PrecioEnvio=precio_envio,
                TotalEnvio=cantidad_envio * precio_envio,
                TipoEnvio=tipo_envio,
                FechaCompraEnvio=fecha_compra,
                EnvioRecibido=data.get('EnvioRecibido', '').lower() == 'true',
                DescripcionEnvio=data.get('DescripcionEnvio'),
                Proveedor=proveedor,
                Factura=factura  # Agregado campo Factura
            )
            
            # Manejar la foto
            if 'FotoEnvio' in request.FILES:
                foto = request.FILES['FotoEnvio']
                if foto.content_type not in ALLOWED_FILE_TYPES:
                    return JsonResponse({
                        'success': False,
                        'errors': {
                            'FotoEnvio': 'Formato no válido. Formatos permitidos: JPG, PNG, GIF, BMP, WEBP, TIFF, SVG, PDF'
                        }
                    }, status=400)

                if foto.size > 10 * 1024 * 1024:
                    return JsonResponse({
                        'success': False,
                        'errors': {
                            'FotoEnvio': 'El archivo es demasiado grande. El tamaño máximo permitido es 10MB'
                        }
                    }, status=400)

                nuevo_envio.FotoEnvio = foto

            try:
                nuevo_envio.full_clean()
            except ValidationError as e:
                errores_formateados = {campo: errores[0] if errores else str(errores) 
                                     for campo, errores in e.message_dict.items()}
                return JsonResponse({
                    'success': False,
                    'errors': errores_formateados
                }, status=400)
            
            nuevo_envio.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Envío creado exitosamente',
                'envio': {
                    'id': nuevo_envio.id,
                    'NombreEnvio': nuevo_envio.NombreEnvio,
                    'CantidadEnvio': nuevo_envio.CantidadEnvio,
                    'PrecioEnvio': str(nuevo_envio.PrecioEnvio),
                    'TotalEnvio': str(nuevo_envio.TotalEnvio),
                    'TipoEnvio': nuevo_envio.TipoEnvio,
                    'FechaCompraEnvio': nuevo_envio.FechaCompraEnvio.isoformat() if nuevo_envio.FechaCompraEnvio else None,
                    'EnvioRecibido': nuevo_envio.EnvioRecibido,
                    'DiasTranscurridos': nuevo_envio.dias_transcurridos_actual,
                    'DescripcionEnvio': nuevo_envio.DescripcionEnvio,
                    'Proveedor': {
                        'id': nuevo_envio.Proveedor.id,
                        'NombreProveedor': nuevo_envio.Proveedor.NombreProveedor,
                        'RutProveedor': nuevo_envio.Proveedor.RutProveedor
                    },
                    'FotoEnvio': nuevo_envio.FotoEnvio.url if nuevo_envio.FotoEnvio else None,
                    'Factura': {  # Agregada información de factura
                        'id': nuevo_envio.Factura.id,
                        'NumeroFactura': nuevo_envio.Factura.NumeroFactura,
                    } if nuevo_envio.Factura else None
                }
            })
            
        except Exception as e:
            logger.error(f"Error al crear envío: {str(e)}")
            return JsonResponse({
                'success': False,
                'errors': {
                    'general': f'Error al crear el envío: {str(e)}'
                }
            }, status=400)
    
    return JsonResponse({
        'success': False,
        'errors': {
            'general': 'Método no permitido'
        }
    }, status=405)
    
@login_required(login_url='login')
@ensure_csrf_cookie
def eliminar_envio(request, envio_id):
    if request.method == 'DELETE':
        try:
            # Obtener el envío
            envio = get_object_or_404(Envio, id=envio_id)
            
            # Guardar información para la respuesta
            nombre_envio = envio.NombreEnvio
            tipo_envio = envio.TipoEnvio
            nombre_proveedor = envio.Proveedor.NombreProveedor
            
            # Si existe una foto, eliminarla de Cloudinary
            if envio.FotoEnvio:
                try:
                    # Obtener la URL de la imagen
                    url = envio.FotoEnvio.url
                    
                    # Extraer el public_id
                    parts = url.split('/')
                    public_id = f"{parts[-2]}/{parts[-1].split('.')[0]}"
                    
                    print(f"Intentando eliminar foto con public_id: {public_id}")
                    
                    # Configurar Cloudinary
                    cloudinary.config(
                        cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
                        api_key=os.getenv('CLOUDINARY_API_KEY'),
                        api_secret=os.getenv('CLOUDINARY_API_SECRET')
                    )
                    
                    # Eliminar la foto
                    result = cloudinary.uploader.destroy(
                        public_id,
                        resource_type="image",
                        type="upload"
                    )
                    print(f"Resultado de eliminación foto Cloudinary: {result}")
                    
                except Exception as cloud_error:
                    print(f"Error al eliminar foto de Cloudinary: {str(cloud_error)}")
                    print(f"URL de la foto: {envio.FotoEnvio.url}")
            
            # Eliminar el envío
            envio.delete()
            
            return JsonResponse({
                'success': True,
                'message': f'El envío "{nombre_envio}" ({tipo_envio}) del proveedor {nombre_proveedor} y sus archivos asociados fueron eliminados exitosamente'
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Error al eliminar el envío: {str(e)}'
            }, status=500)
            
    return JsonResponse({
        'success': False,
        'message': 'Método no permitido'
    }, status=405)

@login_required(login_url='login')
@ensure_csrf_cookie
def actualizar_envio(request, envio_id):
    if request.method in ['PUT', 'POST']:
        try:
            envio = get_object_or_404(Envio, id=envio_id)
            data = request.POST
            
            # Debug: Imprimir todos los datos recibidos
            print("Datos recibidos:", dict(data))
            
            campos_requeridos = ['NombreEnvio', 'CantidadEnvio', 'PrecioEnvio', 'TipoEnvio', 'Proveedor']
            errores = {}
            
            for campo in campos_requeridos:
                if not data.get(campo):
                    errores[campo] = f'El campo {campo} es requerido'
            
            if errores:
                return JsonResponse({'success': False, 'errors': errores}, status=400)

            # Validación de tipo de envío
            tipo_envio = data.get('TipoEnvio')
            if tipo_envio not in ['material', 'herramienta']:
                return JsonResponse({
                    'success': False,
                    'errors': {
                        'TipoEnvio': 'El tipo de envío debe ser material o herramienta'
                    }
                }, status=400)

            # Validación de campos numéricos
            try:
                cantidad_envio = int(data.get('CantidadEnvio'))
                if cantidad_envio <= 0:
                    raise ValueError('La cantidad debe ser mayor a 0')
            except ValueError:
                return JsonResponse({
                    'success': False,
                    'errors': {'CantidadEnvio': 'La cantidad debe ser un número entero positivo'}
                }, status=400)

            try:
                precio_envio = Decimal(data.get('PrecioEnvio'))
                if precio_envio <= 0:
                    raise ValueError('El precio debe ser mayor a 0')
            except (ValueError, DecimalException):
                return JsonResponse({
                    'success': False,
                    'errors': {'PrecioEnvio': 'El precio debe ser un número positivo'}
                }, status=400)

            # Validación de fecha de compra opcional
            fecha_compra = None
            if data.get('FechaCompraEnvio'):
                try:
                    fecha_compra = datetime.strptime(data.get('FechaCompraEnvio'), '%Y-%m-%d').date()
                except ValueError:
                    return JsonResponse({
                        'success': False,
                        'errors': {'FechaCompraEnvio': 'El formato de fecha debe ser YYYY-MM-DD'}
                    }, status=400)
            
            # Validación del proveedor
            try:
                proveedor = Proveedor.objects.get(id=data.get('Proveedor'))
            except (Proveedor.DoesNotExist, ValueError):
                return JsonResponse({
                    'success': False,
                    'errors': {'Proveedor': 'Proveedor no válido'}
                }, status=400)

            # Validación de la factura (opcional)
            factura = None
            if data.get('Factura'):
                try:
                    factura = Factura.objects.get(id=data.get('Factura'))
                except (Factura.DoesNotExist, ValueError):
                    return JsonResponse({
                        'success': False,
                        'errors': {'Factura': 'Factura no válida'}
                    }, status=400)

            # Manejar la foto
            if data.get('eliminar_FotoEnvio', '').lower() == 'true' and envio.FotoEnvio:
                try:
                    url = envio.FotoEnvio.url
                    parts = url.split('/')
                    public_id = f"{parts[-2]}/{parts[-1].split('.')[0]}"
                    
                    print(f"Intentando eliminar foto con public_id: {public_id}")
                    
                    cloudinary.config(
                        cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
                        api_key=os.getenv('CLOUDINARY_API_KEY'),
                        api_secret=os.getenv('CLOUDINARY_API_SECRET')
                    )
                    
                    result = cloudinary.uploader.destroy(
                        public_id,
                        resource_type="image",
                        type="upload",
                        invalidate=True
                    )
                    print(f"Resultado de eliminación foto: {result}")
                    
                    envio.FotoEnvio = None
                    
                except Exception as e:
                    print(f"Error al eliminar foto: {str(e)}")
                    return JsonResponse({
                        'success': False,
                        'errors': {'FotoEnvio': f'Error al eliminar la foto: {str(e)}'}
                    }, status=400)
            
            elif 'FotoEnvio' in request.FILES:
                foto = request.FILES['FotoEnvio']
                
                if foto.size > 10 * 1024 * 1024:
                    return JsonResponse({
                        'success': False,
                        'errors': {'FotoEnvio': 'El archivo es demasiado grande. El tamaño máximo permitido es 10MB'}
                    }, status=400)
                
                if foto.content_type not in ALLOWED_FILE_TYPES:
                    return JsonResponse({
                        'success': False,
                        'errors': {'FotoEnvio': 'Formato no válido. Formatos permitidos: JPG, PNG, GIF, BMP, WEBP, TIFF, SVG'}
                    }, status=400)
                
                if envio.FotoEnvio:
                    try:
                        url = envio.FotoEnvio.url
                        parts = url.split('/')
                        public_id = f"{parts[-2]}/{parts[-1].split('.')[0]}"
                        
                        cloudinary.config(
                            cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
                            api_key=os.getenv('CLOUDINARY_API_KEY'),
                            api_secret=os.getenv('CLOUDINARY_API_SECRET')
                        )
                        
                        cloudinary.uploader.destroy(
                            public_id,
                            resource_type="image",
                            type="upload",
                            invalidate=True
                        )
                    except Exception as e:
                        print(f"Error al eliminar foto anterior: {str(e)}")
                
                envio.FotoEnvio = foto

            # Actualizar campos del envío
            envio.NombreEnvio = data.get('NombreEnvio')
            envio.CantidadEnvio = cantidad_envio
            envio.PrecioEnvio = precio_envio
            envio.TotalEnvio = cantidad_envio * precio_envio
            envio.TipoEnvio = tipo_envio
            envio.FechaCompraEnvio = fecha_compra
            envio.EnvioRecibido = data.get('EnvioRecibido', '').lower() == 'true'
            envio.DescripcionEnvio = data.get('DescripcionEnvio')
            envio.Proveedor = proveedor
            envio.Factura = factura  # Asignar la factura (puede ser None)
            
            try:
                envio.full_clean()
                envio.save()
            except ValidationError as e:
                errores_formateados = {campo: errores[0] if errores else str(errores) 
                                     for campo, errores in e.message_dict.items()}
                return JsonResponse({'success': False, 'errors': errores_formateados}, status=400)

            return JsonResponse({
                'success': True,
                'message': 'Envío actualizado exitosamente',
                'envio': {
                    'id': envio.id,
                    'NombreEnvio': envio.NombreEnvio,
                    'CantidadEnvio': envio.CantidadEnvio,
                    'PrecioEnvio': str(envio.PrecioEnvio),
                    'TotalEnvio': str(envio.TotalEnvio),
                    'TipoEnvio': envio.TipoEnvio,
                    'FechaCompraEnvio': envio.FechaCompraEnvio.isoformat() if envio.FechaCompraEnvio else None,
                    'EnvioRecibido': envio.EnvioRecibido,
                    'DiasTranscurridos': envio.dias_transcurridos_actual,
                    'DescripcionEnvio': envio.DescripcionEnvio,
                    'Proveedor': {
                        'id': envio.Proveedor.id,
                        'NombreProveedor': envio.Proveedor.NombreProveedor,
                        'RutProveedor': envio.Proveedor.RutProveedor,
                        'MarcaProveedor': envio.Proveedor.MarcaProveedor
                    },
                    'Factura': {  # Agregar información de la factura
                        'id': envio.Factura.id,
                        'NumeroFactura': envio.Factura.NumeroFactura,
                    } if envio.Factura else None,
                    'FotoEnvio': envio.FotoEnvio.url if envio.FotoEnvio else None
                }
            })
            
        except Exception as e:
            print(f"Error general: {str(e)}")
            return JsonResponse({
                'success': False,
                'errors': {'general': f'Error al actualizar el envío: {str(e)}'}
            }, status=400)

    return JsonResponse({
        'success': False,
        'errors': {'general': 'Método no permitido'}
    }, status=405)

def exportar_envios_excel(request):
    # Crear un buffer en memoria
    output = BytesIO()
    
    # Crear un nuevo archivo Excel con la opción remove_timezone
    workbook = xlsxwriter.Workbook(output, {'remove_timezone': True})
    worksheet = workbook.add_worksheet('Envíos')
    
    # Agregar formatos
    header_format = workbook.add_format({
        'bold': True,
        'bg_color': '#000000',
        'font_color': 'white',
        'border': 1
    })
    
    date_format = workbook.add_format({
        'num_format': 'dd/mm/yyyy',
    })

    currency_format = workbook.add_format({
        'num_format': '$#,##0.00',
    })
    
    # Definir encabezados actualizados
    headers = [
        'Nombre Envío',
        'Tipo',
        'Cantidad',
        'Precio',
        'Total',
        'Estado',
        'Fecha Compra',
        'Días Transcurridos',  # Nuevo campo
        'Descripción',
        'Nombre Proveedor',
        'RUT Proveedor',
        'Marca Proveedor'
    ]
    
    # Escribir encabezados
    for col, header in enumerate(headers):
        worksheet.write(0, col, header, header_format)
        worksheet.set_column(col, col, 15)  # Establecer ancho de columna
    
    # Obtener datos de envíos con sus proveedores relacionados
    envios = Envio.objects.all().select_related('Proveedor').order_by('-FechaCompraEnvio')
    
    # Escribir datos
    for row, envio in enumerate(envios, start=1):
        worksheet.write(row, 0, envio.NombreEnvio)
        worksheet.write(row, 1, 'Material' if envio.TipoEnvio == 'material' else 'Herramienta')
        worksheet.write(row, 2, envio.CantidadEnvio)
        worksheet.write_number(row, 3, float(envio.PrecioEnvio), currency_format)
        worksheet.write_number(row, 4, float(envio.TotalEnvio), currency_format)
        worksheet.write(row, 5, 'Recibido' if envio.EnvioRecibido else 'Pendiente')
        
        if envio.FechaCompraEnvio:
            worksheet.write_datetime(row, 6, envio.FechaCompraEnvio, date_format)
        else:
            worksheet.write(row, 6, '')
            
        # Escribir días transcurridos
        worksheet.write_number(row, 7, envio.dias_transcurridos_actual)
            
        worksheet.write(row, 8, envio.DescripcionEnvio or '')
        worksheet.write(row, 9, envio.Proveedor.NombreProveedor)
        worksheet.write(row, 10, envio.Proveedor.RutProveedor)
        worksheet.write(row, 11, envio.Proveedor.MarcaProveedor)

    # Ajustar anchos de columna automáticamente basado en el contenido
    for col, header in enumerate(headers):
        worksheet.set_column(col, col, len(header) + 2)
    
    workbook.close()
    
    # Preparar la respuesta
    output.seek(0)
    
    # Generar nombre del archivo con la fecha actual
    filename = f'Envios_{timezone.localtime().strftime("%Y%m%d_%H%M%S")}.xlsx'
    
    response = HttpResponse(
        output.read(),
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    
    return response

@csrf_exempt
@require_http_methods(["GET"])
def obtener_tiempo_detallado(request, envio_id):
    try:
        print(f"⭐ Procesando solicitud para envío ID: {envio_id}")
        
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT id FROM dashboard_envio WHERE id = %s
            """, [envio_id])
            
            if not cursor.fetchone():
                print("❌ Envío no encontrado")
                return JsonResponse({'error': 'Envío no encontrado'}, status=404)
            
            cursor.execute("""
                SELECT * FROM obtener_tiempo_detallado(%s);
            """, [envio_id])
            
            row = cursor.fetchone()
            print(f"📊 Datos obtenidos de DB: {row}")
            
            if row:
                data = {
                    'dias': row[0],
                    'horas': row[1],
                    'minutos': row[2],
                    'segundos': row[3],
                    'texto_estado': row[4] if len(row) > 4 else None
                }
                print(f"✅ Enviando datos: {json.dumps(data)}")
                return JsonResponse(data)
            else:
                print("❌ No se obtuvieron datos del procedimiento")
                return JsonResponse({'error': 'Error al calcular el tiempo'}, status=500)
                
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)
    
@require_http_methods(["PATCH"])
def toggle_envio_status(request, envio_id):
    try:
        envio = Envio.objects.get(pk=envio_id)
        envio.EnvioRecibido = not envio.EnvioRecibido
        
        # Si el envío se marca como no recibido, actualizar los días transcurridos
        if not envio.EnvioRecibido:
            envio.DiasTranscurridos = (date.today() - envio.FechaCompraEnvio).days
            
        envio.save()
        
        return JsonResponse({
            'status': 'success',
            'data': {
                'id': envio.id,
                'estado': envio.EnvioRecibido,
                'diasTranscurridos': envio.DiasTranscurridos
            }
        })
        
    except Envio.DoesNotExist:
        return JsonResponse({
            'status': 'error',
            'error': 'Envío no encontrado'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'error': str(e)
        }, status=400)
        
        
def consultar_proveedores_detalle(request):
    numero_factura = request.GET.get('factura', '').strip()
    nombre_envio = request.GET.get('material', '').strip()
    
    with connection.cursor() as cursor:
        try:
            query = """
                WITH envios_json AS (
                    SELECT 
                        f.id as factura_id,
                        json_agg(
                            json_build_object(
                                'NombreEnvio', e."NombreEnvio",
                                'CantidadEnvio', e."CantidadEnvio", 
                                'TotalEnvio', e."TotalEnvio",
                                'EnvioRecibido', e."EnvioRecibido"
                            ) ORDER BY e."NombreEnvio"
                        ) FILTER (WHERE e.id IS NOT NULL AND 
                                (%s = '' OR LOWER(e."NombreEnvio") LIKE LOWER(%s))) as envios_data
                    FROM dashboard_factura f
                    LEFT JOIN dashboard_envio e ON e."Factura_id" = f.id 
                    GROUP BY f.id
                ),
                facturas_filtradas AS (
                    SELECT 
                        f.*,
                        ej.envios_data
                    FROM dashboard_factura f
                    LEFT JOIN envios_json ej ON ej.factura_id = f.id
                    WHERE (%s = '' OR LOWER(f."NumeroFactura") LIKE LOWER(%s))
                )
                SELECT 
                    p.id,
                    p."NombreProveedor",
                    p."RutProveedor",
                    p."MarcaProveedor",
                    p."ComentarioProveedor", 
                    p."CiudadProveedor",
                    p."RegionProveedor",
                    p."PaisProveedor",
                    p."TelefonoProveedor",
                    p."FotoProveedor",   
                    p."FechaCreacionProveedor",
                    COALESCE(
                        json_agg(
                            json_build_object(
                                'NumeroFactura', ff."NumeroFactura",
                                'FechaEmision', ff."FechaEmision",
                                'envios', COALESCE(ff.envios_data, '[]'::json)
                            )
                        ) FILTER (WHERE ff.id IS NOT NULL),
                        '[]'::json
                    ) as facturas
                FROM dashboard_proveedor p
                LEFT JOIN facturas_filtradas ff ON ff."Proveedor_id" = p.id
                GROUP BY p.id
                HAVING 
                    CASE 
                        WHEN %s != '' OR %s != '' THEN
                            EXISTS (
                                SELECT 1 
                                FROM dashboard_factura f2 
                                JOIN dashboard_envio e2 ON e2."Factura_id" = f2.id
                                WHERE f2."Proveedor_id" = p.id 
                                AND (
                                    %s = '' OR LOWER(f2."NumeroFactura") LIKE LOWER(%s)
                                )
                                AND (
                                    %s = '' OR LOWER(e2."NombreEnvio") LIKE LOWER(%s)
                                )
                            )
                        ELSE true
                    END
            """
            
            envio_pattern = f'%{nombre_envio}%'
            factura_pattern = f'%{numero_factura}%'
            
            params = [
                nombre_envio, envio_pattern,  # Para el filtrado inicial de envíos
                numero_factura, factura_pattern,  # Para el filtrado de facturas
                numero_factura, nombre_envio,  # Para la condición del CASE
                numero_factura, factura_pattern,  # Para el EXISTS de facturas
                nombre_envio, envio_pattern,  # Para el EXISTS de envíos
            ]
            
            cursor.execute(query, params)
            
            columns = [col[0] for col in cursor.description]
            proveedores = [dict(zip(columns, row)) for row in cursor.fetchall()]
            
            # Procesa las URLs de fotos y fechas
            for proveedor in proveedores:
                if proveedor['FotoProveedor']:
                    foto_url = proveedor['FotoProveedor'].strip()
                    if foto_url.startswith('image/upload/'):
                        foto_url = foto_url.replace('image/upload/', '')
                    proveedor['FotoProveedor'] = f"https://res.cloudinary.com/dfqlvd3d4/image/upload/{foto_url}"
                
                if proveedor['FechaCreacionProveedor']:
                    proveedor['FechaCreacionProveedor'] = proveedor['FechaCreacionProveedor'].isoformat()
                
                if proveedor['facturas'] is None:
                    proveedor['facturas'] = []
                
                # Solo mantenemos las facturas que tienen envíos después del filtrado
                if nombre_envio:
                    proveedor['facturas'] = [
                        factura for factura in proveedor['facturas']
                        if factura['envios'] and len(factura['envios']) > 0
                    ]

            return JsonResponse({
                'success': True,
                'proveedores': proveedores
            })
            
        except Exception as e:
            print("Error en consultar_proveedores_detalle:", str(e))
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)
           
def consultar_facturas_detalle(request):
   with connection.cursor() as cursor:
       try:
           cursor.execute("""
               WITH envios_json AS (
                   SELECT 
                       f.id as factura_id,
                       json_agg(
                           json_build_object(
                               'NombreEnvio', e."NombreEnvio",
                               'CantidadEnvio', e."CantidadEnvio", 
                               'TotalEnvio', e."TotalEnvio",
                               'EnvioRecibido', e."EnvioRecibido"
                           ) ORDER BY e.id
                       ) as envios_data
                   FROM dashboard_envio e
                   JOIN dashboard_factura f ON e."Factura_id" = f.id 
                   GROUP BY f.id
               )
               SELECT 
                   f.id,
                   f."NumeroFactura",
                   f."FechaEmision",
                   f."FotoFactura",
                   f."DocumentoFactura",
                   json_build_object(
                       'id', p.id,
                       'NombreProveedor', p."NombreProveedor",
                       'RutProveedor', p."RutProveedor",
                       'MarcaProveedor', p."MarcaProveedor"
                   ) as "Proveedor",
                   COALESCE(ej.envios_data, '[]'::json) as envios
               FROM dashboard_factura f
               INNER JOIN dashboard_proveedor p ON f."Proveedor_id" = p.id
               LEFT JOIN envios_json ej ON ej.factura_id = f.id
               ORDER BY f."FechaEmision" DESC
           """)
           
           columns = [col[0] for col in cursor.description]
           facturas = [dict(zip(columns, row)) for row in cursor.fetchall()]

           for factura in facturas:
               if factura['FotoFactura']:
                   foto_url = factura['FotoFactura'].strip()
                   if foto_url.startswith('image/upload/'):
                       foto_url = foto_url.replace('image/upload/', '')
                   factura['FotoFactura'] = f"https://res.cloudinary.com/dfqlvd3d4/image/upload/{foto_url}"
               
               if factura['DocumentoFactura']:
                   doc_url = factura['DocumentoFactura'].strip()
                   if doc_url.startswith('raw/upload/'):
                       doc_url = doc_url.replace('raw/upload/', '')
                   factura['DocumentoFactura'] = f"https://res.cloudinary.com/dfqlvd3d4/raw/upload/{doc_url}"
           
           return JsonResponse({
               'success': True,
               'facturas': facturas
           })
       except Exception as e:
           print("Error en consultar_facturas_detalle:", str(e))
           return JsonResponse({
               'success': False,
               'message': str(e)
           }, status=500)
           
           
           
           
#------------------------LOGICA PARA EL MATERIAL---------------------
@login_required(login_url='login')
def mod_material(request):
    return render(request, 'material/material.html')




@login_required(login_url='login')
@ensure_csrf_cookie 
def crear_material(request):
    if request.method == 'POST':
        try:
            data = request.POST
            
            # Validaciones de campos requeridos según el modelo
            campos_requeridos = ['NombreMaterial', 'StockMaterial', 'PrecioMaterial']
            errores = {}
            
            for campo in campos_requeridos:
                if not data.get(campo):
                    errores[campo] = f'El campo {campo} es requerido'
            
            if errores:
                return JsonResponse({
                    'success': False,
                    'errors': errores
                }, status=400)
            
            # Validación y conversión de campos numéricos
            try:
                stock_material = int(data.get('StockMaterial'))
                if stock_material < 0:  # PositiveIntegerField validation
                    raise ValueError('El stock no puede ser negativo')
            except ValueError:
                return JsonResponse({
                    'success': False,
                    'errors': {
                        'StockMaterial': 'El stock debe ser un número entero no negativo'
                    }
                }, status=400)

            try:
                precio_material = Decimal(data.get('PrecioMaterial'))
                if precio_material <= 0:
                    raise ValueError('El precio debe ser mayor a 0')
            except (ValueError, DecimalException):
                return JsonResponse({
                    'success': False,
                    'errors': {
                        'PrecioMaterial': 'El precio debe ser un número positivo'
                    }
                }, status=400)

            # Validación de Proveedor opcional
            proveedor = None
            if data.get('Proveedor'):
                try:
                    proveedor = Proveedor.objects.get(id=data.get('Proveedor'))
                except (Proveedor.DoesNotExist, ValueError):
                    return JsonResponse({
                        'success': False,
                        'errors': {
                            'Proveedor': 'Proveedor no válido'
                        }
                    }, status=400)

            # Validación de Envío opcional
            envio = None
            if data.get('Envio'):
                try:
                    envio = Envio.objects.get(id=data.get('Envio'))
                except (Envio.DoesNotExist, ValueError):
                    return JsonResponse({
                        'success': False,
                        'errors': {
                            'Envio': 'Envío no válido'
                        }
                    }, status=400)
            
            nuevo_material = Material(
                NombreMaterial=data.get('NombreMaterial'),
                StockMaterial=stock_material,
                # StockOriginal se establecerá automáticamente en el save() del modelo
                PrecioMaterial=precio_material,
                TotalMaterial=stock_material * precio_material,
                DescripcionMaterial=data.get('DescripcionMaterial'),
                ColorMaterial=data.get('ColorMaterial'),
                PesoMaterial=data.get('PesoMaterial'),
                DimensionesMaterial=data.get('DimensionesMaterial'),
                DetalleMaterial=data.get('DetalleMaterial'),
                EstadoMaterial=data.get('EstadoMaterial', ''),
                UbicacionMaterial=data.get('UbicacionMaterial', ''),
                Proveedor=proveedor,
                Envio=envio
            )
            
            # Manejar la foto opcional
            if 'FotoMaterial' in request.FILES:
                foto = request.FILES['FotoMaterial']
                if foto.content_type not in ALLOWED_FILE_TYPES:
                    return JsonResponse({
                        'success': False,
                        'errors': {
                            'FotoMaterial': 'Formato no válido. Formatos permitidos: JPG, PNG, GIF, BMP, WEBP, TIFF, SVG, PDF'
                        }
                    }, status=400)

                if foto.size > 10 * 1024 * 1024:
                    return JsonResponse({
                        'success': False,
                        'errors': {
                            'FotoMaterial': 'El archivo es demasiado grande. El tamaño máximo permitido es 10MB'
                        }
                    }, status=400)

                nuevo_material.FotoMaterial = foto

            try:
                nuevo_material.full_clean()
            except ValidationError as e:
                errores_formateados = {campo: errores[0] if errores else str(errores) 
                                     for campo, errores in e.message_dict.items()}
                return JsonResponse({
                    'success': False,
                    'errors': errores_formateados
                }, status=400)
            
            nuevo_material.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Material creado exitosamente',
                'material': {
                    'id': nuevo_material.id,
                    'NombreMaterial': nuevo_material.NombreMaterial,
                    'StockMaterial': nuevo_material.StockMaterial,
                    'StockOriginal': nuevo_material.StockOriginal,  # Añadido
                    'PrecioMaterial': str(nuevo_material.PrecioMaterial),
                    'TotalMaterial': str(nuevo_material.TotalMaterial),
                    'DescripcionMaterial': nuevo_material.DescripcionMaterial,
                    'ColorMaterial': nuevo_material.ColorMaterial,
                    'PesoMaterial': nuevo_material.PesoMaterial,
                    'DimensionesMaterial': nuevo_material.DimensionesMaterial,
                    'DetalleMaterial': nuevo_material.DetalleMaterial,
                    'EstadoMaterial': nuevo_material.EstadoMaterial,
                    'UbicacionMaterial': nuevo_material.UbicacionMaterial,
                    'FotoMaterial': nuevo_material.FotoMaterial.url if nuevo_material.FotoMaterial else None,
                    'RegistroFacturaMaterial': nuevo_material.RegistroFacturaMaterial,
                    'stock_usado': nuevo_material.stock_usado,  # Añadido
                    'porcentaje_stock_disponible': nuevo_material.porcentaje_stock_disponible,  # Añadido
                    'Proveedor': {
                        'id': nuevo_material.Proveedor.id,
                        'NombreProveedor': nuevo_material.Proveedor.NombreProveedor,
                        'RutProveedor': nuevo_material.Proveedor.RutProveedor
                    } if nuevo_material.Proveedor else None,
                    'Envio': {
                        'id': nuevo_material.Envio.id,
                        'NombreEnvio': nuevo_material.Envio.NombreEnvio
                    } if nuevo_material.Envio else None
                }
            })
            
        except Exception as e:
            logger.error(f"Error al crear material: {str(e)}")
            return JsonResponse({
                'success': False,
                'errors': {
                    'general': f'Error al crear el material: {str(e)}'
                }
            }, status=400)
    
    return JsonResponse({
        'success': False,
        'errors': {
            'general': 'Método no permitido'
        }
    }, status=405)
    
@login_required(login_url='login')
@ensure_csrf_cookie
def actualizar_material(request, material_id):
    if request.method in ['PUT', 'POST']:
        try:
            material = get_object_or_404(Material, id=material_id)
            data = request.POST
            
            # Debug: Imprimir todos los datos recibidos
            print("Datos recibidos:", dict(data))
            
            # Validar campos requeridos
            campos_requeridos = ['NombreMaterial', 'StockOriginal', 'PrecioMaterial']
            errores = {}
            
            for campo in campos_requeridos:
                if not data.get(campo):
                    errores[campo] = f'El campo {campo} es requerido'
            
            if errores:
                return JsonResponse({'success': False, 'errors': errores}, status=400)

            # Validación y conversión de campos numéricos
            try:
                nuevo_stock_original = int(data.get('StockOriginal'))
                if nuevo_stock_original < 0:
                    raise ValueError('El stock original no puede ser negativo')
                
                # Calcular cuánto material se ha usado
                material_usado = material.StockOriginal - material.StockMaterial
                
                # El nuevo stock actual será el nuevo stock original menos el material ya usado
                nuevo_stock_actual = nuevo_stock_original - material_usado
                
                # Verificar que el nuevo stock actual no sea negativo
                if nuevo_stock_actual < 0:
                    raise ValueError('El nuevo stock original debe ser mayor o igual al material ya usado')

            except ValueError as e:
                return JsonResponse({
                    'success': False,
                    'errors': {'StockOriginal': str(e)}
                }, status=400)

            try:
                precio_material = Decimal(data.get('PrecioMaterial'))
                if precio_material <= 0:
                    raise ValueError('El precio debe ser mayor a 0')
            except (ValueError, DecimalException):
                return JsonResponse({
                    'success': False,
                    'errors': {'PrecioMaterial': 'El precio debe ser un número positivo'}
                }, status=400)

            # Validación del proveedor (opcional)
            proveedor = None
            if data.get('Proveedor'):
                try:
                    proveedor = Proveedor.objects.get(id=data.get('Proveedor'))
                except (Proveedor.DoesNotExist, ValueError):
                    return JsonResponse({
                        'success': False,
                        'errors': {'Proveedor': 'Proveedor no válido'}
                    }, status=400)

            # Validación del envío (opcional)
            envio = None
            if data.get('Envio'):
                try:
                    envio = Envio.objects.get(id=data.get('Envio'))
                except (Envio.DoesNotExist, ValueError):
                    return JsonResponse({
                        'success': False,
                        'errors': {'Envio': 'Envío no válido'}
                    }, status=400)

            # Manejar la foto
            if data.get('eliminar_FotoMaterial', '').lower() == 'true' and material.FotoMaterial:
                try:
                    url = material.FotoMaterial.url
                    parts = url.split('/')
                    public_id = f"{parts[-2]}/{parts[-1].split('.')[0]}"
                    
                    print(f"Intentando eliminar foto con public_id: {public_id}")
                    
                    cloudinary.config(
                        cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
                        api_key=os.getenv('CLOUDINARY_API_KEY'),
                        api_secret=os.getenv('CLOUDINARY_API_SECRET')
                    )
                    
                    result = cloudinary.uploader.destroy(
                        public_id,
                        resource_type="image",
                        type="upload",
                        invalidate=True
                    )
                    print(f"Resultado de eliminación foto: {result}")
                    
                    material.FotoMaterial = None
                    
                except Exception as e:
                    print(f"Error al eliminar foto: {str(e)}")
                    return JsonResponse({
                        'success': False,
                        'errors': {'FotoMaterial': f'Error al eliminar la foto: {str(e)}'}
                    }, status=400)
            
            elif 'FotoMaterial' in request.FILES:
                foto = request.FILES['FotoMaterial']
                
                if foto.size > 10 * 1024 * 1024:
                    return JsonResponse({
                        'success': False,
                        'errors': {'FotoMaterial': 'El archivo es demasiado grande. El tamaño máximo permitido es 10MB'}
                    }, status=400)
                
                if foto.content_type not in ALLOWED_FILE_TYPES:
                    return JsonResponse({
                        'success': False,
                        'errors': {'FotoMaterial': 'Formato no válido. Formatos permitidos: JPG, PNG, GIF, BMP, WEBP, TIFF, SVG'}
                    }, status=400)
                
                if material.FotoMaterial:
                    try:
                        url = material.FotoMaterial.url
                        parts = url.split('/')
                        public_id = f"{parts[-2]}/{parts[-1].split('.')[0]}"
                        
                        cloudinary.config(
                            cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
                            api_key=os.getenv('CLOUDINARY_API_KEY'),
                            api_secret=os.getenv('CLOUDINARY_API_SECRET')
                        )
                        
                        cloudinary.uploader.destroy(
                            public_id,
                            resource_type="image",
                            type="upload",
                            invalidate=True
                        )
                    except Exception as e:
                        print(f"Error al eliminar foto anterior: {str(e)}")
                
                material.FotoMaterial = foto

            # Actualizar campos del material
            material.NombreMaterial = data.get('NombreMaterial')
            material.StockOriginal = nuevo_stock_original
            material.StockMaterial = nuevo_stock_actual
            material.PrecioMaterial = precio_material
            material.TotalMaterial = nuevo_stock_actual * precio_material
            # Campos no requeridos según el modelo
            material.EstadoMaterial = data.get('EstadoMaterial', material.EstadoMaterial)
            material.UbicacionMaterial = data.get('UbicacionMaterial', material.UbicacionMaterial)
            material.ColorMaterial = data.get('ColorMaterial', '')
            material.PesoMaterial = data.get('PesoMaterial', '')
            material.DimensionesMaterial = data.get('DimensionesMaterial', '')
            material.DetalleMaterial = data.get('DetalleMaterial', '')
            material.DescripcionMaterial = data.get('DescripcionMaterial', '')
            material.Proveedor = proveedor
            material.Envio = envio
            
            try:
                material.full_clean()
                material.save()
            except ValidationError as e:
                errores_formateados = {campo: errores[0] if errores else str(errores) 
                                     for campo, errores in e.message_dict.items()}
                return JsonResponse({'success': False, 'errors': errores_formateados}, status=400)

            return JsonResponse({
                'success': True,
                'message': 'Material actualizado exitosamente',
                'material': {
                    'id': material.id,
                    'NombreMaterial': material.NombreMaterial,
                    'StockMaterial': material.StockMaterial,
                    'StockOriginal': material.StockOriginal,  # Añadido
                    'PrecioMaterial': str(material.PrecioMaterial),
                    'TotalMaterial': str(material.TotalMaterial),
                    'EstadoMaterial': material.EstadoMaterial,
                    'UbicacionMaterial': material.UbicacionMaterial,
                    'ColorMaterial': material.ColorMaterial,
                    'PesoMaterial': material.PesoMaterial,
                    'DimensionesMaterial': material.DimensionesMaterial,
                    'DetalleMaterial': material.DetalleMaterial,
                    'DescripcionMaterial': material.DescripcionMaterial,
                    'Proveedor': {
                        'id': material.Proveedor.id,
                        'NombreProveedor': material.Proveedor.NombreProveedor,
                        'RutProveedor': material.Proveedor.RutProveedor
                    } if material.Proveedor else None,
                    'Envio': {
                        'id': material.Envio.id,
                        'NombreEnvio': material.Envio.NombreEnvio,
                    } if material.Envio else None,
                    'FotoMaterial': material.FotoMaterial.url if material.FotoMaterial else None
                }
            })
            
        except Exception as e:
            print(f"Error general: {str(e)}")
            return JsonResponse({
                'success': False,
                'errors': {'general': f'Error al actualizar el material: {str(e)}'}
            }, status=400)

    return JsonResponse({
        'success': False,
        'errors': {'general': 'Método no permitido'}
    }, status=405)

@login_required(login_url='login')
@ensure_csrf_cookie 
def eliminar_material(request, material_id):
    if request.method == 'DELETE':
        try:
            # Obtener el material
            material = get_object_or_404(Material, id=material_id)
            
            # Guardar información para la respuesta
            nombre_material = material.NombreMaterial
            estado_material = material.EstadoMaterial
            nombre_proveedor = material.Proveedor.NombreProveedor if material.Proveedor else "Sin proveedor"
            
            # Si existe una foto, eliminarla de Cloudinary
            if material.FotoMaterial:
                try:
                    url = material.FotoMaterial.url
                    parts = url.split('/')
                    public_id = f"{parts[-2]}/{parts[-1].split('.')[0]}"
                    
                    print(f"Intentando eliminar foto con public_id: {public_id}")
                    
                    cloudinary.config(
                        cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
                        api_key=os.getenv('CLOUDINARY_API_KEY'),
                        api_secret=os.getenv('CLOUDINARY_API_SECRET')
                    )
                    
                    result = cloudinary.uploader.destroy(
                        public_id,
                        resource_type="image",
                        type="upload"
                    )
                    print(f"Resultado de eliminación foto Cloudinary: {result}")
                    
                except Exception as cloud_error:
                    print(f"Error al eliminar foto de Cloudinary: {str(cloud_error)}")
                    print(f"URL de la foto: {material.FotoMaterial.url}")
            
            # Eliminar el material
            material.delete()
            
            return JsonResponse({
                'success': True,
                'message': f'El material "{nombre_material}" ({estado_material}) del proveedor {nombre_proveedor} y sus archivos asociados fueron eliminados exitosamente'
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Error al eliminar el material: {str(e)}'
            }, status=500)
            
    return JsonResponse({
        'success': False,
        'message': 'Método no permitido'
    }, status=405)
@login_required(login_url='login')
def listar_materiales(request):
    if request.method == 'GET':
        try:
            # Optimizamos la consulta para traer solo los campos necesarios
            materiales = Material.objects.all().select_related('Proveedor').only(
                'id',
                'NombreMaterial',
                'StockMaterial',
                'StockOriginal',  # Añadido aquí
                'PrecioMaterial',
                'TotalMaterial',
                'FechaCompraMaterial',
                'DescripcionMaterial',
                'FotoMaterial',
                'Proveedor__id',
                'Proveedor__NombreProveedor'
            )

            data = []
            for material in materiales:
                proveedor_data = None
                if material.Proveedor:
                    proveedor_data = {
                        'id': material.Proveedor.id,
                        'NombreProveedor': material.Proveedor.NombreProveedor
                    }

                data.append({
                    'id': material.id,
                    'NombreMaterial': material.NombreMaterial,
                    'StockMaterial': material.StockMaterial,
                    'StockOriginal': material.StockOriginal,  # Añadido aquí
                    'PrecioMaterial': str(material.PrecioMaterial),
                    'TotalMaterial': str(material.TotalMaterial),
                    'DescripcionMaterial': material.DescripcionMaterial,
                    'FechaCompraMaterial': material.FechaCompraMaterial.isoformat() if material.FechaCompraMaterial else None,
                    'FotoMaterial': material.FotoMaterial.url if material.FotoMaterial else None,
                    'Proveedor': proveedor_data
                })

            return JsonResponse({
                'success': True,
                'materials': data
            })
        
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)
            
    return JsonResponse({
        'success': False, 
        'message': 'Método no permitido'
    }, status=405)
@login_required(login_url='login')
@ensure_csrf_cookie
def exportar_materiales_excel(request):
    # Crear un buffer en memoria
    output = BytesIO()
    
    # Crear un nuevo archivo Excel con la opción remove_timezone
    workbook = xlsxwriter.Workbook(output, {'remove_timezone': True})
    # Hoja para los datos
    worksheet_data = workbook.add_worksheet('Materiales')
    # Hojas para los gráficos
    worksheet_charts = workbook.add_worksheet('Gráficos')
    # Agregar formatos
    header_format = workbook.add_format({
        'bold': True,
        'bg_color': '#000000',
        'font_color': 'white',
        'border': 1
    })
    date_format = workbook.add_format({
        'num_format': 'dd/mm/yyyy',
    })

    # Definir encabezados
    headers = [
        'ID',
        'Nombre Material',
        'Stock',
        'Precio',
        'Total',
        'Estado',
        'Ubicación',
        'Fecha Compra',
        'Proveedor',
        'Registro Factura'
    ]
    
    # Escribir encabezados en hoja de datos
    for col, header in enumerate(headers):
        worksheet_data.write(0, col, header, header_format)
        worksheet_data.set_column(col, col, 15)

    # Obtener datos de materiales
    materiales = Material.objects.all().select_related('Proveedor').order_by('-FechaCompraMaterial')

    # Escribir datos
    for row, material in enumerate(materiales, start=1):
        worksheet_data.write(row, 0, material.id)
        worksheet_data.write(row, 1, material.NombreMaterial)
        worksheet_data.write(row, 2, material.StockMaterial)
        worksheet_data.write(row, 3, float(material.PrecioMaterial))
        worksheet_data.write(row, 4, float(material.TotalMaterial))
        worksheet_data.write(row, 5, material.EstadoMaterial)
        worksheet_data.write(row, 6, material.UbicacionMaterial)
        worksheet_data.write_datetime(row, 7, material.FechaCompraMaterial, date_format)
        worksheet_data.write(row, 8, material.Proveedor.NombreProveedor if material.Proveedor else 'Sin proveedor')
        worksheet_data.write(row, 9, material.RegistroFacturaMaterial)

    # Ajustar anchos de columna
    worksheet_data.set_column('A:A', 8)   # ID
    worksheet_data.set_column('B:B', 30)  # Nombre Material
    worksheet_data.set_column('C:D', 15)  # Stock y Precio
    worksheet_data.set_column('E:E', 20)  # Total
    worksheet_data.set_column('F:J', 18)  # Resto de columnas

    # Preparar datos para los gráficos
    proveedores_dict = {}
    estados_dict = {}
    for material in materiales:
        # Conteo por proveedor
        proveedor = material.Proveedor.NombreProveedor if material.Proveedor else 'Sin proveedor'
        proveedores_dict[proveedor] = proveedores_dict.get(proveedor, 0) + 1
        
        # Conteo por estado
        estado = material.EstadoMaterial
        estados_dict[estado] = estados_dict.get(estado, 0) + 1

    # Escribir datos para gráficos
    # Datos de proveedores
    worksheet_charts.write_row('A1', ['Proveedor', 'Cantidad'], header_format)
    for i, (proveedor, cantidad) in enumerate(proveedores_dict.items(), start=2):
        worksheet_charts.write(f'A{i}', proveedor)
        worksheet_charts.write(f'B{i}', cantidad)

    # Datos de estados
    worksheet_charts.write_row('D1', ['Estado', 'Cantidad'], header_format)
    for i, (estado, cantidad) in enumerate(estados_dict.items(), start=2):
        worksheet_charts.write(f'D{i}', estado)
        worksheet_charts.write(f'E{i}', cantidad)

    # Crear gráficos
    # 1. Gráfico de columnas (Materiales por Proveedor)
    column_chart = workbook.add_chart({'type': 'column'})
    column_chart.add_series({
        'name': 'Materiales por Proveedor',
        'categories': f'=Gráficos!$A$2:$A${len(proveedores_dict)+1}',
        'values': f'=Gráficos!$B$2:$B${len(proveedores_dict)+1}',
        'data_labels': {'value': True},
    })
    column_chart.set_title({'name': 'Distribución de Materiales por Proveedor'})
    column_chart.set_size({'width': 500, 'height': 300})
    worksheet_charts.insert_chart('G2', column_chart)

    # 2. Gráfico de pie (Estados de Materiales)
    pie_chart = workbook.add_chart({'type': 'pie'})
    pie_chart.add_series({
        'name': 'Estados de Materiales',
        'categories': f'=Gráficos!$D$2:$D${len(estados_dict)+1}',
        'values': f'=Gráficos!$E$2:$E${len(estados_dict)+1}',
        'data_labels': {'percentage': True},
    })
    pie_chart.set_title({'name': 'Distribución por Estado (%)'})
    pie_chart.set_size({'width': 500, 'height': 300})
    worksheet_charts.insert_chart('G18', pie_chart)

    workbook.close()

    # Preparar la respuesta
    output.seek(0)
    filename = f'Materiales_{timezone.localtime().strftime("%Y%m%d_%H%M%S")}.xlsx'
    
    response = HttpResponse(
        output.read(),
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    
    return response

@login_required(login_url='login')
def obtener_detalles_material(request, material_id):
    if request.method == 'GET':
        try:
            material = Material.objects.select_related('Proveedor', 'Envio').get(id=material_id)
            
            # Devolvemos todos los campos sin importar si son null
            data = {
                'id': material.id,
                'NombreMaterial': material.NombreMaterial,
                'StockMaterial': material.StockMaterial,
                'StockOriginal': material.StockOriginal,  # Añadido
                'stock_usado': material.stock_usado,  # Añadido
                'porcentaje_stock_disponible': material.porcentaje_stock_disponible,  # Añadido
                'PrecioMaterial': str(material.PrecioMaterial),
                'TotalMaterial': str(material.TotalMaterial),
                'FechaCompraMaterial': material.FechaCompraMaterial.isoformat() if material.FechaCompraMaterial else None,
                'DescripcionMaterial': material.DescripcionMaterial or "Sin descripción",
                'ColorMaterial': material.ColorMaterial or "No especificado",
                'PesoMaterial': material.PesoMaterial or "No especificado",
                'DimensionesMaterial': material.DimensionesMaterial or "No especificado",
                'DetalleMaterial': material.DetalleMaterial or "Sin detalles",
                'EstadoMaterial': material.EstadoMaterial or "No especificado",
                'UbicacionMaterial': material.UbicacionMaterial or "No especificado",
                'FotoMaterial': material.FotoMaterial.url if material.FotoMaterial else None,
                'RegistroFacturaMaterial': material.RegistroFacturaMaterial or "No",
                'Envio': {
                    'id': material.Envio.id if material.Envio else None,
                    'NombreEnvio': material.Envio.NombreEnvio if material.Envio else None,  # Añadido
                    'FechaCompraEnvio': material.Envio.FechaCompraEnvio.isoformat() if material.Envio else None  # Añadido
                } if material.Envio else None,
                'Proveedor': {
                    'id': material.Proveedor.id,
                    'NombreProveedor': material.Proveedor.NombreProveedor,
                    'RutProveedor': material.Proveedor.RutProveedor  # Añadido
                } if material.Proveedor else None,
                # Información de uso en productos
                'productos_asociados': [
                    {
                        'id': pm.Producto.id,
                        'NombreProducto': pm.Producto.NombreProducto,
                        'CantidadUsada': pm.CantidadUsada,
                        'DescripcionUso': pm.DescripcionUso or "Sin descripción"
                    } for pm in material.productos_asociados.select_related('Producto').all()
                ]  # Añadido
            }

            return JsonResponse({
                'success': True,
                'material': data
            })
            
        except Material.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Material no encontrado'
            }, status=404)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)
            
    return JsonResponse({
        'success': False, 
        'message': 'Método no permitido'
    }, status=405)
    
    
#---------LOGICA PARA HERRAMIENTA
@login_required(login_url='login')
def mod_herramienta(request):
    return render(request, 'material/herramienta.html')
@login_required(login_url='login')
@ensure_csrf_cookie 
def crear_herramienta(request):
    if request.method == 'POST':
        try:
            data = request.POST
            
            # Validaciones de campos requeridos según el modelo
            campos_requeridos = ['NombreHerramienta', 'StockHerramienta', 'PrecioHerramienta']
            errores = {}
            
            for campo in campos_requeridos:
                if not data.get(campo):
                    errores[campo] = f'El campo {campo} es requerido'
            
            if errores:
                return JsonResponse({
                    'success': False,
                    'errors': errores
                }, status=400)
            
            # Validación y conversión de campos numéricos
            try:
                stock_herramienta = int(data.get('StockHerramienta'))
                if stock_herramienta < 0:  # PositiveIntegerField validation
                    raise ValueError('El stock no puede ser negativo')
            except ValueError:
                return JsonResponse({
                    'success': False,
                    'errors': {
                        'StockHerramienta': 'El stock debe ser un número entero no negativo'
                    }
                }, status=400)

            try:
                precio_herramienta = Decimal(data.get('PrecioHerramienta'))
                if precio_herramienta <= 0:
                    raise ValueError('El precio debe ser mayor a 0')
            except (ValueError, DecimalException):
                return JsonResponse({
                    'success': False,
                    'errors': {
                        'PrecioHerramienta': 'El precio debe ser un número positivo'
                    }
                }, status=400)

            # Validación de Proveedor opcional
            proveedor = None
            if data.get('Proveedor'):
                try:
                    proveedor = Proveedor.objects.get(id=data.get('Proveedor'))
                except (Proveedor.DoesNotExist, ValueError):
                    return JsonResponse({
                        'success': False,
                        'errors': {
                            'Proveedor': 'Proveedor no válido'
                        }
                    }, status=400)

            # Validación de Envío opcional
            envio = None
            if data.get('Envio'):
                try:
                    envio = Envio.objects.get(id=data.get('Envio'))
                except (Envio.DoesNotExist, ValueError):
                    return JsonResponse({
                        'success': False,
                        'errors': {
                            'Envio': 'Envío no válido'
                        }
                    }, status=400)
            
            nueva_herramienta = Herramienta(
                NombreHerramienta=data.get('NombreHerramienta'),
                StockHerramienta=stock_herramienta,
                PrecioHerramienta=precio_herramienta,
                TotalHerramienta=stock_herramienta * precio_herramienta,
                DescripcionHerramienta=data.get('DescripcionHerramienta'),
                MarcaHerramienta=data.get('MarcaHerramienta', ''),
                ModeloHerramienta=data.get('ModeloHerramienta', ''),
                UbicacionHerramienta=data.get('UbicacionHerramienta', ''),
                Proveedor=proveedor,
                Envio=envio
            )
            
            # Manejar la foto opcional
            if 'FotoHerramienta' in request.FILES:
                foto = request.FILES['FotoHerramienta']
                if foto.content_type not in ALLOWED_FILE_TYPES:
                    return JsonResponse({
                        'success': False,
                        'errors': {
                            'FotoHerramienta': 'Formato no válido. Formatos permitidos: JPG, PNG, GIF, BMP, WEBP, TIFF, SVG, PDF'
                        }
                    }, status=400)

                if foto.size > 10 * 1024 * 1024:
                    return JsonResponse({
                        'success': False,
                        'errors': {
                            'FotoHerramienta': 'El archivo es demasiado grande. El tamaño máximo permitido es 10MB'
                        }
                    }, status=400)

                nueva_herramienta.FotoHerramienta = foto

            try:
                nueva_herramienta.full_clean()
            except ValidationError as e:
                errores_formateados = {campo: errores[0] if errores else str(errores) 
                                     for campo, errores in e.message_dict.items()}
                return JsonResponse({
                    'success': False,
                    'errors': errores_formateados
                }, status=400)
            
            nueva_herramienta.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Herramienta creada exitosamente',
                'herramienta': {
                    'id': nueva_herramienta.id,
                    'NombreHerramienta': nueva_herramienta.NombreHerramienta,
                    'StockHerramienta': nueva_herramienta.StockHerramienta,
                    'PrecioHerramienta': str(nueva_herramienta.PrecioHerramienta),
                    'TotalHerramienta': str(nueva_herramienta.TotalHerramienta),
                    'DescripcionHerramienta': nueva_herramienta.DescripcionHerramienta,
                    'MarcaHerramienta': nueva_herramienta.MarcaHerramienta,
                    'ModeloHerramienta': nueva_herramienta.ModeloHerramienta,
                    'UbicacionHerramienta': nueva_herramienta.UbicacionHerramienta,
                    'FotoHerramienta': nueva_herramienta.FotoHerramienta.url if nueva_herramienta.FotoHerramienta else None,
                    'RegistroFacturaHerramienta': nueva_herramienta.RegistroFacturaHerramienta,
                    'Proveedor': {
                        'id': nueva_herramienta.Proveedor.id,
                        'NombreProveedor': nueva_herramienta.Proveedor.NombreProveedor,
                        'RutProveedor': nueva_herramienta.Proveedor.RutProveedor
                    } if nueva_herramienta.Proveedor else None,
                    'Envio': {
                        'id': nueva_herramienta.Envio.id,
                        'NombreEnvio': nueva_herramienta.Envio.NombreEnvio
                    } if nueva_herramienta.Envio else None
                }
            })
            
        except Exception as e:
            logger.error(f"Error al crear herramienta: {str(e)}")
            return JsonResponse({
                'success': False,
                'errors': {
                    'general': f'Error al crear la herramienta: {str(e)}'
                }
            }, status=400)
    
    return JsonResponse({
        'success': False,
        'errors': {
            'general': 'Método no permitido'
        }
    }, status=405)
    
@login_required(login_url='login')
@ensure_csrf_cookie
def actualizar_herramienta(request, herramienta_id):
    if request.method in ['PUT', 'POST']:
        try:
            herramienta = get_object_or_404(Herramienta, id=herramienta_id)
            data = request.POST
            
            # Debug: Imprimir todos los datos recibidos
            print("Datos recibidos:", dict(data))
            
            # Solo validamos los campos requeridos según el modelo
            campos_requeridos = ['NombreHerramienta', 'StockHerramienta', 'PrecioHerramienta']
            errores = {}
            
            for campo in campos_requeridos:
                if not data.get(campo):
                    errores[campo] = f'El campo {campo} es requerido'
            
            if errores:
                return JsonResponse({'success': False, 'errors': errores}, status=400)

            # Validación y conversión de campos numéricos
            try:
                stock_herramienta = int(data.get('StockHerramienta'))
                if stock_herramienta < 0:
                    raise ValueError('El stock no puede ser negativo')
            except ValueError:
                return JsonResponse({
                    'success': False,
                    'errors': {'StockHerramienta': 'El stock debe ser un número entero no negativo'}
                }, status=400)

            try:
                precio_herramienta = Decimal(data.get('PrecioHerramienta'))
                if precio_herramienta <= 0:
                    raise ValueError('El precio debe ser mayor a 0')
            except (ValueError, DecimalException):
                return JsonResponse({
                    'success': False,
                    'errors': {'PrecioHerramienta': 'El precio debe ser un número positivo'}
                }, status=400)

            # Validación del proveedor (opcional)
            proveedor = None
            if data.get('Proveedor'):
                try:
                    proveedor = Proveedor.objects.get(id=data.get('Proveedor'))
                except (Proveedor.DoesNotExist, ValueError):
                    return JsonResponse({
                        'success': False,
                        'errors': {'Proveedor': 'Proveedor no válido'}
                    }, status=400)

            # Validación del envío (opcional)
            envio = None
            if data.get('Envio'):
                try:
                    envio = Envio.objects.get(id=data.get('Envio'))
                except (Envio.DoesNotExist, ValueError):
                    return JsonResponse({
                        'success': False,
                        'errors': {'Envio': 'Envío no válido'}
                    }, status=400)

            # Manejar la foto
            if data.get('eliminar_FotoHerramienta', '').lower() == 'true' and herramienta.FotoHerramienta:
                try:
                    url = herramienta.FotoHerramienta.url
                    parts = url.split('/')
                    public_id = f"{parts[-2]}/{parts[-1].split('.')[0]}"
                    
                    cloudinary.config(
                        cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
                        api_key=os.getenv('CLOUDINARY_API_KEY'),
                        api_secret=os.getenv('CLOUDINARY_API_SECRET')
                    )
                    
                    result = cloudinary.uploader.destroy(
                        public_id,
                        resource_type="image",
                        type="upload",
                        invalidate=True
                    )
                    print(f"Resultado de eliminación foto: {result}")
                    
                    herramienta.FotoHerramienta = None
                    
                except Exception as e:
                    print(f"Error al eliminar foto: {str(e)}")
                    return JsonResponse({
                        'success': False,
                        'errors': {'FotoHerramienta': f'Error al eliminar la foto: {str(e)}'}
                    }, status=400)
            
            elif 'FotoHerramienta' in request.FILES:
                foto = request.FILES['FotoHerramienta']
                
                if foto.size > 10 * 1024 * 1024:
                    return JsonResponse({
                        'success': False,
                        'errors': {'FotoHerramienta': 'El archivo es demasiado grande. El tamaño máximo permitido es 10MB'}
                    }, status=400)
                
                if foto.content_type not in ALLOWED_FILE_TYPES:
                    return JsonResponse({
                        'success': False,
                        'errors': {'FotoHerramienta': 'Formato no válido. Formatos permitidos: JPG, PNG, GIF, BMP, WEBP, TIFF, SVG'}
                    }, status=400)
                
                if herramienta.FotoHerramienta:
                    try:
                        url = herramienta.FotoHerramienta.url
                        parts = url.split('/')
                        public_id = f"{parts[-2]}/{parts[-1].split('.')[0]}"
                        
                        cloudinary.config(
                            cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
                            api_key=os.getenv('CLOUDINARY_API_KEY'),
                            api_secret=os.getenv('CLOUDINARY_API_SECRET')
                        )
                        
                        cloudinary.uploader.destroy(
                            public_id,
                            resource_type="image",
                            type="upload",
                            invalidate=True
                        )
                    except Exception as e:
                        print(f"Error al eliminar foto anterior: {str(e)}")
                
                herramienta.FotoHerramienta = foto

            # Actualizar campos de la herramienta
            herramienta.NombreHerramienta = data.get('NombreHerramienta')
            herramienta.StockHerramienta = stock_herramienta
            herramienta.PrecioHerramienta = precio_herramienta
            herramienta.TotalHerramienta = stock_herramienta * precio_herramienta
            herramienta.MarcaHerramienta = data.get('MarcaHerramienta', herramienta.MarcaHerramienta)
            herramienta.ModeloHerramienta = data.get('ModeloHerramienta', herramienta.ModeloHerramienta)
            herramienta.UbicacionHerramienta = data.get('UbicacionHerramienta', herramienta.UbicacionHerramienta)
            herramienta.DescripcionHerramienta = data.get('DescripcionHerramienta', '')
            herramienta.Proveedor = proveedor
            herramienta.Envio = envio
            
            try:
                herramienta.full_clean()
                herramienta.save()
            except ValidationError as e:
                errores_formateados = {campo: errores[0] if errores else str(errores) 
                                     for campo, errores in e.message_dict.items()}
                return JsonResponse({'success': False, 'errors': errores_formateados}, status=400)

            return JsonResponse({
                'success': True,
                'message': 'Herramienta actualizada exitosamente',
                'herramienta': {
                    'id': herramienta.id,
                    'NombreHerramienta': herramienta.NombreHerramienta,
                    'StockHerramienta': herramienta.StockHerramienta,
                    'PrecioHerramienta': str(herramienta.PrecioHerramienta),
                    'TotalHerramienta': str(herramienta.TotalHerramienta),
                    'MarcaHerramienta': herramienta.MarcaHerramienta,
                    'ModeloHerramienta': herramienta.ModeloHerramienta,
                    'UbicacionHerramienta': herramienta.UbicacionHerramienta,
                    'DescripcionHerramienta': herramienta.DescripcionHerramienta,
                    'Proveedor': {
                        'id': herramienta.Proveedor.id,
                        'NombreProveedor': herramienta.Proveedor.NombreProveedor,
                        'RutProveedor': herramienta.Proveedor.RutProveedor
                    } if herramienta.Proveedor else None,
                    'Envio': {
                        'id': herramienta.Envio.id,
                        'NombreEnvio': herramienta.Envio.NombreEnvio,
                    } if herramienta.Envio else None,
                    'FotoHerramienta': herramienta.FotoHerramienta.url if herramienta.FotoHerramienta else None
                }
            })
            
        except Exception as e:
            print(f"Error general: {str(e)}")
            return JsonResponse({
                'success': False,
                'errors': {'general': f'Error al actualizar la herramienta: {str(e)}'}
            }, status=400)

    return JsonResponse({
        'success': False,
        'errors': {'general': 'Método no permitido'}
    }, status=405)

@login_required(login_url='login')
@ensure_csrf_cookie
def eliminar_herramienta(request, herramienta_id):
    if request.method == 'DELETE':
        try:
            # Obtener la herramienta
            herramienta = get_object_or_404(Herramienta, id=herramienta_id)
            
            # Guardar información para la respuesta
            nombre_herramienta = herramienta.NombreHerramienta
            marca_herramienta = herramienta.MarcaHerramienta
            nombre_proveedor = herramienta.Proveedor.NombreProveedor if herramienta.Proveedor else "Sin proveedor"
            
            # Si existe una foto, eliminarla de Cloudinary
            if herramienta.FotoHerramienta:
                try:
                    # Obtener la URL de la imagen
                    url = herramienta.FotoHerramienta.url
                    
                    # Extraer el public_id
                    parts = url.split('/')
                    public_id = f"{parts[-2]}/{parts[-1].split('.')[0]}"
                    
                    print(f"Intentando eliminar foto con public_id: {public_id}")
                    
                    # Configurar Cloudinary
                    cloudinary.config(
                        cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
                        api_key=os.getenv('CLOUDINARY_API_KEY'),
                        api_secret=os.getenv('CLOUDINARY_API_SECRET')
                    )
                    
                    # Eliminar la foto
                    result = cloudinary.uploader.destroy(
                        public_id,
                        resource_type="image",
                        type="upload"
                    )
                    print(f"Resultado de eliminación foto Cloudinary: {result}")
                    
                except Exception as cloud_error:
                    print(f"Error al eliminar foto de Cloudinary: {str(cloud_error)}")
                    print(f"URL de la foto: {herramienta.FotoHerramienta.url}")
            
            # Eliminar la herramienta
            herramienta.delete()
            
            return JsonResponse({
                'success': True,
                'message': f'La herramienta "{nombre_herramienta}" ({marca_herramienta}) del proveedor {nombre_proveedor} y sus archivos asociados fueron eliminados exitosamente'
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Error al eliminar la herramienta: {str(e)}'
            }, status=500)
            
    return JsonResponse({
        'success': False,
        'message': 'Método no permitido'
    }, status=405)

@login_required(login_url='login')
def listar_herramientas(request):
    if request.method == 'GET':
        try:
            # Optimizamos la consulta para traer solo los campos necesarios
            herramientas = Herramienta.objects.all().select_related('Proveedor').only(
                'id',
                'NombreHerramienta',
                'StockHerramienta',
                'PrecioHerramienta',
                'TotalHerramienta',
                'FechaCompraHerramienta',
                'DescripcionHerramienta',
                'MarcaHerramienta',
                'ModeloHerramienta',
                'FotoHerramienta',
                'Proveedor__id',
                'Proveedor__NombreProveedor'
            )

            data = []
            for herramienta in herramientas:
                # Preparar datos del proveedor de forma simplificada
                proveedor_data = None
                if herramienta.Proveedor:
                    proveedor_data = {
                        'id': herramienta.Proveedor.id,
                        'NombreProveedor': herramienta.Proveedor.NombreProveedor
                    }

                # Solo incluimos los campos solicitados
                data.append({
                    'id': herramienta.id,
                    'NombreHerramienta': herramienta.NombreHerramienta,
                    'StockHerramienta': herramienta.StockHerramienta,
                    'PrecioHerramienta': str(herramienta.PrecioHerramienta),
                    'TotalHerramienta': str(herramienta.TotalHerramienta),
                    'DescripcionHerramienta': herramienta.DescripcionHerramienta,
                    'MarcaHerramienta': herramienta.MarcaHerramienta,
                    'ModeloHerramienta': herramienta.ModeloHerramienta,
                    'FechaCompraHerramienta': herramienta.FechaCompraHerramienta.isoformat() if herramienta.FechaCompraHerramienta else None,
                    'FotoHerramienta': herramienta.FotoHerramienta.url if herramienta.FotoHerramienta else None,
                    'Proveedor': proveedor_data
                })

            return JsonResponse({
                'success': True,
                'herramientas': data
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)
            
    return JsonResponse({
        'success': False, 
        'message': 'Método no permitido'
    }, status=405)
@login_required(login_url='login')
def obtener_detalles_herramienta(request, herramienta_id):
    if request.method == 'GET':
        try:
            herramienta = Herramienta.objects.select_related('Proveedor', 'Envio').get(id=herramienta_id)
            
            data = {
                'id': herramienta.id,
                'NombreHerramienta': herramienta.NombreHerramienta,
                'StockHerramienta': herramienta.StockHerramienta,
                'PrecioHerramienta': str(herramienta.PrecioHerramienta),
                'TotalHerramienta': str(herramienta.TotalHerramienta),
                'FechaCompraHerramienta': herramienta.FechaCompraHerramienta.isoformat() if herramienta.FechaCompraHerramienta else None,
                'DescripcionHerramienta': herramienta.DescripcionHerramienta or "Sin descripción",
                'MarcaHerramienta': herramienta.MarcaHerramienta or "No especificada",
                'ModeloHerramienta': herramienta.ModeloHerramienta or "No especificado",
                'UbicacionHerramienta': herramienta.UbicacionHerramienta or "No especificada",
                'FotoHerramienta': herramienta.FotoHerramienta.url if herramienta.FotoHerramienta else None,
                'RegistroFacturaHerramienta': herramienta.RegistroFacturaHerramienta or "No",
                'Envio': {
                    'id': herramienta.Envio.id if herramienta.Envio else None
                } if herramienta.Envio else None,
                'Proveedor': {
                    'id': herramienta.Proveedor.id,
                    'NombreProveedor': herramienta.Proveedor.NombreProveedor
                } if herramienta.Proveedor else None
            }

            return JsonResponse({
                'success': True,
                'herramienta': data
            })
            
        except Herramienta.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Herramienta no encontrada'
            }, status=404)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)
            
    return JsonResponse({
        'success': False, 
        'message': 'Método no permitido'
    }, status=405)
@login_required(login_url='login')
@ensure_csrf_cookie
def exportar_herramientas_excel(request):
    # Crear un buffer en memoria
    output = BytesIO()
    
    # Crear un nuevo archivo Excel con la opción remove_timezone
    workbook = xlsxwriter.Workbook(output, {'remove_timezone': True})
    # Hoja para los datos
    worksheet_data = workbook.add_worksheet('Herramientas')
    # Hojas para los gráficos
    worksheet_charts = workbook.add_worksheet('Gráficos')
    # Agregar formatos
    header_format = workbook.add_format({
        'bold': True,
        'bg_color': '#000000',
        'font_color': 'white',
        'border': 1
    })
    date_format = workbook.add_format({
        'num_format': 'dd/mm/yyyy',
    })

    # Definir encabezados
    headers = [
        'ID',
        'Nombre Herramienta',
        'Stock',
        'Precio',
        'Total',
        'Marca',
        'Modelo',
        'Ubicación',
        'Fecha Compra',
        'Proveedor',
        'Registro Factura'
    ]
    
    # Escribir encabezados en hoja de datos
    for col, header in enumerate(headers):
        worksheet_data.write(0, col, header, header_format)
        worksheet_data.set_column(col, col, 15)

    # Obtener datos de herramientas
    herramientas = Herramienta.objects.all().select_related('Proveedor').order_by('-FechaCompraHerramienta')

    # Escribir datos
    for row, herramienta in enumerate(herramientas, start=1):
        worksheet_data.write(row, 0, herramienta.id)
        worksheet_data.write(row, 1, herramienta.NombreHerramienta)
        worksheet_data.write(row, 2, herramienta.StockHerramienta)
        worksheet_data.write(row, 3, float(herramienta.PrecioHerramienta))
        worksheet_data.write(row, 4, float(herramienta.TotalHerramienta))
        worksheet_data.write(row, 5, herramienta.MarcaHerramienta or 'No especificada')
        worksheet_data.write(row, 6, herramienta.ModeloHerramienta or 'No especificado')
        worksheet_data.write(row, 7, herramienta.UbicacionHerramienta)
        worksheet_data.write_datetime(row, 8, herramienta.FechaCompraHerramienta, date_format)
        worksheet_data.write(row, 9, herramienta.Proveedor.NombreProveedor if herramienta.Proveedor else 'Sin proveedor')
        worksheet_data.write(row, 10, herramienta.RegistroFacturaHerramienta)

    # Ajustar anchos de columna
    worksheet_data.set_column('A:A', 8)   # ID
    worksheet_data.set_column('B:B', 30)  # Nombre Herramienta
    worksheet_data.set_column('C:D', 15)  # Stock y Precio
    worksheet_data.set_column('E:E', 20)  # Total
    worksheet_data.set_column('F:K', 18)  # Resto de columnas

    # Preparar datos para los gráficos
    proveedores_dict = {}
    marcas_dict = {}
    for herramienta in herramientas:
        # Conteo por proveedor
        proveedor = herramienta.Proveedor.NombreProveedor if herramienta.Proveedor else 'Sin proveedor'
        proveedores_dict[proveedor] = proveedores_dict.get(proveedor, 0) + 1
        
        # Conteo por marca
        marca = herramienta.MarcaHerramienta or 'Sin marca'
        marcas_dict[marca] = marcas_dict.get(marca, 0) + 1

    # Escribir datos para gráficos
    # Datos de proveedores
    worksheet_charts.write_row('A1', ['Proveedor', 'Cantidad'], header_format)
    for i, (proveedor, cantidad) in enumerate(proveedores_dict.items(), start=2):
        worksheet_charts.write(f'A{i}', proveedor)
        worksheet_charts.write(f'B{i}', cantidad)

    # Datos de marcas
    worksheet_charts.write_row('D1', ['Marca', 'Cantidad'], header_format)
    for i, (marca, cantidad) in enumerate(marcas_dict.items(), start=2):
        worksheet_charts.write(f'D{i}', marca)
        worksheet_charts.write(f'E{i}', cantidad)

    # Crear gráficos
    # 1. Gráfico de columnas (Herramientas por Proveedor)
    column_chart = workbook.add_chart({'type': 'column'})
    column_chart.add_series({
        'name': 'Herramientas por Proveedor',
        'categories': f'=Gráficos!$A$2:$A${len(proveedores_dict)+1}',
        'values': f'=Gráficos!$B$2:$B${len(proveedores_dict)+1}',
        'data_labels': {'value': True},
    })
    column_chart.set_title({'name': 'Distribución de Herramientas por Proveedor'})
    column_chart.set_size({'width': 500, 'height': 300})
    worksheet_charts.insert_chart('G2', column_chart)

    # 2. Gráfico de pie (Marcas de Herramientas)
    pie_chart = workbook.add_chart({'type': 'pie'})
    pie_chart.add_series({
        'name': 'Marcas de Herramientas',
        'categories': f'=Gráficos!$D$2:$D${len(marcas_dict)+1}',
        'values': f'=Gráficos!$E$2:$E${len(marcas_dict)+1}',
        'data_labels': {'percentage': True},
    })
    pie_chart.set_title({'name': 'Distribución por Marca (%)'})
    pie_chart.set_size({'width': 500, 'height': 300})
    worksheet_charts.insert_chart('G18', pie_chart)

    workbook.close()

    # Preparar la respuesta
    output.seek(0)
    filename = f'Herramientas_{timezone.localtime().strftime("%Y%m%d_%H%M%S")}.xlsx'
    
    response = HttpResponse(
        output.read(),
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    
    return response

#-------------MODULO PARA PRODUCTO----------------------

@login_required(login_url='login')
def mod_producto(request):
    return render(request, 'material/producto.html')

@login_required(login_url='login')
@ensure_csrf_cookie 
def crear_producto(request):
    if request.method == 'POST':
        try:
            data = request.POST
            
            # Validaciones de campos requeridos según el modelo
            campos_requeridos = ['NombreProducto', 'StockProductoInicial', 'PrecioUnitarioProducto', 'Categoria']
            errores = {}
            
            for campo in campos_requeridos:
                if not data.get(campo):
                    errores[campo] = f'El campo {campo} es requerido'
            
            if errores:
                return JsonResponse({'success': False, 'errors': errores}, status=400)
            
            # Validaciones numéricas y de otros campos
            try:
                stock_inicial = int(data.get('StockProductoInicial'))
                if stock_inicial < 0:
                    raise ValueError('El stock inicial no puede ser negativo')
            except ValueError:
                return JsonResponse({
                    'success': False,
                    'errors': {'StockProductoInicial': 'El stock inicial debe ser un número entero no negativo'}
                }, status=400)

            try:
                precio_unitario = Decimal(data.get('PrecioUnitarioProducto'))
                if precio_unitario <= 0:
                    raise ValueError('El precio unitario debe ser mayor a 0')
            except (ValueError, DecimalException):
                return JsonResponse({
                    'success': False,
                    'errors': {'PrecioUnitarioProducto': 'El precio unitario debe ser un número positivo'}
                }, status=400)

            # Validación de categoría
            try:
                categoria = Categoria.objects.get(id=data.get('Categoria'))
            except (Categoria.DoesNotExist, ValueError):
                return JsonResponse({
                    'success': False,
                    'errors': {'Categoria': 'Categoría no válida'}
                }, status=400)
            
            nuevo_producto = Producto(
                NombreProducto=data.get('NombreProducto'),
                StockProductoInicial=stock_inicial,
                PrecioUnitarioProducto=precio_unitario,
                Categoria=categoria,
                DescripcionProducto=data.get('DescripcionProducto'),
                UbicacionProducto=data.get('UbicacionProducto', ''),
                EstadoProducto=data.get('EstadoProducto', ''),
                FechaProducto=timezone.now().date()
            )
            
            # Manejo de la foto
            if 'FotoProducto' in request.FILES:
                foto = request.FILES['FotoProducto']
                if foto.content_type not in ALLOWED_FILE_TYPES:
                    return JsonResponse({
                        'success': False,
                        'errors': {'FotoProducto': 'Formato no válido. Formatos permitidos: JPG, PNG, GIF, BMP, WEBP, TIFF, SVG'}
                    }, status=400)

                if foto.size > 10 * 1024 * 1024:
                    return JsonResponse({
                        'success': False,
                        'errors': {'FotoProducto': 'El archivo es demasiado grande. El tamaño máximo permitido es 10MB'}
                    }, status=400)

                nuevo_producto.FotoProducto = foto

            try:
                nuevo_producto.full_clean()
            except ValidationError as e:
                errores_formateados = {campo: errores[0] if errores else str(errores) 
                                     for campo, errores in e.message_dict.items()}
                return JsonResponse({'success': False, 'errors': errores_formateados}, status=400)
            
            nuevo_producto.save()
            
            # Procesar materiales
            materiales_data = json.loads(data.get('materiales', '[]'))
            materiales_creados = []
            
            for material_data in materiales_data:
                try:
                    material = Material.objects.get(id=material_data['material_id'])
                    producto_material = ProductoMaterial(
                        Producto=nuevo_producto,
                        Material=material,
                        CantidadUsada=material_data['cantidad'],
                        DescripcionUso=material_data.get('descripcion', '')
                    )
                    producto_material.full_clean()
                    producto_material.save()
                    materiales_creados.append({
                        'id': producto_material.id,
                        'material': {
                            'id': material.id,
                            'nombre': material.NombreMaterial,
                            'stock_original': material.StockOriginal,
                            'stock_actual': material.StockMaterial
                        },
                        'cantidad_usada': producto_material.CantidadUsada,
                        'detalle_uso': producto_material.detalle_uso,
                        'detalle_completo': {
                            'cantidad_usada': producto_material.CantidadUsada,
                            'stock_original': material.StockOriginal,
                            'stock_actual': material.StockMaterial,
                            'nombre_material': material.NombreMaterial
                        },
                        'descripcion': producto_material.DescripcionUso or '',
                        'fecha_registro': producto_material.FechaRegistro.isoformat(),
                        'ultima_modificacion': producto_material.UltimaModificacion.isoformat()
                    })
                except Exception as e:
                    nuevo_producto.delete()
                    return JsonResponse({
                        'success': False,
                        'errors': {'materiales': f'Error con el material: {str(e)}'}
                    }, status=400)
            
            return JsonResponse({
                'success': True,
                'message': 'Producto creado exitosamente',
                'producto': {
                    'id': nuevo_producto.id,
                    'NombreProducto': nuevo_producto.NombreProducto,
                    'StockProductoInicial': nuevo_producto.StockProductoInicial,
                    'StockProductoActual': nuevo_producto.StockProductoActual,
                    'PrecioUnitarioProducto': str(nuevo_producto.PrecioUnitarioProducto),
                    'PrecioTotalProducto': str(nuevo_producto.PrecioTotalProducto),
                    'DescripcionProducto': nuevo_producto.DescripcionProducto,
                    'UbicacionProducto': nuevo_producto.UbicacionProducto,
                    'EstadoProducto': nuevo_producto.EstadoProducto,
                    'FechaProducto': nuevo_producto.FechaProducto.isoformat(),
                    'DiasProducto': nuevo_producto.DiasProducto,
                    'ProductoVendido': nuevo_producto.ProductoVendido,
                    'CantidadProductoVendido': nuevo_producto.CantidadProductoVendido,
                    'CantidadProductoDesechado': nuevo_producto.CantidadProductoDesechado,
                    'porcentaje_stock_disponible': nuevo_producto.porcentaje_stock_disponible,
                    'FotoProducto': nuevo_producto.FotoProducto.url if nuevo_producto.FotoProducto else None,
                    'Categoria': {
                        'id': categoria.id,
                        'NombreCategoria': categoria.NombreCategoria
                    },
                    'materiales': materiales_creados,
                    'HoraCreacion': nuevo_producto.HoraCreacion.isoformat()
                }
            })
            
        except Exception as e:
            logger.error(f"Error al crear producto: {str(e)}")
            return JsonResponse({
                'success': False,
                'errors': {
                    'general': f'Error al crear el producto: {str(e)}'
                }
            }, status=400)
    
    return JsonResponse({
        'success': False,
        'errors': {
            'general': 'Método no permitido'
        }
    }, status=405)
    
@login_required(login_url='login')
def listar_productos(request):
    try:
        productos = Producto.objects.select_related('Categoria').prefetch_related(
            'materiales_usados__Material'
        ).annotate(
            tiene_stock=models.Case(
                models.When(StockProductoActual__gt=0, then=1),
                default=0,
                output_field=models.IntegerField(),
            )
        ).order_by(
            '-tiene_stock',      # Primero los que tienen stock
            '-FechaProducto',    # Luego por fecha más reciente
            '-HoraCreacion',     # Después por hora de creación
            '-id'                # Finalmente por ID
        )
        
        productos_data = []
        
        for producto in productos:
            dias_transcurridos = (timezone.now().date() - producto.FechaProducto).days
            
            # Obtener los materiales del producto
            materiales = [{
                'id': pm.id,
                'material': {
                    'id': pm.Material.id,
                    'nombre': pm.Material.NombreMaterial
                },
                'cantidad': pm.CantidadUsada,
                'descripcion': pm.DescripcionUso
            } for pm in producto.materiales_usados.all()]
            
            producto_data = {
                'id': producto.id,
                'NombreProducto': producto.NombreProducto,
                'StockProductoInicial': producto.StockProductoInicial,
                'StockProductoActual': producto.StockProductoActual,
                'PrecioUnitarioProducto': str(producto.PrecioUnitarioProducto),
                'PrecioTotalProducto': str(producto.PrecioTotalProducto),
                'Categoria': {
                    'id': producto.Categoria.id if producto.Categoria else None,
                    'NombreCategoria': producto.Categoria.NombreCategoria if producto.Categoria else "Sin categoría"
                },
                'CantidadProductoVendido': producto.CantidadProductoVendido,
                'CantidadProductoDesechado': producto.CantidadProductoDesechado,
                'DiasProducto': dias_transcurridos,
                'FechaProducto': producto.FechaProducto.isoformat(),
                'FotoProducto': producto.FotoProducto.url if producto.FotoProducto else None,
                'materiales': materiales,
                'DescripcionProducto': producto.DescripcionProducto,
                'UbicacionProducto': producto.UbicacionProducto,
                'EstadoProducto': producto.EstadoProducto,
                'ProductoAgotado': producto.ProductoAgotado,
                'porcentaje_stock_disponible': producto.porcentaje_stock_disponible,
                'HoraCreacion': producto.HoraCreacion.isoformat()
            }
            productos_data.append(producto_data)

        return JsonResponse({
            'success': True,
            'productos': productos_data
        })

    except Exception as e:
        logger.error(f"Error al listar productos: {str(e)}")  # Agregado logging
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
@login_required(login_url='login')
@ensure_csrf_cookie
def actualizar_producto(request, producto_id):
    if request.method not in ['PUT', 'POST']:
        return JsonResponse({
            'success': False,
            'errors': {'general': 'Método no permitido'}
        }, status=405)

    try:
        producto = get_object_or_404(Producto, id=producto_id)
        data = request.POST
        print("Datos recibidos:", dict(data))

        # Validación de campos requeridos
        campos_requeridos = {
            'NombreProducto': 'Nombre del producto',
            'StockProductoInicial': 'Stock inicial',
            'PrecioUnitarioProducto': 'Precio unitario'
        }
        
        errores = {campo: f'El campo {nombre} es requerido' 
                  for campo, nombre in campos_requeridos.items() 
                  if not data.get(campo)}
        
        if errores:
            return JsonResponse({'success': False, 'errors': errores}, status=400)

        # Validación y conversión de campos numéricos
        try:
            nuevo_stock_inicial = int(data.get('StockProductoInicial'))
            if nuevo_stock_inicial < 0:
                raise ValueError('El stock inicial no puede ser negativo')
            
            # Calcular la proporción del stock actual respecto al inicial
            if producto.StockProductoInicial > 0:
                proporcion = producto.StockProductoActual / producto.StockProductoInicial
                nuevo_stock_actual = int(round(nuevo_stock_inicial * proporcion))
            else:
                nuevo_stock_actual = nuevo_stock_inicial

        except ValueError:
            return JsonResponse({
                'success': False,
                'errors': {'StockProductoInicial': 'El stock inicial debe ser un número entero no negativo'}
            }, status=400)

        try:
            precio_unitario = Decimal(data.get('PrecioUnitarioProducto'))
            if precio_unitario <= 0:
                raise ValueError('El precio debe ser mayor a 0')
        except (ValueError, DecimalException):
            return JsonResponse({
                'success': False,
                'errors': {'PrecioUnitarioProducto': 'El precio unitario debe ser un número positivo'}
            }, status=400)

        # Manejar producto agotado y distribución de stock
        producto_agotado = data.get('ProductoAgotado', '').lower() == 'true'
        if producto_agotado and nuevo_stock_actual > 0:
            try:
                # Mantener el historial de ventas previas
                ventas_previas = producto.CantidadProductoVendido
                perdidas_previas = producto.CantidadProductoDesechado

                # Obtener y validar las nuevas cantidades
                cantidad_vendida = int(data.get('CantidadProductoVendido', 0))
                cantidad_desechada = int(data.get('CantidadProductoDesechado', 0))
                
                print(f"Ventas previas: {ventas_previas}")  # Debug
                print(f"Nueva cantidad a vender: {cantidad_vendida}")  # Debug
                print(f"Nueva cantidad a desechar: {cantidad_desechada}")  # Debug
                print(f"Stock actual: {nuevo_stock_actual}")  # Debug
                
                # Validar que la suma de cantidades sea igual al stock actual
                if (cantidad_vendida + cantidad_desechada) != nuevo_stock_actual:
                    return JsonResponse({
                        'success': False,
                        'errors': {'stock': 'La suma de cantidades vendidas y desechadas debe ser igual al stock actual'}
                    }, status=400)
                
                # Crear registro de venta si hay cantidad vendida
                if cantidad_vendida > 0:
                    Ventas.objects.create(
                        NombreVenta=f"Venta automática - {producto.NombreProducto}",
                        CantidadVenta=cantidad_vendida,
                        PrecioVenta=producto.PrecioUnitarioProducto,
                        PrecioTotalVenta=producto.PrecioUnitarioProducto * cantidad_vendida,
                        Producto=producto,
                        Usuario=request.user
                    )

                # Crear registro de pérdida si hay cantidad desechada
                if cantidad_desechada > 0:
                    Perdidas.objects.create(
                        NombrePerdida=f"Pérdida automática - {producto.NombreProducto}",
                        CantidadPerdida=cantidad_desechada,
                        ValorUnitarioPerdida=producto.PrecioUnitarioProducto,
                        MotivoPerdida='otros',
                        Producto=producto,
                        Usuario=request.user
                    )
                
                # Actualizar el producto
                producto.CantidadProductoVendido = ventas_previas + cantidad_vendida
                producto.CantidadProductoDesechado = perdidas_previas + cantidad_desechada
                producto.StockProductoActual = 0
                nuevo_stock_actual = 0
                
            except ValueError as e:
                return JsonResponse({
                    'success': False,
                    'errors': {'stock': str(e)}
                }, status=400)

        # Validación de categoría
        if data.get('Categoria'):
            try:
                categoria = Categoria.objects.get(id=data.get('Categoria'))
            except (Categoria.DoesNotExist, ValueError):
                return JsonResponse({
                    'success': False,
                    'errors': {'Categoria': 'Categoría no válida'}
                }, status=400)
        else:
            categoria = None

        # Manejo de la foto del producto
        if data.get('eliminar_FotoProducto', '').lower() == 'true' and producto.FotoProducto:
            try:
                url = producto.FotoProducto.url
                parts = url.split('/')
                public_id = f"{parts[-2]}/{parts[-1].split('.')[0]}"
                
                cloudinary.config(
                    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
                    api_key=os.getenv('CLOUDINARY_API_KEY'),
                    api_secret=os.getenv('CLOUDINARY_API_SECRET')
                )
                
                cloudinary.uploader.destroy(
                    public_id,
                    resource_type="image",
                    type="upload",
                    invalidate=True
                )
                producto.FotoProducto = None
                
            except Exception as e:
                print(f"Error al eliminar foto: {str(e)}")
                return JsonResponse({
                    'success': False,
                    'errors': {'FotoProducto': f'Error al eliminar la foto: {str(e)}'}
                }, status=400)
        
        elif 'FotoProducto' in request.FILES:
            foto = request.FILES['FotoProducto']
            
            if foto.size > 10 * 1024 * 1024:
                return JsonResponse({
                    'success': False,
                    'errors': {'FotoProducto': 'El archivo es demasiado grande. Máximo 10MB'}
                }, status=400)
            
            if foto.content_type not in ALLOWED_FILE_TYPES:
                return JsonResponse({
                    'success': False,
                    'errors': {'FotoProducto': 'Formato no válido. Use: JPG, PNG, GIF, BMP, WEBP, TIFF, SVG'}
                }, status=400)
            
            if producto.FotoProducto:
                try:
                    url = producto.FotoProducto.url
                    parts = url.split('/')
                    public_id = f"{parts[-2]}/{parts[-1].split('.')[0]}"
                    cloudinary.uploader.destroy(public_id)
                except Exception as e:
                    print(f"Error al eliminar foto anterior: {str(e)}")
            
            producto.FotoProducto = foto

        # Actualización de campos del producto
        producto.NombreProducto = data.get('NombreProducto')
        producto.StockProductoInicial = nuevo_stock_inicial
        producto.StockProductoActual = nuevo_stock_actual
        producto.PrecioUnitarioProducto = precio_unitario
        producto.PrecioTotalProducto = nuevo_stock_actual * precio_unitario
        producto.Categoria = categoria
        producto.DescripcionProducto = data.get('DescripcionProducto', '')
        producto.UbicacionProducto = data.get('UbicacionProducto', '')
        producto.EstadoProducto = data.get('EstadoProducto', '')
        
        if data.get('DiasProducto'):
            try:
                dias_producto = int(data.get('DiasProducto'))
                if dias_producto >= 0:
                    producto.DiasProducto = dias_producto
            except ValueError:
                pass
        
        producto.ProductoAgotado = producto_agotado
        
        if data.get('FechaProducto'):
            try:
                producto.FechaProducto = datetime.fromisoformat(data.get('FechaProducto'))
            except ValueError:
                errores['FechaProducto'] = 'Formato de fecha inválido'

        # Actualización de materiales
        if data.get('materiales'):
            try:
                materiales_data = json.loads(data.get('materiales'))
                ProductoMaterial.objects.filter(Producto=producto).delete()
                
                for material_data in materiales_data:
                    material = Material.objects.get(id=material_data['material_id'])
                    producto_material = ProductoMaterial(
                        Producto=producto,
                        Material=material,
                        CantidadUsada=material_data['cantidad'],
                        DescripcionUso=material_data.get('descripcion', '')
                    )
                    producto_material.full_clean()
                    producto_material.save()
            except Exception as e:
                return JsonResponse({
                    'success': False,
                    'errors': {'materiales': f'Error con los materiales: {str(e)}'}
                }, status=400)

        # Validación final y guardado
        try:
            producto.full_clean()
            producto.save()
        except ValidationError as e:
            errores_formateados = {
                campo: errores[0] if isinstance(errores, list) else str(errores)
                for campo, errores in e.message_dict.items()
            }
            return JsonResponse({'success': False, 'errors': errores_formateados}, status=400)

        # Preparar respuesta con datos actualizados
        materiales_actualizados = [{
            'id': pm.id,
            'material': {
                'id': pm.Material.id,
                'nombre': pm.Material.NombreMaterial
            },
            'cantidad': pm.CantidadUsada,
            'descripcion': pm.DescripcionUso
        } for pm in producto.materiales_usados.select_related('Material').all()]

        return JsonResponse({
            'success': True,
            'message': 'Producto actualizado exitosamente',
            'producto': {
                'id': producto.id,
                'NombreProducto': producto.NombreProducto,
                'StockProductoInicial': producto.StockProductoInicial,
                'StockProductoActual': producto.StockProductoActual,
                'PrecioUnitarioProducto': str(producto.PrecioUnitarioProducto),
                'PrecioTotalProducto': str(producto.PrecioTotalProducto),
                'DescripcionProducto': producto.DescripcionProducto,
                'UbicacionProducto': producto.UbicacionProducto,
                'EstadoProducto': producto.EstadoProducto,
                'FechaProducto': producto.FechaProducto.isoformat(),
                'DiasProducto': producto.DiasProducto,
                'ProductoAgotado': producto.ProductoAgotado,
                'CantidadProductoVendido': producto.CantidadProductoVendido,
                'CantidadProductoDesechado': producto.CantidadProductoDesechado,
                'porcentaje_stock_disponible': producto.porcentaje_stock_disponible,
                'FotoProducto': producto.FotoProducto.url if producto.FotoProducto else None,
                'Categoria': {
                    'id': categoria.id,
                    'NombreCategoria': categoria.NombreCategoria
                } if categoria else None,
                'materiales': materiales_actualizados
            }
        })

    except Exception as e:
        print(f"Error general: {str(e)}")
        return JsonResponse({
            'success': False,
            'errors': {'general': f'Error al actualizar el producto: {str(e)}'}
        }, status=400)

@login_required(login_url='login')
@ensure_csrf_cookie 
def crear_producto(request):
    if request.method == 'POST':
        try:
            data = request.POST
            
            # Solo validar campos realmente requeridos
            campos_requeridos = ['NombreProducto', 'StockProductoInicial', 'PrecioUnitarioProducto']
            errores = {}
            
            for campo in campos_requeridos:
                if not data.get(campo):
                    errores[campo] = f'El campo {campo} es requerido'
            
            if errores:
                return JsonResponse({'success': False, 'errors': errores}, status=400)
            
            # Validaciones numéricas
            try:
                stock_inicial = int(data.get('StockProductoInicial'))
                if stock_inicial <= 0:
                    raise ValueError('El stock inicial debe ser mayor a 0')
            except ValueError:
                return JsonResponse({
                    'success': False,
                    'errors': {'StockProductoInicial': 'El stock inicial debe ser un número entero mayor a 0'}
                }, status=400)

            try:
                precio_unitario = Decimal(data.get('PrecioUnitarioProducto'))
                if precio_unitario <= 0:
                    raise ValueError('El precio unitario debe ser mayor a 0')
            except (ValueError, DecimalException):
                return JsonResponse({
                    'success': False,
                    'errors': {'PrecioUnitarioProducto': 'El precio unitario debe ser un número positivo'}
                }, status=400)

            # Manejo de categoría
            categoria = None
            categoria_nombre = "Sin categoría"
            if data.get('Categoria'):
                try:
                    categoria = Categoria.objects.get(id=data.get('Categoria'))
                    categoria_nombre = categoria.NombreCategoria
                except Categoria.DoesNotExist:
                    # Si no existe la categoría, se mantiene como None
                    pass

            nuevo_producto = Producto(
                NombreProducto=data.get('NombreProducto'),
                StockProductoInicial=stock_inicial,
                PrecioUnitarioProducto=precio_unitario,
                Categoria=categoria,
                DescripcionProducto=data.get('DescripcionProducto'),
                UbicacionProducto=data.get('UbicacionProducto', ''),
                EstadoProducto=data.get('EstadoProducto', ''),
                FechaProducto=timezone.now().date()
            )
            
            # Manejo de foto
            if 'FotoProducto' in request.FILES:
                foto = request.FILES['FotoProducto']
                if foto.content_type not in ALLOWED_FILE_TYPES:
                    return JsonResponse({
                        'success': False,
                        'errors': {'FotoProducto': 'Formato no válido. Formatos permitidos: JPG, PNG, GIF, BMP, WEBP, TIFF, SVG'}
                    }, status=400)

                if foto.size > 10 * 1024 * 1024:
                    return JsonResponse({
                        'success': False,
                        'errors': {'FotoProducto': 'El archivo es demasiado grande. Máximo 10MB'}
                    }, status=400)

                nuevo_producto.FotoProducto = foto

            try:
                nuevo_producto.full_clean()
                nuevo_producto.save()
            except ValidationError as e:
                errores_formateados = {campo: errores[0] if errores else str(errores) 
                                     for campo, errores in e.message_dict.items()}
                return JsonResponse({'success': False, 'errors': errores_formateados}, status=400)
            
            # Procesar materiales
            materiales_data = json.loads(data.get('materiales', '[]'))
            materiales_creados = []
            
            for material_data in materiales_data:
                try:
                    material = Material.objects.get(id=material_data['material_id'])
                    producto_material = ProductoMaterial(
                        Producto=nuevo_producto,
                        Material=material,
                        CantidadUsada=material_data['cantidad'],
                        DescripcionUso=material_data.get('descripcion', '')
                    )
                    producto_material.full_clean()
                    producto_material.save()
                    materiales_creados.append({
                        'id': producto_material.id,
                        'material': {
                            'id': material.id,
                            'nombre': material.NombreMaterial
                        },
                        'cantidad': producto_material.CantidadUsada,
                        'descripcion': producto_material.DescripcionUso
                    })
                except Exception as e:
                    nuevo_producto.delete()
                    return JsonResponse({
                        'success': False,
                        'errors': {'materiales': f'Error con el material: {str(e)}'}
                    }, status=400)
            
            return JsonResponse({
                'success': True,
                'message': 'Producto creado exitosamente',
                'producto': {
                    'id': nuevo_producto.id,
                    'NombreProducto': nuevo_producto.NombreProducto,
                    'StockProductoInicial': nuevo_producto.StockProductoInicial,
                    'StockProductoActual': nuevo_producto.StockProductoActual,
                    'PrecioUnitarioProducto': str(nuevo_producto.PrecioUnitarioProducto),
                    'PrecioTotalProducto': str(nuevo_producto.PrecioTotalProducto),
                    'DescripcionProducto': nuevo_producto.DescripcionProducto,
                    'UbicacionProducto': nuevo_producto.UbicacionProducto,
                    'EstadoProducto': nuevo_producto.EstadoProducto,
                    'FechaProducto': nuevo_producto.FechaProducto.isoformat(),
                    'DiasProducto': nuevo_producto.DiasProducto,
                    'ProductoAgotado': nuevo_producto.ProductoAgotado,  # Cambiado aquí
                    'CantidadProductoVendido': nuevo_producto.CantidadProductoVendido,
                    'CantidadProductoDesechado': nuevo_producto.CantidadProductoDesechado,
                    'porcentaje_stock_disponible': nuevo_producto.porcentaje_stock_disponible,
                    'FotoProducto': nuevo_producto.FotoProducto.url if nuevo_producto.FotoProducto else None,
                    'Categoria': {
                        'id': categoria.id if categoria else None,
                        'NombreCategoria': categoria_nombre
                    },
                    'materiales': materiales_creados,
                    'HoraCreacion': nuevo_producto.HoraCreacion.isoformat()
                }
            })
            
        except Exception as e:
            logger.error(f"Error al crear producto: {str(e)}")
            return JsonResponse({
                'success': False,
                'errors': {
                    'general': f'Error al crear el producto: {str(e)}'
                }
            }, status=400)
    
    return JsonResponse({
        'success': False,
        'errors': {
            'general': 'Método no permitido'
        }
    }, status=405)
@login_required(login_url='login')
@ensure_csrf_cookie
def eliminar_producto(request, producto_id):
    if request.method == 'DELETE':
        try:
            # Obtener el producto con sus relaciones
            producto = get_object_or_404(Producto, id=producto_id)
            
            # Guardar información para la respuesta
            nombre_producto = producto.NombreProducto
            categoria = producto.Categoria.NombreCategoria if producto.Categoria else "Sin categoría"
            
            # Obtener información de materiales antes de eliminar
            materiales_info = [
                f"{material.Material.NombreMaterial} ({material.CantidadUsada})"
                for material in producto.materiales_usados.select_related('Material').all()
            ]
            
            # Si existe una foto, eliminarla de Cloudinary
            if producto.FotoProducto:
                try:
                    # Obtener la URL de la imagen
                    url = producto.FotoProducto.url
                    
                    # Extraer el public_id
                    parts = url.split('/')
                    public_id = f"{parts[-2]}/{parts[-1].split('.')[0]}"
                    
                    print(f"Intentando eliminar foto con public_id: {public_id}")
                    
                    # Configurar Cloudinary
                    cloudinary.config(
                        cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
                        api_key=os.getenv('CLOUDINARY_API_KEY'),
                        api_secret=os.getenv('CLOUDINARY_API_SECRET')
                    )
                    
                    # Eliminar la foto
                    result = cloudinary.uploader.destroy(
                        public_id,
                        resource_type="image",
                        type="upload"
                    )
                    print(f"Resultado de eliminación foto Cloudinary: {result}")
                    
                except Exception as cloud_error:
                    print(f"Error al eliminar foto de Cloudinary: {str(cloud_error)}")
                    print(f"URL de la foto: {producto.FotoProducto.url}")
            
            # Eliminar el producto (esto también eliminará los registros de ProductoMaterial por CASCADE)
            producto.delete()
            
            mensaje_base = f'El producto "{nombre_producto}" de la categoría {categoria}'
            mensaje_materiales = ""
            if materiales_info:
                mensaje_materiales = f" (que usaba los materiales: {', '.join(materiales_info)})"
            
            return JsonResponse({
                'success': True,
                'message': f'{mensaje_base}{mensaje_materiales} y sus archivos asociados fueron eliminados exitosamente',
                'deleted': {
                    'id': producto_id,
                    'nombre': nombre_producto,
                    'categoria': categoria,
                    'materiales': materiales_info
                }
            })
            
        except Exception as e:
            logger.error(f"Error al eliminar producto: {str(e)}")
            return JsonResponse({
                'success': False,
                'message': f'Error al eliminar el producto: {str(e)}'
            }, status=500)
            
    return JsonResponse({
        'success': False,
        'message': 'Método no permitido'
    }, status=405)
@login_required(login_url='login')
@ensure_csrf_cookie
def exportar_productos_excel(request):
    output = BytesIO()
    workbook = xlsxwriter.Workbook(output, {'remove_timezone': True})
    
    # Formatos
    header_format = workbook.add_format({
        'bold': True, 'bg_color': '#000000', 'font_color': 'white', 'border': 1
    })
    date_format = workbook.add_format({'num_format': 'dd/mm/yyyy'})
    money_format = workbook.add_format({'num_format': '$#,##0.00'})
    percent_format = workbook.add_format({'num_format': '0.00%'})
    
    # Hojas de trabajo
    worksheet_productos = workbook.add_worksheet('Productos')
    worksheet_ventas = workbook.add_worksheet('Ventas')
    worksheet_perdidas = workbook.add_worksheet('Pérdidas')
    worksheet_graficos = workbook.add_worksheet('Gráficos')

    # Hoja de Productos
    headers_productos = [
        'ID', 'Nombre', 'Stock Inicial', 'Stock Actual', 'Precio Unitario',
        'Precio Total', 'Categoría', 'Vendidos', 'Desechados', 'Fecha Creación',
        'Días', 'Estado', 'Ubicación', '% Stock'
    ]
    for col, header in enumerate(headers_productos):
        worksheet_productos.write(0, col, header, header_format)
        worksheet_productos.set_column(col, col, 15)

    productos = Producto.objects.select_related('Categoria').prefetch_related(
        'ventas', 'perdidas'
    ).all()

    for row, p in enumerate(productos, start=1):
        worksheet_productos.write(row, 0, p.id)
        worksheet_productos.write(row, 1, p.NombreProducto)
        worksheet_productos.write(row, 2, p.StockProductoInicial)
        worksheet_productos.write(row, 3, p.StockProductoActual)
        worksheet_productos.write(row, 4, float(p.PrecioUnitarioProducto), money_format)
        worksheet_productos.write(row, 5, float(p.PrecioTotalProducto), money_format)
        worksheet_productos.write(row, 6, p.Categoria.NombreCategoria if p.Categoria else 'Sin categoría')
        worksheet_productos.write(row, 7, p.CantidadProductoVendido)
        worksheet_productos.write(row, 8, p.CantidadProductoDesechado)
        worksheet_productos.write_datetime(row, 9, p.FechaProducto, date_format)
        worksheet_productos.write(row, 10, p.DiasProducto)
        worksheet_productos.write(row, 11, p.EstadoProducto or 'No especificado')
        worksheet_productos.write(row, 12, p.UbicacionProducto or 'No especificada')
        worksheet_productos.write(row, 13, p.porcentaje_stock_disponible/100, percent_format)

    # Hoja de Ventas
    headers_ventas = [
        'ID Venta', 'Producto', 'Cliente', 'Cantidad', 'Precio Unitario',
        'Total', 'Fecha'
    ]
    for col, header in enumerate(headers_ventas):
        worksheet_ventas.write(0, col, header, header_format)
        worksheet_ventas.set_column(col, col, 15)

    ventas = Ventas.objects.select_related('Producto', 'cliente').all()
    for row, v in enumerate(ventas, start=1):
        worksheet_ventas.write(row, 0, v.id)
        worksheet_ventas.write(row, 1, v.Producto.NombreProducto)
        worksheet_ventas.write(row, 2, str(v.cliente) if v.cliente else 'Sin cliente')
        worksheet_ventas.write(row, 3, v.CantidadVenta)
        worksheet_ventas.write(row, 4, float(v.PrecioVenta), money_format)
        worksheet_ventas.write(row, 5, float(v.PrecioTotalVenta), money_format)
        worksheet_ventas.write_datetime(row, 6, v.FechaVenta, date_format)

    # Hoja de Pérdidas
    headers_perdidas = [
        'ID', 'Producto', 'Cantidad', 'Valor Unitario', 'Valor Total',
        'Motivo', 'Fecha'
    ]
    for col, header in enumerate(headers_perdidas):
        worksheet_perdidas.write(0, col, header, header_format)
        worksheet_perdidas.set_column(col, col, 15)

    perdidas = Perdidas.objects.select_related('Producto').all()
    for row, p in enumerate(perdidas, start=1):
        worksheet_perdidas.write(row, 0, p.id)
        worksheet_perdidas.write(row, 1, p.Producto.NombreProducto)
        worksheet_perdidas.write(row, 2, p.CantidadPerdida)
        worksheet_perdidas.write(row, 3, float(p.ValorUnitarioPerdida), money_format)
        worksheet_perdidas.write(row, 4, float(p.ValorTotalPerdida), money_format)
        worksheet_perdidas.write(row, 5, p.get_MotivoPerdida_display())
        worksheet_perdidas.write_datetime(row, 6, p.FechaPerdida, date_format)

    # Datos para gráficos
    data_for_charts = {
        'ventas_por_mes': {},
        'perdidas_por_motivo': {},
        'productos_por_categoria': {},
        'stock_status': {'Con Stock': 0, 'Sin Stock': 0}
    }

    # Recopilar datos para gráficos
    for v in ventas:
        mes = v.FechaVenta.strftime('%Y-%m')
        data_for_charts['ventas_por_mes'][mes] = data_for_charts['ventas_por_mes'].get(mes, 0) + float(v.PrecioTotalVenta)

    for p in perdidas:
        motivo = p.get_MotivoPerdida_display()
        data_for_charts['perdidas_por_motivo'][motivo] = data_for_charts['perdidas_por_motivo'].get(motivo, 0) + p.CantidadPerdida

    for p in productos:
        if p.Categoria:
            cat = p.Categoria.NombreCategoria
            data_for_charts['productos_por_categoria'][cat] = data_for_charts['productos_por_categoria'].get(cat, 0) + 1
        if p.StockProductoActual > 0:
            data_for_charts['stock_status']['Con Stock'] += 1
        else:
            data_for_charts['stock_status']['Sin Stock'] += 1

    # Crear gráficos
    chart_row = 1
    
    # 1. Ventas por mes (líneas)
    ventas_chart = workbook.add_chart({'type': 'line'})
    worksheet_graficos.write_column('A1', ['Mes'] + list(data_for_charts['ventas_por_mes'].keys()))
    worksheet_graficos.write_column('B1', ['Total'] + list(data_for_charts['ventas_por_mes'].values()))
    ventas_chart.add_series({
        'name': 'Ventas Mensuales',
        'categories': f'=Gráficos!$A$2:$A${len(data_for_charts["ventas_por_mes"])+1}',
        'values': f'=Gráficos!$B$2:$B${len(data_for_charts["ventas_por_mes"])+1}',
    })
    ventas_chart.set_title({'name': 'Ventas por Mes'})
    worksheet_graficos.insert_chart('D1', ventas_chart)

    # 2. Pérdidas por motivo (pie)
    perdidas_chart = workbook.add_chart({'type': 'pie'})
    worksheet_graficos.write_column('E1', ['Motivo'] + list(data_for_charts['perdidas_por_motivo'].keys()))
    worksheet_graficos.write_column('F1', ['Cantidad'] + list(data_for_charts['perdidas_por_motivo'].values()))
    perdidas_chart.add_series({
        'name': 'Pérdidas por Motivo',
        'categories': f'=Gráficos!$E$2:$E${len(data_for_charts["perdidas_por_motivo"])+1}',
        'values': f'=Gráficos!$F$2:$F${len(data_for_charts["perdidas_por_motivo"])+1}',
        'data_labels': {'percentage': True}
    })
    perdidas_chart.set_title({'name': 'Distribución de Pérdidas'})
    worksheet_graficos.insert_chart('D15', perdidas_chart)

    # 3. Stock Status (donut)
    stock_chart = workbook.add_chart({'type': 'doughnut'})
    worksheet_graficos.write_column('H1', ['Estado'] + list(data_for_charts['stock_status'].keys()))
    worksheet_graficos.write_column('I1', ['Cantidad'] + list(data_for_charts['stock_status'].values()))
    stock_chart.add_series({
        'name': 'Estado del Stock',
        'categories': f'=Gráficos!$H$2:$H${len(data_for_charts["stock_status"])+1}',
        'values': f'=Gráficos!$I$2:$I${len(data_for_charts["stock_status"])+1}',
        'data_labels': {'percentage': True}
    })
    stock_chart.set_title({'name': 'Estado del Stock'})
    worksheet_graficos.insert_chart('K1', stock_chart)

    # 4. Añadir gráfico de ventas vs pérdidas
    ventas_perdidas_chart = workbook.add_chart({'type': 'pie'})
    
    # Calcular totales
    total_ventas = sum(v.PrecioTotalVenta for v in ventas)
    total_perdidas = sum(p.ValorTotalPerdida for p in perdidas)
    
    worksheet_graficos.write_column('K1', ['Tipo', 'Ventas', 'Pérdidas'])
    worksheet_graficos.write_column('L1', ['Cantidad', float(total_ventas), float(total_perdidas)])

    ventas_perdidas_chart.add_series({
        'name': 'Ventas vs Pérdidas',
        'categories': '=Gráficos!$K$2:$K$3',
        'values': '=Gráficos!$L$2:$L$3',
        'data_labels': {
            'percentage': True,
            'value': True,
            'category': True
        }
    })
    ventas_perdidas_chart.set_title({'name': 'Distribución Ventas vs Pérdidas'})
    worksheet_graficos.insert_chart('K15', ventas_perdidas_chart)

    # Añadir totales en la hoja
    bold_format = workbook.add_format({'bold': True})
    worksheet_graficos.write('K30', 'Total Ventas:', bold_format)
    worksheet_graficos.write('L30', float(total_ventas), money_format)
    worksheet_graficos.write('K31', 'Total Pérdidas:', bold_format)
    worksheet_graficos.write('L31', float(total_perdidas), money_format)
    worksheet_graficos.write('K32', 'Total General:', bold_format)
    worksheet_graficos.write('L32', float(total_ventas + total_perdidas), money_format)

    # Ahora sí cerramos el workbook
    workbook.close()
    output.seek(0)
    
    response = HttpResponse(
        output.read(),
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = f'attachment; filename="Reporte_Productos_{timezone.now().strftime("%Y%m%d_%H%M")}.xlsx"'
    
    return response
@login_required(login_url='login')
@ensure_csrf_cookie
def registrar_venta(request, producto_id):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            producto = get_object_or_404(Producto, id=producto_id)
            
            # Validar stock
            cantidad = int(data.get('CantidadVenta'))
            if not cantidad or cantidad > producto.StockProductoActual:
                return JsonResponse({
                    'success': False,
                    'errors': f'Stock insuficiente. Disponible: {producto.StockProductoActual}'
                }, status=400)

            # Manejar cliente
            cliente = None
            cliente_data = data.get('cliente', {})
            
            if cliente_data.get('tipo') == 'existente':
                cliente = get_object_or_404(Cliente, id=cliente_data.get('id'))
            elif cliente_data.get('tipo') == 'nuevo':
                cliente = Cliente.objects.create(
                    NombreCliente=cliente_data.get('NombreCliente'),
                    ApellidoCliente=cliente_data.get('ApellidoCliente'),
                    RutCliente=cliente_data.get('RutCliente'),
                    TipoCliente=cliente_data.get('TipoCliente', 'particular'),
                    NombreCompañia=cliente_data.get('NombreCompañia'),
                    TelefonoCliente=cliente_data.get('TelefonoCliente'),
                    Usuario=request.user
                )

            # Crear la venta
            venta = Ventas.objects.create(
                NombreVenta=data.get('NombreVenta'),
                CantidadVenta=cantidad,
                PrecioVenta=Decimal(str(data.get('PrecioVenta'))),
                Producto=producto,
                Usuario=request.user,
                cliente=cliente
            )
            
            # Actualizar stock
            producto.vender_cantidad(cantidad)

            # Actualizar totales de la categoría si existe
            if producto.Categoria:
                producto.Categoria.actualizar_totales()

            # Actualizar totales del cliente si existe
            if cliente:
                cliente.actualizar_totales()
            
            return JsonResponse({
                'success': True,
                'message': 'Venta registrada exitosamente',
                'data': {
                    'id': venta.id,
                    'nombre': venta.NombreVenta,
                    'cantidad': venta.CantidadVenta,
                    'precio_total': float(venta.PrecioTotalVenta),
                    'producto': producto.NombreProducto,
                    'stock_restante': producto.StockProductoActual,
                    'cliente': {
                        'nombre': str(cliente),
                        'cantidad_compras': cliente.CantidadTotalCompras if cliente else 0,
                        'total_compras': float(cliente.TotalDineroCompras) if cliente else 0
                    } if cliente else None
                }
            })
            
        except ValidationError as e:
            return JsonResponse({'success': False, 'errors': str(e)}, status=400)
        except Exception as e:
            return JsonResponse({'success': False, 'errors': str(e)}, status=500)
            
    return JsonResponse({'success': False, 'errors': 'Método no permitido'}, status=405)
@login_required(login_url='login')
@ensure_csrf_cookie
def registrar_perdida(request, producto_id):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            producto = get_object_or_404(Producto, id=producto_id)
            
            # Validar que hay suficiente stock
            cantidad = int(data.get('cantidad', 0))
            if cantidad <= 0:
                return JsonResponse({
                    'success': False,
                    'errors': 'La cantidad debe ser mayor a 0'
                }, status=400)

            # Actualizar el producto primero
            producto.desechar_cantidad(cantidad)

            # Crear el registro de pérdida
            perdida = Perdidas.objects.create(
                NombrePerdida=data.get('nombre_perdida'),
                CantidadPerdida=cantidad,
                ValorUnitarioPerdida=data.get('valor_unitario'),
                ValorTotalPerdida=float(data.get('valor_unitario', 0)) * float(cantidad),
                MotivoPerdida=data.get('motivo'),
                DescripcionPerdida=data.get('descripcion', ''),
                Producto=producto,
                Usuario=request.user
            )

            # Actualizar totales de la categoría si existe
            if producto.Categoria:
                producto.Categoria.actualizar_totales()
            
            return JsonResponse({
                'success': True,
                'message': 'Pérdida registrada exitosamente',
                'data': {
                    'id': perdida.id,
                    'nombre': perdida.NombrePerdida,
                    'cantidad': perdida.CantidadPerdida,
                    'valor_total': float(perdida.ValorTotalPerdida),
                    'motivo': perdida.get_MotivoPerdida_display(),
                    'producto': producto.NombreProducto,
                    'stock_restante': producto.StockProductoActual,
                    'categoria': {
                        'nombre': producto.Categoria.NombreCategoria,
                        'cantidad_perdidas': producto.Categoria.CantidadCategoriaPerdida,
                    } if producto.Categoria else None
                }
            })
            
        except ValidationError as e:
            return JsonResponse({
                'success': False,
                'errors': str(e)
            }, status=400)
        except Exception as e:
            logger.error(f"Error al registrar pérdida: {str(e)}")
            return JsonResponse({
                'success': False,
                'errors': str(e)
            }, status=500)
            
    return JsonResponse({
        'success': False,
        'errors': 'Método no permitido'
    }, status=405)


@login_required(login_url='login')
def listar_categorias(request):
    try:
        categorias = Categoria.objects.all()
        return JsonResponse({
            'success': True,
            'categorias': [
                {
                    'id': categoria.id,
                    'NombreCategoria': categoria.NombreCategoria
                } for categoria in categorias
            ]
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
        
@login_required(login_url='login')
def listar_materiales_producto(request):
    try:
        materiales = Material.objects.all()
        materiales_data = [
            {
                'id': material.id,
                'NombreMaterial': material.NombreMaterial,
                'StockMaterial': material.StockMaterial
            } for material in materiales
        ]
        return JsonResponse({
            'success': True,
            'materiales': materiales_data
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
@login_required(login_url='login')
@ensure_csrf_cookie
def listar_clientes(request):
    try:
        clientes = Cliente.objects.all()
        data = []

        for cliente in clientes:
            data.append({
                'id': cliente.id,
                'nombre': str(cliente),
                'rut': cliente.RutCliente,
                'tipo': cliente.TipoCliente,
                'telefono': cliente.TelefonoCliente or '',  # Por si es null
                'compañia': cliente.NombreCompañia or '',
                'comentario': cliente.ComentarioCliente or '',
                'fecha_registro': cliente.FechaCliente.strftime('%Y-%m-%d') if cliente.FechaCliente else '',
                'usuario': cliente.Usuario.username if cliente.Usuario else ''
            })

        return JsonResponse({
            'success': True,
            'message': 'Clientes obtenidos exitosamente',
            'data': data
        })

    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': 'Error al obtener los clientes',
            'error': str(e)
        }, status=500)
        
#-------------MODULO PARA CATEGORIA----------------------
@login_required(login_url='login')
def mod_categoria(request):
    return render(request, 'material/categoria.html')
@login_required(login_url='login')
def listar_categorias_completo(request):
    try:
        categorias = Categoria.objects.all()
        return JsonResponse({
            'success': True,
            'categorias': [
                {
                    'id': categoria.id,
                    'NombreCategoria': categoria.NombreCategoria,
                    'DescripcionCategoria': categoria.DescripcionCategoria,
                    'StockCategoria': categoria.StockCategoria,
                    'FotoCategoria': str(categoria.FotoCategoria.url) if categoria.FotoCategoria else None,
                    'CantidadCategoriaPerdida': categoria.CantidadCategoriaPerdida,
                    'CantidadCategoriaVenta': categoria.CantidadCategoriaVenta,
                    'TotalCategoriaVenta': str(categoria.TotalCategoriaVenta),
                    'TotalCategoriaPerdida': str(categoria.TotalCategoriaPerdida)
                } for categoria in categorias
            ]
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@login_required(login_url='login')
@ensure_csrf_cookie
def crear_categoria(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)
    
    try:
        # Log para debugging
        print("Datos recibidos:", request.POST)
        print("Archivos recibidos:", request.FILES)
        
        data = request.POST
        
        # Validar campos requeridos
        if not data.get('NombreCategoria'):
            return JsonResponse({
                'success': False,
                'errors': {'NombreCategoria': 'El nombre de la categoría es requerido'}
            }, status=400)
        
        # Crear la categoría con los campos exactos del modelo
        nueva_categoria = Categoria(
            NombreCategoria=data.get('NombreCategoria'),
            DescripcionCategoria=data.get('DescripcionCategoria', '')
            # Los demás campos tienen valores por defecto en el modelo
        )
        
        # Manejar la foto si existe
        if 'FotoCategoria' in request.FILES:
            foto = request.FILES['FotoCategoria']
            
            # Validar tipo de archivo
            ALLOWED_FILE_TYPES = [
                'image/jpeg', 'image/png', 'image/gif',
                'image/bmp', 'image/webp', 'image/tiff', 'image/svg+xml'
            ]
            
            if foto.content_type not in ALLOWED_FILE_TYPES:
                return JsonResponse({
                    'success': False,
                    'errors': {'FotoCategoria': 'Formato no válido. Formatos permitidos: JPG, PNG, GIF, BMP, WEBP, TIFF, SVG'}
                }, status=400)

            if foto.size > 10 * 1024 * 1024:  # 10MB
                return JsonResponse({
                    'success': False,
                    'errors': {'FotoCategoria': 'El archivo es demasiado grande. El tamaño máximo permitido es 10MB'}
                }, status=400)

            nueva_categoria.FotoCategoria = foto

        try:
            nueva_categoria.full_clean()
            nueva_categoria.save()
        except ValidationError as e:
            print("Errores de validación:", e.message_dict)
            errores_formateados = {campo: errores[0] if errores else str(errores) 
                                 for campo, errores in e.message_dict.items()}
            return JsonResponse({'success': False, 'errors': errores_formateados}, status=400)
        except IntegrityError as e:
            if 'unique constraint' in str(e).lower():
                return JsonResponse({
                    'success': False,
                    'errors': {'NombreCategoria': 'Ya existe una categoría con este nombre'}
                }, status=400)
            raise
        
        # Devolver la respuesta con los campos exactos del modelo
        return JsonResponse({
            'success': True,
            'mensaje': 'Categoría creada exitosamente',
            'categoria': {
                'id': nueva_categoria.id,
                'NombreCategoria': nueva_categoria.NombreCategoria,
                'DescripcionCategoria': nueva_categoria.DescripcionCategoria or '',
                'StockCategoria': nueva_categoria.StockCategoria,
                'CantidadCategoriaPerdida': nueva_categoria.CantidadCategoriaPerdida,
                'CantidadCategoriaVenta': nueva_categoria.CantidadCategoriaVenta,
                'TotalCategoriaVenta': str(nueva_categoria.TotalCategoriaVenta),
                'TotalCategoriaPerdida': str(nueva_categoria.TotalCategoriaPerdida),
                'FotoCategoria': nueva_categoria.FotoCategoria.url if nueva_categoria.FotoCategoria else None
            }
        })
        
    except Exception as e:
        import traceback
        print("Error al crear categoría:", str(e))
        print(traceback.format_exc())
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
@login_required(login_url='login')
@ensure_csrf_cookie
def actualizar_categoria(request, categoria_id):
    if request.method in ['PUT', 'POST']:  # Permitimos ambos métodos
        try:
            categoria = get_object_or_404(Categoria, id=categoria_id)
            data = request.POST
            
            # Campos requeridos
            campos_requeridos = ['NombreCategoria']
            errores = {}
            
            for campo in campos_requeridos:
                if not data.get(campo):
                    errores[campo] = f'El campo {campo} es requerido'
            
            if errores:
                return JsonResponse({'success': False, 'errors': errores}, status=400)

            # Manejar la foto
            if data.get('eliminar_FotoCategoria', '').lower() == 'true' and categoria.FotoCategoria:
                try:
                    url = categoria.FotoCategoria.url
                    parts = url.split('/')
                    public_id = f"{parts[-2]}/{parts[-1].split('.')[0]}"
                    
                    cloudinary.config(
                        cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
                        api_key=os.getenv('CLOUDINARY_API_KEY'),
                        api_secret=os.getenv('CLOUDINARY_API_SECRET')
                    )
                    
                    result = cloudinary.uploader.destroy(
                        public_id,
                        resource_type="image",
                        type="upload",
                        invalidate=True
                    )
                    print(f"Resultado de eliminación foto: {result}")
                    
                    categoria.FotoCategoria = None
                    
                except Exception as e:
                    print(f"Error al eliminar foto: {str(e)}")
                    return JsonResponse({
                        'success': False,
                        'errors': {'FotoCategoria': f'Error al eliminar la foto: {str(e)}'}
                    }, status=400)
            
            elif 'FotoCategoria' in request.FILES:
                foto = request.FILES['FotoCategoria']
                
                if foto.size > 10 * 1024 * 1024:
                    return JsonResponse({
                        'success': False,
                        'errors': {'FotoCategoria': 'El archivo es demasiado grande. El tamaño máximo permitido es 10MB'}
                    }, status=400)
                
                if foto.content_type not in ALLOWED_FILE_TYPES:
                    return JsonResponse({
                        'success': False,
                        'errors': {'FotoCategoria': 'Formato no válido. Formatos permitidos: JPG, PNG, GIF, BMP, WEBP, TIFF, SVG'}
                    }, status=400)
                
                if categoria.FotoCategoria:
                    try:
                        url = categoria.FotoCategoria.url
                        parts = url.split('/')
                        public_id = f"{parts[-2]}/{parts[-1].split('.')[0]}"
                        
                        cloudinary.config(
                            cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
                            api_key=os.getenv('CLOUDINARY_API_KEY'),
                            api_secret=os.getenv('CLOUDINARY_API_SECRET')
                        )
                        
                        cloudinary.uploader.destroy(
                            public_id,
                            resource_type="image",
                            type="upload",
                            invalidate=True
                        )
                    except Exception as e:
                        print(f"Error al eliminar foto anterior: {str(e)}")
                
                categoria.FotoCategoria = foto

            # Actualizar campos de la categoría
            categoria.NombreCategoria = data.get('NombreCategoria', categoria.NombreCategoria)
            categoria.DescripcionCategoria = data.get('DescripcionCategoria', categoria.DescripcionCategoria)
            
            try:
                categoria.full_clean()
                categoria.save()
            except ValidationError as e:
                errores_formateados = {campo: errores[0] if errores else str(errores) 
                                     for campo, errores in e.message_dict.items()}
                return JsonResponse({'success': False, 'errors': errores_formateados}, status=400)

            return JsonResponse({
                'success': True,
                'message': 'Categoría actualizada exitosamente',
                'categoria': {
                    'id': categoria.id,
                    'NombreCategoria': categoria.NombreCategoria,
                    'DescripcionCategoria': categoria.DescripcionCategoria,
                    'StockCategoria': categoria.StockCategoria,
                    'CantidadCategoriaPerdida': categoria.CantidadCategoriaPerdida,
                    'CantidadCategoriaVenta': categoria.CantidadCategoriaVenta,
                    'TotalCategoriaVenta': str(categoria.TotalCategoriaVenta),
                    'TotalCategoriaPerdida': str(categoria.TotalCategoriaPerdida),
                    'FotoCategoria': categoria.FotoCategoria.url if categoria.FotoCategoria else None
                }
            })
            
        except Exception as e:
            print(f"Error general: {str(e)}")
            return JsonResponse({
                'success': False,
                'errors': {'general': f'Error al actualizar la categoría: {str(e)}'}
            }, status=400)

    return JsonResponse({
        'success': False,
        'errors': {'general': 'Método no permitido'}
    }, status=405)
@login_required(login_url='login')
def eliminar_categoria(request, categoria_id):
    if request.method != 'DELETE':
        return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)
    
    try:
        categoria = Categoria.objects.get(id=categoria_id)
        categoria.delete()
        return JsonResponse({
            'success': True,
            'mensaje': 'Categoría eliminada exitosamente'
        })
    except Categoria.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Categoría no encontrada'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@login_required(login_url='login')
def exportar_categorias_excel(request):
    try:
        output = BytesIO()
        workbook = xlsxwriter.Workbook(output, {'remove_timezone': True})
        
        # Formatos
        header_format = workbook.add_format({
            'bold': True, 'bg_color': '#000000', 'font_color': 'white', 'border': 1
        })
        money_format = workbook.add_format({'num_format': '$#,##0'})
        
        # Hoja principal de categorías
        worksheet = workbook.add_worksheet('Categorías')
        
        # Headers
        headers = [
            'ID', 'Nombre', 'Descripción', 'Stock', 
            'Productos Perdidos', 'Productos Vendidos',
            'Total Ventas', 'Total Pérdidas'
        ]
        
        for col, header in enumerate(headers):
            worksheet.write(0, col, header, header_format)
            worksheet.set_column(col, col, 15)
        
        # Datos
        categorias = Categoria.objects.all()
        for row, categoria in enumerate(categorias, start=1):
            worksheet.write(row, 0, categoria.id)
            worksheet.write(row, 1, categoria.NombreCategoria)
            worksheet.write(row, 2, categoria.DescripcionCategoria or 'Sin descripción')
            worksheet.write(row, 3, categoria.StockCategoria)
            worksheet.write(row, 4, categoria.CantidadCategoriaPerdida)
            worksheet.write(row, 5, categoria.CantidadCategoriaVenta)
            worksheet.write(row, 6, float(categoria.TotalCategoriaVenta), money_format)
            worksheet.write(row, 7, float(categoria.TotalCategoriaPerdida), money_format)
        
        workbook.close()
        output.seek(0)
        
        response = HttpResponse(
            output.read(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename="Categorias_{timezone.now().strftime("%Y%m%d_%H%M")}.xlsx"'
        
        return response
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@login_required(login_url='login')
def solicitar_eliminacion_categoria(request, categoria_id):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)
    
    try:
        categoria = Categoria.objects.get(id=categoria_id)
        
        # Crear token con información de la categoría y timestamp
        payload = {
            'categoria_id': categoria_id,
            'timestamp': timezone.now().timestamp(),
            'expiry': (timezone.now() + timezone.timedelta(minutes=30)).timestamp()
        }
        
        token = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode()
        
        # URL de confirmación
        confirmation_url = request.build_absolute_uri(
            reverse('confirmar_eliminacion_categoria', kwargs={'token': token})
        )
        
        # Formatear montos para el correo
        def format_clp(amount):
            try:
                amount = float(amount)
                return f"${amount:,.0f}".replace(",", ".")
            except (ValueError, TypeError):
                return "$0"
        
        # Mensaje del correo
        mensaje_correo = f"""
        Se ha solicitado la eliminación de la siguiente categoría:
        
        ID: {categoria.id}
        Nombre: {categoria.NombreCategoria}
        Stock actual: {categoria.StockCategoria}
        Productos Vendidos: {categoria.CantidadCategoriaVenta}
        Productos Perdidos: {categoria.CantidadCategoriaPerdida}
        Total Ventas: {format_clp(categoria.TotalCategoriaVenta)}
        Total Pérdidas: {format_clp(categoria.TotalCategoriaPerdida)}
        
        Para confirmar la eliminación de esta categoría, haz clic en el siguiente enlace:
        {confirmation_url}
        
        Este enlace expirará en 30 minutos.
        
        IMPORTANTE: Esta acción no se puede deshacer una vez confirmada.
        Si no solicitaste esta eliminación, puedes ignorar este correo.
        """
        
        # Enviar correo
        send_mail(
            'Confirmación de Eliminación de Categoría',
            mensaje_correo,
            settings.DEFAULT_FROM_EMAIL,
            [request.user.email],
            fail_silently=False,
        )
        
        return JsonResponse({
            'success': True,
            'mensaje': 'Se ha enviado un correo de confirmación'
        })
        
    except Categoria.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Categoría no encontrada'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@login_required(login_url='login')
def confirmar_eliminacion_categoria(request, token):
    try:
        # Decodificar y validar token
        payload = json.loads(base64.urlsafe_b64decode(token.encode()).decode())
        
        # Verificar expiración
        if timezone.now().timestamp() > float(payload['expiry']):
            return JsonResponse({
                'success': False,
                'error': 'El enlace ha expirado. Por favor, solicita un nuevo correo de confirmación.'
            }, status=400)
        
        categoria_id = payload['categoria_id']
        categoria = Categoria.objects.get(id=categoria_id)
        
        # Eliminar la categoría
        categoria.delete()
        
        # Retornar mensaje de éxito
        return JsonResponse({
            'success': True,
            'mensaje': 'La categoría ha sido eliminada exitosamente'
        })
        
    except (json.JSONDecodeError, KeyError, ValueError):
        return JsonResponse({
            'success': False,
            'error': 'El enlace no es válido'
        }, status=400)
    except Categoria.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'La categoría no existe o ya fue eliminada'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
#------------RUTA PARA USUARIOS---------
@login_required(login_url='login')
@ensure_csrf_cookie
def actualizar_usuario(request):
   if request.method != 'POST':
       return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)
   
   try:
       user = request.user
       
       # Actualizar user primero si es superusuario
       if user.is_superuser:
           user.first_name = request.POST.get('first_name', user.first_name)
           user.last_name = request.POST.get('last_name', user.last_name)
           user.email = request.POST.get('email', user.email)
           user.save()
           
           return JsonResponse({
               'success': True,
               'usuario': {
                   'user': {
                       'id': user.id,
                       'first_name': user.first_name,
                       'last_name': user.last_name,
                       'email': user.email,
                   },
                   'TipoUsuario': 'Superadmin',
               }
           })
       
       # Si no es superuser, obtener o crear perfil
       try:
           usuario = Usuario.objects.get(user=user)
       except Usuario.DoesNotExist:
           usuario = Usuario.objects.create(
               user=user,
               RutUsuario=request.POST.get('RutUsuario', ''),
               TipoUsuario='Administrador'
           )
       
       # Actualizar campos del user
       user.first_name = request.POST.get('first_name', user.first_name)
       user.last_name = request.POST.get('last_name', user.last_name)
       user.email = request.POST.get('email', user.email)
       user.save()
       
       # Actualizar campos del usuario
       if 'RutUsuario' in request.POST:
           usuario.RutUsuario = request.POST['RutUsuario']
       if 'EdadUsuario' in request.POST and request.POST['EdadUsuario']:
           usuario.EdadUsuario = int(request.POST['EdadUsuario'])
       if 'TelefonoUsuario' in request.POST:
           usuario.TelefonoUsuario = request.POST['TelefonoUsuario']
           
       # Manejar foto
       if 'FotoUsuario' in request.FILES:
           foto = request.FILES['FotoUsuario']
           try:
               # Validar tamaño y tipo
               if foto.size > 5 * 1024 * 1024:  # 5MB
                   return JsonResponse({
                       'success': False,
                       'error': 'La imagen no debe superar 5MB'
                   }, status=400)
               
               allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
               if foto.content_type not in allowed_types:
                   return JsonResponse({
                       'success': False,
                       'error': 'Formato de imagen no permitido. Use JPG, PNG, GIF o WEBP'
                   }, status=400)
               
               # Si existe una foto anterior, eliminarla de Cloudinary
               if usuario.FotoUsuario and hasattr(usuario.FotoUsuario, 'public_id'):
                   try:
                       cloudinary.uploader.destroy(usuario.FotoUsuario.public_id)
                   except Exception as e:
                       print(f"Error al eliminar imagen anterior: {str(e)}")

               # Generar un nuevo public_id único
               public_id = f'usuario_{user.id}_{int(time.time())}'
               
               # Subir nueva imagen
               resultado = cloudinary.uploader.upload(
                   foto,
                   folder='usuarios',
                   public_id=public_id,
                   overwrite=True,
                   resource_type='auto'
               )
               
               # Actualizar el campo FotoUsuario con la URL segura
               usuario.FotoUsuario = resultado['secure_url']
               
           except Exception as e:
               print(f"Error al procesar la imagen: {str(e)}")
               return JsonResponse({
                   'success': False,
                   'error': 'Error al procesar la imagen: ' + str(e)
               }, status=500)
       
       # Guardar cambios
       usuario.save()
       
       # Preparar respuesta con datos actualizados
       response_data = {
           'success': True,
           'usuario': {
               'user': {
                   'id': user.id,
                   'first_name': user.first_name,
                   'last_name': user.last_name,
                   'email': user.email,
               },
               'RutUsuario': usuario.RutUsuario,
               'TipoUsuario': usuario.TipoUsuario,
               'EdadUsuario': usuario.EdadUsuario,
               'TelefonoUsuario': usuario.TelefonoUsuario,
               'FotoUsuario': usuario.FotoUsuario if usuario.FotoUsuario else None,
           }
       }
       
       return JsonResponse(response_data)
       
   except ValidationError as e:
       return JsonResponse({
           'success': False,
           'errors': e.message_dict if hasattr(e, 'message_dict') else {'error': str(e)}
       }, status=400)
   
   except Exception as e:
       print(f"Error inesperado: {str(e)}")
       return JsonResponse({
           'success': False,
           'error': 'Error interno del servidor: ' + str(e)
       }, status=500)
        
@login_required(login_url='login')
def enviar_reporte(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Método no permitido'}, status=405)
    
    try:
        asunto = request.POST.get('asunto')
        mensaje = request.POST.get('mensaje')
        adjuntos = request.FILES.getlist('adjuntos')

        # Formatear el mensaje del correo
        mensaje_correo = f"""
        Se ha recibido un nuevo reporte:
        
        Asunto: {asunto}
        Enviado por: {request.user.email}
        
        Mensaje:
        {mensaje}
        """
        
        # Crear el email con EmailMessage para poder adjuntar archivos
        email = EmailMessage(
            subject=f'Reporte: {asunto}',
            body=mensaje_correo,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=['kuromechiv@gmail.com']
        )

        # Adjuntar los archivos
        for adjunto in adjuntos:
            print(f"Adjuntando archivo: {adjunto.name}")  # Debug
            email.attach(
                adjunto.name,
                adjunto.read(),
                adjunto.content_type
            )

        # Enviar el email
        email.send(fail_silently=False)
        
        return JsonResponse({
            'success': True,
            'mensaje': 'Reporte enviado exitosamente'
        })
        
    except Exception as e:
        print(f"Error al enviar reporte: {str(e)}")  # Para debugging
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

#------------------VIEWS PARA PERDIDA-----------------------
@login_required(login_url='login')
def mod_perdida(request):
    return render(request, 'material/perdida.html')

@login_required(login_url='login')
@ensure_csrf_cookie
def actualizar_perdida(request, perdida_id):
    if request.method != 'POST':
        return JsonResponse({
            'success': False,
            'errors': {'general': 'Método no permitido'}
        }, status=405)

    try:
        perdida = get_object_or_404(Perdidas, id=perdida_id)
        data = json.loads(request.body)

        # Validar campos editables requeridos
        campos_requeridos = {
            'nombre_perdida': 'Nombre de la pérdida',
            'motivo': 'Motivo'
        }

        errores = {}
        for campo, nombre in campos_requeridos.items():
            if campo not in data:
                errores[campo] = f'El campo {nombre} es requerido'

        if errores:
            return JsonResponse({
                'success': False,
                'errors': errores
            }, status=400)

        # Validar el motivo
        if data['motivo'] not in dict(Perdidas.MOTIVO_CHOICES):
            return JsonResponse({
                'success': False,
                'errors': {'motivo': 'Motivo no válido'}
            }, status=400)

        # Actualizar solo los campos editables
        perdida.NombrePerdida = data['nombre_perdida']
        perdida.MotivoPerdida = data['motivo']
        perdida.DescripcionPerdida = data.get('descripcion', '')

        perdida.save()

        # Retornar los datos actualizados
        return JsonResponse({
            'success': True,
            'message': 'Pérdida actualizada exitosamente',
            'perdida': {
                'id': perdida.id,
                'nombre': perdida.NombrePerdida,
                'cantidad': perdida.CantidadPerdida,
                'valor_unitario': str(perdida.ValorUnitarioPerdida),
                'valor_total': str(perdida.ValorTotalPerdida),
                'motivo': perdida.get_MotivoPerdida_display(),
                'motivo_key': perdida.MotivoPerdida,
                'descripcion': perdida.DescripcionPerdida,
                'producto': {
                    'id': perdida.Producto.id,
                    'nombre': perdida.Producto.NombreProducto,
                    'stock_actual': perdida.Producto.StockProductoActual
                },
                'usuario': {
                    'id': perdida.Usuario.id if perdida.Usuario else None,
                    'nombre': f"{perdida.Usuario.first_name} {perdida.Usuario.last_name}" if perdida.Usuario else "Usuario no disponible"
                },
                'fecha_registro': perdida.FechaRegistro.isoformat(),
                'ultima_modificacion': perdida.UltimaModificacion.isoformat(),
                'impacto_financiero': perdida.impacto_financiero
            }
        })

    except ValidationError as e:
        return JsonResponse({
            'success': False,
            'errors': e.message_dict if hasattr(e, 'message_dict') else {'general': str(e)}
        }, status=400)
    except Exception as e:
        logger.error(f"Error al actualizar pérdida: {str(e)}")
        return JsonResponse({
            'success': False,
            'errors': {'general': str(e)}
        }, status=500)
@login_required(login_url='login')
def listar_perdidas(request):
    try:
        perdidas = Perdidas.objects.select_related(
            'Producto', 'Usuario'
        ).order_by('-FechaRegistro')

        perdidas_data = []
        for perdida in perdidas:
            perdida_data = {
                'id': perdida.id,
                'nombre': perdida.NombrePerdida,
                'cantidad': perdida.CantidadPerdida,
                'valor_unitario': str(perdida.ValorUnitarioPerdida),
                'valor_total': str(perdida.ValorTotalPerdida),
                'fecha': perdida.FechaPerdida.isoformat(),
                'motivo': perdida.get_MotivoPerdida_display(),
                'motivo_key': perdida.MotivoPerdida,
                'descripcion': perdida.DescripcionPerdida,
                'producto': {
                    'id': perdida.Producto.id,
                    'nombre': perdida.Producto.NombreProducto,
                    'stock_actual': perdida.Producto.StockProductoActual,
                    'categoria': perdida.Producto.Categoria.NombreCategoria if perdida.Producto.Categoria else None
                },
                'usuario': {
                    'id': perdida.Usuario.id if perdida.Usuario else None,
                    'nombre': f"{perdida.Usuario.first_name} {perdida.Usuario.last_name}" if perdida.Usuario else "Usuario no disponible"
                },
                'fecha_registro': perdida.FechaRegistro.isoformat(),
                'ultima_modificacion': perdida.UltimaModificacion.isoformat(),
                'impacto_financiero': perdida.impacto_financiero
            }
            perdidas_data.append(perdida_data)

        return JsonResponse({
            'success': True,
            'perdidas': perdidas_data
        })

    except Exception as e:
        logger.error(f"Error al listar pérdidas: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
def exportar_perdidas_excel(request):
    output = BytesIO()
    
    workbook = xlsxwriter.Workbook(output, {'remove_timezone': True})
    worksheet_data = workbook.add_worksheet('Pérdidas')
    worksheet_charts = workbook.add_worksheet('Gráficos')
    
    # Formatos
    header_format = workbook.add_format({
        'bold': True,
        'bg_color': '#000000',
        'font_color': 'white',
        'border': 1
    })
    
    date_format = workbook.add_format({
        'num_format': 'dd/mm/yyyy',
    })
    
    # Encabezados
    headers = [
        'ID',
        'Nombre Pérdida',
        'Producto',
        'Cantidad',
        'Valor Unitario',
        'Valor Total',
        'Motivo',
        'Descripción',
        'Fecha Pérdida',
        'Usuario',
        'Fecha Registro'
    ]
    
    # Escribir encabezados
    for col, header in enumerate(headers):
        worksheet_data.write(0, col, header, header_format)
        worksheet_data.set_column(col, col, 15)
    
    # Obtener datos
    perdidas = Perdidas.objects.select_related('Producto', 'Usuario').order_by('-FechaPerdida')
    
    # Escribir datos
    for row, perdida in enumerate(perdidas, start=1):
        worksheet_data.write(row, 0, perdida.id)
        worksheet_data.write(row, 1, perdida.NombrePerdida)
        worksheet_data.write(row, 2, perdida.Producto.NombreProducto)
        worksheet_data.write(row, 3, perdida.CantidadPerdida)
        worksheet_data.write(row, 4, float(perdida.ValorUnitarioPerdida))
        worksheet_data.write(row, 5, float(perdida.ValorTotalPerdida))
        worksheet_data.write(row, 6, perdida.get_MotivoPerdida_display())
        worksheet_data.write(row, 7, perdida.DescripcionPerdida or '')
        worksheet_data.write_datetime(row, 8, perdida.FechaPerdida, date_format)
        worksheet_data.write(row, 9, f"{perdida.Usuario.first_name} {perdida.Usuario.last_name}" if perdida.Usuario else "")
        worksheet_data.write_datetime(row, 10, timezone.localtime(perdida.FechaRegistro).replace(tzinfo=None), date_format)
    
    # Preparar datos para gráficos
    motivos_dict = {}
    for perdida in perdidas:
        motivo = perdida.get_MotivoPerdida_display()
        motivos_dict[motivo] = motivos_dict.get(motivo, 0) + 1
    
    # Escribir datos para gráficos
    worksheet_charts.write_row('A1', ['Motivo'], header_format)
    worksheet_charts.write_row('B1', ['Cantidad de Pérdidas'], header_format)
    
    for i, (motivo, cantidad) in enumerate(motivos_dict.items(), start=2):
        worksheet_charts.write(f'A{i}', motivo)
        worksheet_charts.write(f'B{i}', cantidad)
    
    # Gráfico de Columnas
    column_chart = workbook.add_chart({'type': 'column'})
    column_chart.add_series({
        'name': 'Pérdidas por Motivo',
        'categories': f'=Gráficos!$A$2:$A${len(motivos_dict)+1}',
        'values': f'=Gráficos!$B$2:$B${len(motivos_dict)+1}',
        'data_labels': {'value': True},
    })
    column_chart.set_title({'name': 'Pérdidas por Motivo (Columnas)'})
    column_chart.set_size({'width': 500, 'height': 300})
    worksheet_charts.insert_chart('D2', column_chart)
    
    # Gráfico de Pie
    pie_chart = workbook.add_chart({'type': 'pie'})
    pie_chart.add_series({
        'categories': f'=Gráficos!$A$2:$A${len(motivos_dict)+1}',
        'values': f'=Gráficos!$B$2:$B${len(motivos_dict)+1}',
        'data_labels': {'percentage': True},
    })
    pie_chart.set_title({'name': 'Distribución de Pérdidas por Motivo (%)'})
    pie_chart.set_size({'width': 500, 'height': 300})
    worksheet_charts.insert_chart('D18', pie_chart)
    
    # Ajustar anchos de columna automáticamente
    for i, header in enumerate(headers):
        worksheet_data.set_column(i, i, len(header) + 2)
    
    workbook.close()
    
    # Preparar respuesta
    output.seek(0)
    filename = f'Perdidas_{timezone.localtime().strftime("%Y%m%d_%H%M%S")}.xlsx'
    
    response = HttpResponse(
        output.read(),
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    
    return response
@login_required(login_url='login')
@ensure_csrf_cookie
def eliminar_perdida(request, perdida_id):
    if request.method == 'POST':
        try:
            with transaction.atomic():
                # Obtener la pérdida y el producto
                perdida = get_object_or_404(Perdidas, id=perdida_id)
                producto = get_object_or_404(Producto, id=perdida.Producto.id)
                
                # Verificar que la cantidad a restablecer no exceda la cantidad desechada
                if perdida.CantidadPerdida > producto.CantidadProductoDesechado:
                    return JsonResponse({
                        'success': False,
                        'errors': f'Solo hay {producto.CantidadProductoDesechado} unidad(es) desechada(s) para restablecer'
                    }, status=400)

                # Primero eliminar la pérdida para evitar conflictos
                perdida_cantidad = perdida.CantidadPerdida
                perdida.delete()

                # Ahora actualizar el producto
                Producto.objects.filter(pk=producto.pk).update(
                    CantidadProductoDesechado=F('CantidadProductoDesechado') - perdida_cantidad,
                    StockProductoActual=F('StockProductoActual') + perdida_cantidad
                )
                
                # Refrescar para obtener los nuevos valores
                producto.refresh_from_db()
                
                # Actualizar el precio total
                Producto.objects.filter(pk=producto.pk).update(
                    PrecioTotalProducto=F('StockProductoActual') * F('PrecioUnitarioProducto'),
                    ProductoAgotado=F('StockProductoActual') == 0
                )

                # Actualizar categoría si existe
                if producto.Categoria:
                    producto.Categoria.actualizar_totales()

                producto.refresh_from_db()
                return JsonResponse({
                    'success': True,
                    'message': 'Pérdida restablecida exitosamente',
                    'data': {
                        'id': producto.id,
                        'nombre': producto.NombreProducto,
                        'stock_actual': producto.StockProductoActual,
                        'cantidad_desechada': producto.CantidadProductoDesechado,
                        'precio_total': float(producto.PrecioTotalProducto)
                    }
                })

        except Exception as e:
            logger.error(f"Error al eliminar pérdida: {str(e)}")
            return JsonResponse({
                'success': False,
                'errors': str(e)
            }, status=500)

    return JsonResponse({
        'success': False,
        'errors': 'Método no permitido'
    }, status=405)
    
    
    
    
    
    
    
    
    
    
    
    
    
#------------RUTA PARA VENTA---------
@login_required(login_url='login')
def mod_venta(request):
    return render(request, 'venta/venta.html')

@login_required(login_url='login')
@ensure_csrf_cookie
def listar_ventas(request):
    try:
        ventas = Ventas.objects.select_related(
            'Producto', 'Usuario', 'cliente'
        ).order_by('-FechaVenta')

        ventas_data = []
        for venta in ventas:
            # Verificar si esta venta tenía un cliente que fue eliminado
            was_deleted = hasattr(venta, '_cliente_eliminado') or (
                venta.cliente is None and venta.NombreVenta.endswith('(Cliente eliminado)')
            )

            venta_data = {
                'id': venta.id,
                'nombre': venta.NombreVenta,
                'cantidad': venta.CantidadVenta,
                'precio_venta': str(venta.PrecioVenta),
                'precio_total': str(venta.PrecioTotalVenta),
                'fecha': venta.FechaVenta.isoformat(),
                'producto': {
                    'id': venta.Producto.id,
                    'nombre': venta.Producto.NombreProducto,
                    'stock_actual': venta.Producto.StockProductoActual,
                    'categoria': venta.Producto.Categoria.NombreCategoria if venta.Producto.Categoria else None
                },
                'cliente': {
                    'id': venta.cliente.id if venta.cliente else None,
                    'nombre': (
                        "Cliente eliminado" if venta.cliente_eliminado
                        else (str(venta.cliente) if venta.cliente else "Cliente no especificado")
                    ),
                    'tipo': venta.cliente.TipoCliente if venta.cliente else None,
                    'rut': venta.cliente.RutCliente if venta.cliente else None
                },
                'usuario': {
                    'id': venta.Usuario.id if venta.Usuario else None,
                    'nombre': f"{venta.Usuario.first_name} {venta.Usuario.last_name}" if venta.Usuario else "Usuario no disponible"
                },
                'fecha_registro': venta.FechaRegistro.isoformat()
            }
            ventas_data.append(venta_data)

        return JsonResponse({
            'success': True,
            'ventas': ventas_data
        })

    except Exception as e:
        logger.error(f"Error al listar ventas: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@login_required(login_url='login')
@ensure_csrf_cookie
def actualizar_venta(request, venta_id):
    if request.method != 'POST':
        return JsonResponse({
            'success': False,
            'errors': {'general': 'Método no permitido'}
        }, status=405)

    try:
        venta = get_object_or_404(Ventas, id=venta_id)
        data = json.loads(request.body)

        # Validar campos editables requeridos
        campos_requeridos = {
            'nombre_venta': 'Nombre de la venta'
        }

        errores = {}
        for campo, nombre in campos_requeridos.items():
            if campo not in data:
                errores[campo] = f'El campo {nombre} es requerido'

        if errores:
            return JsonResponse({
                'success': False,
                'errors': errores
            }, status=400)

        # Actualizar solo los campos editables
        venta.NombreVenta = data['nombre_venta']

        venta.save()

        # Retornar los datos actualizados
        return JsonResponse({
            'success': True,
            'message': 'Venta actualizada exitosamente',
            'venta': {
                'id': venta.id,
                'nombre': venta.NombreVenta,
                'cantidad': venta.CantidadVenta,
                'precio_venta': str(venta.PrecioVenta),
                'precio_total': str(venta.PrecioTotalVenta),
                'producto': {
                    'id': venta.Producto.id,
                    'nombre': venta.Producto.NombreProducto,
                    'stock_actual': venta.Producto.StockProductoActual
                },
                'cliente': {
                    'id': venta.cliente.id if venta.cliente else None,
                    'nombre': str(venta.cliente) if venta.cliente else "Cliente no especificado"
                },
                'usuario': {
                    'id': venta.Usuario.id if venta.Usuario else None,
                    'nombre': f"{venta.Usuario.first_name} {venta.Usuario.last_name}" if venta.Usuario else "Usuario no disponible"
                },
                'fecha_registro': venta.FechaRegistro.isoformat()
            }
        })

    except ValidationError as e:
        return JsonResponse({
            'success': False,
            'errors': e.message_dict if hasattr(e, 'message_dict') else {'general': str(e)}
        }, status=400)
    except Exception as e:
        logger.error(f"Error al actualizar venta: {str(e)}")
        return JsonResponse({
            'success': False,
            'errors': {'general': str(e)}
        }, status=500)

def exportar_ventas_excel(request):
    output = BytesIO()
    
    workbook = xlsxwriter.Workbook(output, {'remove_timezone': True})
    worksheet_data = workbook.add_worksheet('Ventas')
    worksheet_charts = workbook.add_worksheet('Gráficos')
    
    # Formatos
    header_format = workbook.add_format({
        'bold': True,
        'bg_color': '#000000',
        'font_color': 'white',
        'border': 1
    })
    
    date_format = workbook.add_format({
        'num_format': 'dd/mm/yyyy',
    })
    
    # Encabezados
    headers = [
        'ID',
        'Nombre Venta',
        'Producto',
        'Cliente',
        'Cantidad',
        'Precio Unitario',
        'Total',
        'Fecha Venta',
        'Usuario',
        'Fecha Registro'
    ]
    
    # Escribir encabezados
    for col, header in enumerate(headers):
        worksheet_data.write(0, col, header, header_format)
        worksheet_data.set_column(col, col, 15)
    
    # Obtener datos
    ventas = Ventas.objects.select_related('Producto', 'Usuario', 'cliente').order_by('-FechaVenta')
    
    # Escribir datos
    for row, venta in enumerate(ventas, start=1):
        worksheet_data.write(row, 0, venta.id)
        worksheet_data.write(row, 1, venta.NombreVenta)
        worksheet_data.write(row, 2, venta.Producto.NombreProducto)
        worksheet_data.write(row, 3, str(venta.cliente) if venta.cliente else "Cliente no especificado")
        worksheet_data.write(row, 4, venta.CantidadVenta)
        worksheet_data.write(row, 5, float(venta.PrecioVenta))
        worksheet_data.write(row, 6, float(venta.PrecioTotalVenta))
        worksheet_data.write_datetime(row, 7, venta.FechaVenta, date_format)
        worksheet_data.write(row, 8, f"{venta.Usuario.first_name} {venta.Usuario.last_name}" if venta.Usuario else "")
        worksheet_data.write_datetime(row, 9, timezone.localtime(venta.FechaRegistro).replace(tzinfo=None), date_format)
    
    # Gráficos y análisis adicional
    ventas_por_mes = {}
    for venta in ventas:
        mes = venta.FechaVenta.strftime('%Y-%m')
        if mes not in ventas_por_mes:
            ventas_por_mes[mes] = {
                'cantidad': 0,
                'total': 0
            }
        ventas_por_mes[mes]['cantidad'] += venta.CantidadVenta
        ventas_por_mes[mes]['total'] += float(venta.PrecioTotalVenta)
    
    # Escribir datos para gráficos
    worksheet_charts.write_row('A1', ['Mes', 'Cantidad', 'Total'], header_format)
    
    for i, (mes, datos) in enumerate(ventas_por_mes.items(), start=2):
        worksheet_charts.write(f'A{i}', mes)
        worksheet_charts.write(f'B{i}', datos['cantidad'])
        worksheet_charts.write(f'C{i}', datos['total'])
    
    # Gráfico de columnas para ventas mensuales
    column_chart = workbook.add_chart({'type': 'column'})
    column_chart.add_series({
        'name': 'Cantidad de Ventas',
        'categories': f'=Gráficos!$A$2:$A${len(ventas_por_mes)+1}',
        'values': f'=Gráficos!$B$2:$B${len(ventas_por_mes)+1}',
        'data_labels': {'value': True},
    })
    column_chart.set_title({'name': 'Ventas Mensuales'})
    column_chart.set_size({'width': 500, 'height': 300})
    worksheet_charts.insert_chart('E2', column_chart)
    
    # Gráfico de línea para ingresos mensuales
    line_chart = workbook.add_chart({'type': 'line'})
    line_chart.add_series({
        'name': 'Ingresos Totales',
        'categories': f'=Gráficos!$A$2:$A${len(ventas_por_mes)+1}',
        'values': f'=Gráficos!$C$2:$C${len(ventas_por_mes)+1}',
        'data_labels': {'value': True},
    })
    line_chart.set_title({'name': 'Ingresos Mensuales'})
    line_chart.set_size({'width': 500, 'height': 300})
    worksheet_charts.insert_chart('E18', line_chart)
    
    workbook.close()
    
    # Preparar respuesta
    output.seek(0)
    filename = f'Ventas_{timezone.localtime().strftime("%Y%m%d_%H%M%S")}.xlsx'
    
    response = HttpResponse(
        output.read(),
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    
    return response

@login_required(login_url='login')
@ensure_csrf_cookie
def eliminar_venta(request, venta_id):
    if request.method == 'POST':
        try:
            with transaction.atomic():
                # 1. Obtener la venta y el producto
                venta = get_object_or_404(Ventas, id=venta_id)
                producto = get_object_or_404(Producto, id=venta.Producto.id)
                cliente = venta.cliente

                # 2. Verificar que podemos restablecer la cantidad vendida
                if venta.CantidadVenta > producto.CantidadProductoVendido:
                    return JsonResponse({
                        'success': False,
                        'errors': f'No se puede restablecer esta venta. Inconsistencia en la cantidad vendida.'
                    }, status=400)

                # 3. Calcular nuevos valores
                nueva_cantidad_vendida = producto.CantidadProductoVendido - venta.CantidadVenta
                nuevo_stock = producto.StockProductoInicial - (nueva_cantidad_vendida + producto.CantidadProductoDesechado)

                # 4. Actualizar el producto
                Producto.objects.filter(pk=producto.pk).update(
                    CantidadProductoVendido=nueva_cantidad_vendida,
                    StockProductoActual=nuevo_stock,
                    PrecioTotalProducto=nuevo_stock * producto.PrecioUnitarioProducto,
                    ProductoAgotado=(nuevo_stock == 0)
                )

                # 5. Eliminar la venta
                venta.delete()

                # 6. Actualizar el producto y la categoría
                producto.refresh_from_db()
                if producto.Categoria:
                    producto.Categoria.actualizar_totales()

                # 7. Actualizar totales del cliente si existe
                if cliente:
                    cliente.actualizar_totales()

                return JsonResponse({
                    'success': True,
                    'message': 'Venta eliminada exitosamente',
                    'data': {
                        'id': producto.id,
                        'nombre': producto.NombreProducto,
                        'stock_actual': producto.StockProductoActual,
                        'cantidad_vendida': producto.CantidadProductoVendido,
                        'precio_total': float(producto.PrecioTotalProducto),
                        'cliente': {
                            'nombre': str(cliente),
                            'cantidad_compras': cliente.CantidadTotalCompras,
                            'total_compras': float(cliente.TotalDineroCompras)
                        } if cliente else None
                    }
                })

        except Exception as e:
            logger.error(f"Error al eliminar venta: {str(e)}")
            return JsonResponse({
                'success': False,
                'errors': str(e)
            }, status=500)

    return JsonResponse({
        'success': False,
        'errors': 'Método no permitido'
    }, status=405)
    
    
    
    
#------------RUTA PARA CLIENTE---------

@login_required(login_url='login')
def mod_cliente(request):
    return render(request, 'venta/cliente.html')

@login_required(login_url='login')
@ensure_csrf_cookie
def listar_clientes(request):
    try:
        clientes = Cliente.objects.all().order_by('NombreCliente')

        clientes_data = []
        for cliente in clientes:
            cliente_data = {
                'id': cliente.id,
                'nombre': cliente.NombreCliente,
                'apellido': cliente.ApellidoCliente,
                'rut': cliente.RutCliente,
                'tipo': cliente.TipoCliente,
                'nombre_compania': cliente.NombreCompañia,
                'cantidad_total_compras': cliente.CantidadTotalCompras,
                'total_dinero_compras': str(cliente.TotalDineroCompras),
                'comentario': cliente.ComentarioCliente,
                'telefono': cliente.TelefonoCliente,
                'fecha': cliente.FechaCliente.isoformat(),
                'usuario': {
                    'id': cliente.Usuario.id if cliente.Usuario else None,
                    'nombre': f"{cliente.Usuario.first_name} {cliente.Usuario.last_name}" if cliente.Usuario else "Usuario no disponible"
                },
                'fecha_registro': cliente.FechaRegistro.isoformat(),
                'ultima_modificacion': cliente.UltimaModificacion.isoformat()
            }
            clientes_data.append(cliente_data)

        return JsonResponse({
            'success': True,
            'clientes': clientes_data
        })

    except Exception as e:
        logger.error(f"Error al listar clientes: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@login_required(login_url='login')
@ensure_csrf_cookie
def actualizar_cliente(request, cliente_id):
    if request.method != 'POST':
        return JsonResponse({
            'success': False,
            'errors': {'general': 'Método no permitido'}
        }, status=405)

    try:
        cliente = get_object_or_404(Cliente, id=cliente_id)
        data = json.loads(request.body)

        campos_requeridos = {
            'nombre': 'Nombre del cliente',
            'apellido': 'Apellido del cliente',
            'rut': 'RUT del cliente',
            'tipo': 'Tipo de cliente'
        }

        errores = {}
        for campo, nombre in campos_requeridos.items():
            if campo not in data:
                errores[campo] = f'El campo {nombre} es requerido'

        if errores:
            return JsonResponse({
                'success': False,
                'errors': errores
            }, status=400)

        cliente.NombreCliente = data['nombre']
        cliente.ApellidoCliente = data['apellido']
        cliente.RutCliente = data['rut']
        cliente.TipoCliente = data['tipo']
        cliente.NombreCompañia = data.get('nombre_compania', '')
        cliente.ComentarioCliente = data.get('comentario', '')
        cliente.TelefonoCliente = data.get('telefono', '')

        cliente.save()

        return JsonResponse({
            'success': True,
            'message': 'Cliente actualizado exitosamente',
            'cliente': {
                'id': cliente.id,
                'nombre': cliente.NombreCliente,
                'apellido': cliente.ApellidoCliente,
                'rut': cliente.RutCliente,
                'tipo': cliente.TipoCliente,
                'nombre_compania': cliente.NombreCompañia,
                'comentario': cliente.ComentarioCliente,
                'telefono': cliente.TelefonoCliente,
                'cantidad_total_compras': cliente.CantidadTotalCompras,
                'total_dinero_compras': str(cliente.TotalDineroCompras)
            }
        })

    except ValidationError as e:
        return JsonResponse({
            'success': False,
            'errors': e.message_dict if hasattr(e, 'message_dict') else {'general': str(e)}
        }, status=400)
    except Exception as e:
        logger.error(f"Error al actualizar cliente: {str(e)}")
        return JsonResponse({
            'success': False,
            'errors': {'general': str(e)}
        }, status=500)

@login_required(login_url='login')
def exportar_clientes_excel(request):
    output = BytesIO()
    workbook = xlsxwriter.Workbook(output, {'remove_timezone': True})
    worksheet_data = workbook.add_worksheet('Clientes')
    worksheet_charts = workbook.add_worksheet('Gráficos')
    
    header_format = workbook.add_format({
        'bold': True,
        'bg_color': '#000000',
        'font_color': 'white',
        'border': 1
    })
    
    date_format = workbook.add_format({
        'num_format': 'dd/mm/yyyy',
    })
    
    headers = [
        'ID',
        'Nombre',
        'Apellido',
        'RUT',
        'Tipo',
        'Compañía',
        'Total Compras',
        'Total Dinero',
        'Teléfono',
        'Fecha Registro'
    ]
    
    for col, header in enumerate(headers):
        worksheet_data.write(0, col, header, header_format)
        worksheet_data.set_column(col, col, 15)
    
    clientes = Cliente.objects.all().order_by('NombreCliente')
    
    for row, cliente in enumerate(clientes, start=1):
        worksheet_data.write(row, 0, cliente.id)
        worksheet_data.write(row, 1, cliente.NombreCliente)
        worksheet_data.write(row, 2, cliente.ApellidoCliente)
        worksheet_data.write(row, 3, cliente.RutCliente)
        worksheet_data.write(row, 4, cliente.get_TipoCliente_display())
        worksheet_data.write(row, 5, cliente.NombreCompañia or '')
        worksheet_data.write(row, 6, cliente.CantidadTotalCompras)
        worksheet_data.write(row, 7, float(cliente.TotalDineroCompras))
        worksheet_data.write(row, 8, cliente.TelefonoCliente or '')
        worksheet_data.write_datetime(row, 9, timezone.localtime(cliente.FechaRegistro).replace(tzinfo=None), date_format)
    
    # Gráficos
    clientes_por_tipo = {}
    for cliente in clientes:
        tipo = cliente.get_TipoCliente_display()
        if tipo not in clientes_por_tipo:
            clientes_por_tipo[tipo] = {
                'cantidad': 0,
                'total_compras': 0
            }
        clientes_por_tipo[tipo]['cantidad'] += 1
        clientes_por_tipo[tipo]['total_compras'] += float(cliente.TotalDineroCompras)
    
    worksheet_charts.write_row('A1', ['Tipo Cliente', 'Cantidad', 'Total Compras'], header_format)
    
    for i, (tipo, datos) in enumerate(clientes_por_tipo.items(), start=2):
        worksheet_charts.write(f'A{i}', tipo)
        worksheet_charts.write(f'B{i}', datos['cantidad'])
        worksheet_charts.write(f'C{i}', datos['total_compras'])
    
    pie_chart = workbook.add_chart({'type': 'pie'})
    pie_chart.add_series({
        'name': 'Distribución de Clientes',
        'categories': f'=Gráficos!$A$2:$A${len(clientes_por_tipo)+1}',
        'values': f'=Gráficos!$B$2:$B${len(clientes_por_tipo)+1}',
        'data_labels': {'percentage': True},
    })
    pie_chart.set_title({'name': 'Distribución por Tipo de Cliente'})
    pie_chart.set_size({'width': 500, 'height': 300})
    worksheet_charts.insert_chart('E2', pie_chart)
    
    workbook.close()
    output.seek(0)
    
    filename = f'Clientes_{timezone.localtime().strftime("%Y%m%d_%H%M%S")}.xlsx'
    response = HttpResponse(
        output.read(),
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    
    return response


@login_required(login_url='login')
@ensure_csrf_cookie
def eliminar_cliente(request, cliente_id):
    if request.method == 'POST':
        try:
            with transaction.atomic():
                cliente = get_object_or_404(Cliente, id=cliente_id)
                
                # Marcar las ventas del cliente como eliminado
                Ventas.objects.filter(cliente=cliente).update(
                    cliente=None,
                    cliente_eliminado=True
                )
                
                # Eliminar el cliente
                cliente.delete()

                return JsonResponse({
                    'success': True,
                    'message': 'Cliente eliminado exitosamente.'
                })

        except Exception as e:
            logger.error(f"Error al eliminar cliente: {str(e)}")
            return JsonResponse({
                'success': False,
                'errors': str(e)
            }, status=500)

    return JsonResponse({
        'success': False,
        'errors': 'Método no permitido'
    }, status=405)
    
@login_required(login_url='login')
@ensure_csrf_cookie
def crear_cliente(request):
   if request.method == 'POST':
       try:
           data = json.loads(request.body)
           
           # Validar campos requeridos
           required_fields = {
               'nombre': data.get('nombre'),
               'apellido': data.get('apellido'),
               'rut': data.get('rut'),
               'tipo': data.get('tipo')
           }

           if not all(required_fields.values()):
               return JsonResponse({
                   'success': False,
                   'errors': 'Todos los campos son requeridos'
               }, status=400)

           # Validar que no exista otro cliente con el mismo nombre
           if Cliente.objects.filter(NombreCliente=data['nombre'], ApellidoCliente=data['apellido']).exists():
               return JsonResponse({
                   'success': False,
                   'errors': 'Ya existe un cliente con este nombre y apellido'
               }, status=400)

           # Validar que no exista otro cliente con el mismo RUT
           if Cliente.objects.filter(RutCliente=data['rut']).exists():
               return JsonResponse({
                   'success': False,
                   'errors': 'Ya existe un cliente con este RUT'
               }, status=400)

           cliente = Cliente.objects.create(
               NombreCliente=data['nombre'],
               ApellidoCliente=data['apellido'],
               RutCliente=data['rut'],
               TipoCliente=data['tipo'],
               NombreCompañia=data.get('nombre_compania', ''),
               TelefonoCliente=data.get('telefono', ''),
               ComentarioCliente=data.get('comentario', ''),
               Usuario=request.user
           )

           return JsonResponse({
               'success': True,
               'message': 'Cliente creado exitosamente',
               'cliente': {
                   'id': cliente.id,
                   'nombre': cliente.NombreCliente,
                   'apellido': cliente.ApellidoCliente,
                   'rut': cliente.RutCliente
               }
           })

       except Exception as e:
           return JsonResponse({
               'success': False,
               'errors': str(e)
           }, status=500)

   return JsonResponse({'success': False, 'errors': 'Método no permitido'}, status=405)


#-----------RUTA PARA CLIENTE---------
@login_required
def mod_administrador(request):
    return render(request, 'usuario/administrador.html')

@login_required
def listar_administradores(request):
    try:
        administradores = Usuario.objects.filter(TipoUsuario='Administrador').select_related('user')
        data = [{
            'id': admin.id,
            'user_id': admin.user.id,
            'username': admin.user.username,
            'email': admin.user.email,
            'rut': admin.RutUsuario,
            'telefono': admin.TelefonoUsuario,
            'edad': admin.EdadUsuario,
            'foto': str(admin.FotoUsuario.url) if admin.FotoUsuario else None,
        } for admin in administradores]
        return JsonResponse({'administradores': data})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@login_required(login_url='login')
@ensure_csrf_cookie 
def crear_administrador(request):
    if request.method == 'POST':
        data = request.POST
        user = None
        
        try:
            # Validar campos requeridos
            campos_requeridos = ['username', 'email', 'password', 'RutUsuario']
            errores = {campo: f'El campo {campo} es requerido' 
                      for campo in campos_requeridos if not data.get(campo)}
            
            if errores:
                return JsonResponse({'success': False, 'errors': errores}, status=400)

            # Validar RUT
            rut = data.get('RutUsuario')
            if not re.match(r'^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9kK]$', rut):
                return JsonResponse({
                    'success': False, 
                    'errors': {'RutUsuario': 'RUT debe tener formato XX.XXX.XXX-X'}
                }, status=400)

            # Validar si ya existe el usuario
            if User.objects.filter(username=data.get('username')).exists():
                return JsonResponse({
                    'success': False,
                    'errors': {'username': 'Este nombre de usuario ya existe'}
                }, status=400)

            if User.objects.filter(email=data.get('email')).exists():
                return JsonResponse({
                    'success': False,
                    'errors': {'email': 'Este email ya está registrado'}
                }, status=400)

            # Crear usuario base
            user = User.objects.create_user(
                username=data.get('username'),
                email=data.get('email'),
                password=data.get('password')
            )
            
            # Crear perfil de administrador
            nuevo_admin = Usuario(
                user=user,
                RutUsuario=rut,
                TipoUsuario='Administrador',
                EdadUsuario=data.get('EdadUsuario'),
                TelefonoUsuario=data.get('TelefonoUsuario')
            )

            # Procesar foto si existe
            if 'FotoUsuario' in request.FILES:
                foto = request.FILES['FotoUsuario']
                if foto.content_type not in ALLOWED_FILE_TYPES:
                    user.delete()
                    return JsonResponse({
                        'success': False,
                        'errors': {'FotoUsuario': 'Formato no válido. Solo se permiten imágenes en formato JPEG, PNG o GIF'}
                    }, status=400)
                nuevo_admin.FotoUsuario = foto

            # Validar y guardar
            nuevo_admin.full_clean()
            nuevo_admin.save()

            return JsonResponse({
                'success': True,
                'message': 'Administrador creado exitosamente',
                'administrador': {
                    'id': nuevo_admin.id,
                    'user_id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'rut': nuevo_admin.RutUsuario,
                    'edad': nuevo_admin.EdadUsuario,
                    'telefono': nuevo_admin.TelefonoUsuario,
                    'foto': nuevo_admin.FotoUsuario.url if nuevo_admin.FotoUsuario else None,
                    'tipo_usuario': nuevo_admin.TipoUsuario
                }
            })

        except ValidationError as e:
            if user:
                user.delete()
            return JsonResponse({
                'success': False, 
                'errors': e.message_dict
            }, status=400)
            
        except Exception as e:
            if user:
                user.delete()
            return JsonResponse({
                'success': False,
                'errors': {'general': f'Error al crear administrador: {str(e)}'}
            }, status=500)

    return JsonResponse({
        'success': False,
        'errors': {'general': 'Método no permitido'}
    }, status=405)
    
@login_required(login_url='login')
@ensure_csrf_cookie
def actualizar_administrador(request, administrador_id):
    if request.method in ['PUT', 'POST']:
        try:
            admin = get_object_or_404(Usuario, id=administrador_id, TipoUsuario='Administrador')
            data = request.POST
            
            campos_requeridos = ['username', 'email', 'RutUsuario']
            errores = {campo: f'El campo {campo} es requerido' 
                      for campo in campos_requeridos if not data.get(campo)}
            
            if errores:
                return JsonResponse({'success': False, 'errors': errores}, status=400)
            
            # Validar RUT
            rut = data.get('RutUsuario').upper()
            if not re.match(r'^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9kK]$', rut):
                return JsonResponse({
                    'success': False,
                    'errors': {'RutUsuario': 'RUT debe tener formato XX.XXX.XXX-X'}
                }, status=400)

            # Validar email único
            if Usuario.objects.filter(user__email=data.get('email')).exclude(id=administrador_id).exists():
                return JsonResponse({
                    'success': False,
                    'errors': {'email': 'Este email ya está registrado'}
                }, status=400)

            if 'FotoUsuario' in request.FILES:
                foto = request.FILES['FotoUsuario']
                if foto.content_type not in ['image/jpeg', 'image/png', 'image/gif']:
                    return JsonResponse({
                        'success': False,
                        'errors': {'FotoUsuario': 'Formato de imagen no válido'}
                    }, status=400)

                if admin.FotoUsuario:
                    try:
                        url = admin.FotoUsuario.url
                        parts = url.split('/')
                        public_id = f"{parts[-2]}/{parts[-1].split('.')[0]}"
                        
                        cloudinary.config(
                            cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
                            api_key=os.getenv('CLOUDINARY_API_KEY'),
                            api_secret=os.getenv('CLOUDINARY_API_SECRET')
                        )
                        
                        cloudinary.uploader.destroy(
                            public_id,
                            resource_type="image",
                            type="upload",
                            invalidate=True
                        )
                    except Exception as e:
                        print(f"Error eliminando imagen: {str(e)}")
                
                admin.FotoUsuario = foto

            # Actualizar usuario base
            admin.user.username = data.get('username')
            admin.user.email = data.get('email')
            if data.get('password'):
                admin.user.set_password(data.get('password'))
            admin.user.save()

            # Actualizar administrador
            admin.RutUsuario = rut
            admin.TelefonoUsuario = data.get('TelefonoUsuario')
            admin.EdadUsuario = data.get('EdadUsuario')

            admin.full_clean()
            admin.save()

            return JsonResponse({
                'success': True,
                'message': 'Administrador actualizado exitosamente',
                'administrador': {
                    'id': admin.id,
                    'username': admin.user.username,
                    'email': admin.user.email,
                    'rut': admin.RutUsuario,
                    'telefono': admin.TelefonoUsuario,
                    'edad': admin.EdadUsuario,
                    'foto': admin.FotoUsuario.url if admin.FotoUsuario else None
                }
            })

        except Exception as e:
            return JsonResponse({
                'success': False,
                'errors': {'general': f'Error: {str(e)}'}
            }, status=400)

    return JsonResponse({
        'success': False,
        'errors': {'general': 'Método no permitido'}
    }, status=405)

@login_required(login_url='login')
@ensure_csrf_cookie
def eliminar_administrador(request, administrador_id):
    if request.method == 'DELETE':
        try:
            admin = get_object_or_404(Usuario, id=administrador_id, TipoUsuario='Administrador')
            username = admin.user.username

            if admin.FotoUsuario:
                try:
                    url = admin.FotoUsuario.url
                    parts = url.split('/')
                    public_id = f"{parts[-2]}/{parts[-1].split('.')[0]}"

                    cloudinary.config(
                        cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
                        api_key=os.getenv('CLOUDINARY_API_KEY'),
                        api_secret=os.getenv('CLOUDINARY_API_SECRET')
                    )

                    cloudinary.uploader.destroy(
                        public_id,
                        resource_type="image",
                        type="upload"
                    )
                except Exception as e:
                    print(f"Error eliminando imagen: {str(e)}")

            admin.user.delete()  # Eliminará en cascada el perfil de Usuario

            return JsonResponse({
                'success': True,
                'message': f'Administrador {username} eliminado exitosamente'
            })

        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'Error: {str(e)}'
            }, status=500)

    return JsonResponse({
        'success': False,
        'message': 'Método no permitido'
    }, status=405)
    

def exportar_administradores_excel(request):
   output = BytesIO()
   workbook = xlsxwriter.Workbook(output, {'remove_timezone': True})
   
   # Formatos
   header_format = workbook.add_format({
       'bold': True,
       'bg_color': '#000000',
       'font_color': 'white',
       'border': 1
   })
   
   date_format = workbook.add_format({'num_format': 'dd/mm/yyyy'})
   
   # Hoja principal de datos
   worksheet_data = workbook.add_worksheet('Administradores')
   
   # Encabezados ampliados para incluir ventas
   headers = [
       'ID',
       'Username', 
       'Email',
       'RUT',
       'Teléfono',
       'Edad',
       'Fecha Registro',
       'Última Modificación',
       'Clientes Registrados',
       'Pérdidas Registradas',
       'Ventas Registradas',
       'Total Ventas ($)',
       'Total Pérdidas ($)',
       'Promedio por Venta ($)',
       'Promedio por Pérdida ($)'
   ]
   
   # Escribir encabezados
   for col, header in enumerate(headers):
       worksheet_data.write(0, col, header, header_format)
       worksheet_data.set_column(col, col, 15)
   
   # Obtener datos
   administradores = Usuario.objects.filter(TipoUsuario='Administrador').select_related('user')
   
   # Escribir datos
   for row, admin in enumerate(administradores, start=1):
       clientes = Cliente.objects.filter(Usuario=admin.user)
       perdidas = Perdidas.objects.filter(Usuario=admin.user)
       ventas = Ventas.objects.filter(Usuario=admin.user)
       
       # Calcular totales y promedios
       total_ventas = sum(v.PrecioTotalVenta for v in ventas)
       total_perdidas = sum(p.ValorTotalPerdida for p in perdidas)
       promedio_venta = total_ventas / ventas.count() if ventas.count() > 0 else 0
       promedio_perdida = total_perdidas / perdidas.count() if perdidas.count() > 0 else 0
       
       worksheet_data.write(row, 0, admin.id)
       worksheet_data.write(row, 1, admin.user.username)
       worksheet_data.write(row, 2, admin.user.email)
       worksheet_data.write(row, 3, admin.RutUsuario)
       worksheet_data.write(row, 4, admin.TelefonoUsuario or '')
       worksheet_data.write(row, 5, admin.EdadUsuario or '')
       worksheet_data.write_datetime(row, 6, timezone.localtime(admin.user.date_joined).replace(tzinfo=None), date_format)
       worksheet_data.write_datetime(row, 7, timezone.localtime(admin.user.last_login).replace(tzinfo=None), date_format) if admin.user.last_login else worksheet_data.write(row, 7, '')
       worksheet_data.write(row, 8, clientes.count())
       worksheet_data.write(row, 9, perdidas.count())
       worksheet_data.write(row, 10, ventas.count())
       worksheet_data.write(row, 11, float(total_ventas))
       worksheet_data.write(row, 12, float(total_perdidas))
       worksheet_data.write(row, 13, float(promedio_venta))
       worksheet_data.write(row, 14, float(promedio_perdida))
   
   # Hoja de estadísticas
   worksheet_stats = workbook.add_worksheet('Estadísticas')
   
   # Datos para estadísticas
   estadisticas = {
       'total_admins': administradores.count(),
       'promedio_edad': administradores.filter(EdadUsuario__isnull=False).aggregate(Avg('EdadUsuario'))['EdadUsuario__avg'] or 0,
       'clientes_por_admin': {},
       'perdidas_por_admin': {},
       'ventas_por_admin': {},
       'total_ventas_por_admin': {},
       'total_perdidas_por_admin': {}
   }
   
   for admin in administradores:
       username = admin.user.username
       ventas = Ventas.objects.filter(Usuario=admin.user)
       perdidas = Perdidas.objects.filter(Usuario=admin.user)
       
       estadisticas['clientes_por_admin'][username] = Cliente.objects.filter(Usuario=admin.user).count()
       estadisticas['perdidas_por_admin'][username] = perdidas.count()
       estadisticas['ventas_por_admin'][username] = ventas.count()
       estadisticas['total_ventas_por_admin'][username] = sum(v.PrecioTotalVenta for v in ventas)
       estadisticas['total_perdidas_por_admin'][username] = sum(p.ValorTotalPerdida for p in perdidas)
   
   # Escribir estadísticas generales
   worksheet_stats.write('A1', 'Estadísticas Generales', header_format)
   worksheet_stats.write('A2', 'Total Administradores')
   worksheet_stats.write('B2', estadisticas['total_admins'])
   worksheet_stats.write('A3', 'Promedio de Edad')
   worksheet_stats.write('B3', round(estadisticas['promedio_edad'], 2))
   
   # Datos para gráficos
   worksheet_stats.write('A5', 'Administrador', header_format)
   worksheet_stats.write('B5', 'Clientes Registrados', header_format)
   worksheet_stats.write('C5', 'Pérdidas Registradas', header_format)
   worksheet_stats.write('D5', 'Ventas Registradas', header_format)
   worksheet_stats.write('E5', 'Total Ventas ($)', header_format)
   worksheet_stats.write('F5', 'Total Pérdidas ($)', header_format)
   
   row = 6
   for username in estadisticas['clientes_por_admin'].keys():
       worksheet_stats.write(f'A{row}', username)
       worksheet_stats.write(f'B{row}', estadisticas['clientes_por_admin'][username])
       worksheet_stats.write(f'C{row}', estadisticas['perdidas_por_admin'][username])
       worksheet_stats.write(f'D{row}', estadisticas['ventas_por_admin'][username])
       worksheet_stats.write(f'E{row}', float(estadisticas['total_ventas_por_admin'][username]))
       worksheet_stats.write(f'F{row}', float(estadisticas['total_perdidas_por_admin'][username]))
       row += 1
   
   # Gráficos
   # Gráfico de clientes
   chart_clientes = workbook.add_chart({'type': 'column'})
   chart_clientes.add_series({
       'name': 'Clientes Registrados',
       'categories': f'=Estadísticas!$A$6:$A${row-1}',
       'values': f'=Estadísticas!$B$6:$B${row-1}',
       'data_labels': {'value': True}
   })
   chart_clientes.set_title({'name': 'Clientes Registrados por Administrador'})
   chart_clientes.set_size({'width': 500, 'height': 300})
   worksheet_stats.insert_chart('H2', chart_clientes)
   
   # Gráfico de pérdidas
   chart_perdidas = workbook.add_chart({'type': 'column'})
   chart_perdidas.add_series({
       'name': 'Pérdidas Registradas',
       'categories': f'=Estadísticas!$A$6:$A${row-1}',
       'values': f'=Estadísticas!$C$6:$C${row-1}',
       'data_labels': {'value': True}
   })
   chart_perdidas.set_title({'name': 'Pérdidas Registradas por Administrador'})
   chart_perdidas.set_size({'width': 500, 'height': 300})
   worksheet_stats.insert_chart('H18', chart_perdidas)
   
   # Gráfico de ventas
   chart_ventas = workbook.add_chart({'type': 'column'})
   chart_ventas.add_series({
       'name': 'Ventas Registradas',
       'categories': f'=Estadísticas!$A$6:$A${row-1}',
       'values': f'=Estadísticas!$D$6:$D${row-1}',
       'data_labels': {'value': True}
   })
   chart_ventas.set_title({'name': 'Ventas Registradas por Administrador'})
   chart_ventas.set_size({'width': 500, 'height': 300})
   worksheet_stats.insert_chart('H34', chart_ventas)
   
   workbook.close()
   
   # Preparar respuesta
   output.seek(0)
   filename = f'Administradores_{timezone.localtime().strftime("%Y%m%d_%H%M%S")}.xlsx'
   
   response = HttpResponse(
       output.read(),
       content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
   )
   response['Content-Disposition'] = f'attachment; filename="{filename}"'
   
   return response