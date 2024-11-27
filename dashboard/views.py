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

# Excel imports
import xlsxwriter
from django.http import JsonResponse


# Local imports
from .models import Proveedor, Factura, Envio, Material, Herramienta, Producto, ProductoMaterial, Categoria
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
            
            # Solo validamos los campos requeridos según el modelo
            campos_requeridos = ['NombreMaterial', 'StockMaterial', 'PrecioMaterial']
            errores = {}
            
            for campo in campos_requeridos:
                if not data.get(campo):
                    errores[campo] = f'El campo {campo} es requerido'
            
            if errores:
                return JsonResponse({'success': False, 'errors': errores}, status=400)

            # Validación y conversión de campos numéricos
            try:
                stock_material = int(data.get('StockMaterial'))
                if stock_material < 0:  # PositiveIntegerField validation
                    raise ValueError('El stock no puede ser negativo')
            except ValueError:
                return JsonResponse({
                    'success': False,
                    'errors': {'StockMaterial': 'El stock debe ser un número entero no negativo'}
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
            material.StockMaterial = stock_material
            material.PrecioMaterial = precio_material
            material.TotalMaterial = stock_material * precio_material
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
                    # Obtener la URL de la imagen
                    url = material.FotoMaterial.url
                    
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
                # Preparar datos del proveedor de forma simplificada
                proveedor_data = None
                if material.Proveedor:
                    proveedor_data = {
                        'id': material.Proveedor.id,
                        'NombreProveedor': material.Proveedor.NombreProveedor
                    }

                # Solo incluimos los campos solicitados
                data.append({
                    'id': material.id,
                    'NombreMaterial': material.NombreMaterial,
                    'StockMaterial': material.StockMaterial,
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
        # Obtener todos los productos con sus categorías relacionadas
        productos = Producto.objects.select_related('Categoria').order_by('-FechaProducto')
        
        # Lista para almacenar los datos formateados
        productos_data = []
        
        for producto in productos:
            productos_data.append({
                'id': producto.id,
                'FotoProducto': producto.FotoProducto.url if producto.FotoProducto else None,
                'NombreProducto': producto.NombreProducto,
                'StockProductoActual': producto.StockProductoActual,
                'PrecioUnitarioProducto': str(producto.PrecioUnitarioProducto),
                'PrecioTotalProducto': str(producto.PrecioTotalProducto),
                'Categoria': {
                    'id': producto.Categoria.id,
                    'NombreCategoria': producto.Categoria.NombreCategoria
                },
                'CantidadProductoVendido': producto.CantidadProductoVendido,
                'CantidadProductoDesechado': producto.CantidadProductoDesechado,
                'FechaProducto': producto.FechaProducto.strftime('%Y-%m-%d'),
                'DiasProducto': producto.DiasProducto
            })

        return JsonResponse({
            'success': True,
            'productos': productos_data
        })

    except Exception as e:
        logger.error(f"Error al listar productos: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': f'Error al obtener los productos: {str(e)}'
        }, status=500)
@login_required(login_url='login')
@ensure_csrf_cookie
def actualizar_producto(request, producto_id):
    if request.method in ['PUT', 'POST']:
        try:
            producto = get_object_or_404(Producto, id=producto_id)
            data = request.POST
            
            # Debug: Imprimir todos los datos recibidos
            print("Datos recibidos:", dict(data))
            
            # Validar campos requeridos
            campos_requeridos = ['NombreProducto', 'StockProductoInicial', 'PrecioUnitarioProducto', 'Categoria']
            errores = {}
            
            for campo in campos_requeridos:
                if not data.get(campo):
                    errores[campo] = f'El campo {campo} es requerido'
            
            if errores:
                return JsonResponse({'success': False, 'errors': errores}, status=400)

            # Validación de campos numéricos
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

            # Manejar la foto
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
                    
                    result = cloudinary.uploader.destroy(
                        public_id,
                        resource_type="image",
                        type="upload",
                        invalidate=True
                    )
                    print(f"Resultado de eliminación foto: {result}")
                    
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
                        'errors': {'FotoProducto': 'El archivo es demasiado grande. El tamaño máximo permitido es 10MB'}
                    }, status=400)
                
                if foto.content_type not in ALLOWED_FILE_TYPES:
                    return JsonResponse({
                        'success': False,
                        'errors': {'FotoProducto': 'Formato no válido. Formatos permitidos: JPG, PNG, GIF, BMP, WEBP, TIFF, SVG'}
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

            # Actualizar campos del producto
            producto.NombreProducto = data.get('NombreProducto')
            producto.StockProductoInicial = stock_inicial
            producto.PrecioUnitarioProducto = precio_unitario
            producto.Categoria = categoria
            producto.DescripcionProducto = data.get('DescripcionProducto', '')
            producto.UbicacionProducto = data.get('UbicacionProducto', '')
            producto.EstadoProducto = data.get('EstadoProducto', '')

            # Actualizar materiales
            if data.get('materiales'):
                materiales_data = json.loads(data.get('materiales'))
                # Eliminar materiales existentes
                ProductoMaterial.objects.filter(Producto=producto).delete()
                
                for material_data in materiales_data:
                    try:
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
                            'errors': {'materiales': f'Error con el material: {str(e)}'}
                        }, status=400)

            try:
                producto.full_clean()
                producto.save()
            except ValidationError as e:
                errores_formateados = {campo: errores[0] if errores else str(errores) 
                                     for campo, errores in e.message_dict.items()}
                return JsonResponse({'success': False, 'errors': errores_formateados}, status=400)

            # Obtener materiales actualizados
            materiales_actualizados = [
                {
                    'id': pm.id,
                    'material': {
                        'id': pm.Material.id,
                        'nombre': pm.Material.NombreMaterial
                    },
                    'cantidad': pm.CantidadUsada,
                    'descripcion': pm.DescripcionUso
                }
                for pm in producto.materiales_usados.select_related('Material').all()
            ]

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
                    'ProductoVendido': producto.ProductoVendido,
                    'CantidadProductoVendido': producto.CantidadProductoVendido,
                    'CantidadProductoDesechado': producto.CantidadProductoDesechado,
                    'porcentaje_stock_disponible': producto.porcentaje_stock_disponible,
                    'FotoProducto': producto.FotoProducto.url if producto.FotoProducto else None,
                    'Categoria': {
                        'id': categoria.id,
                        'NombreCategoria': categoria.NombreCategoria
                    },
                    'materiales': materiales_actualizados
                }
            })
            
        except Exception as e:
            print(f"Error general: {str(e)}")
            return JsonResponse({
                'success': False,
                'errors': {'general': f'Error al actualizar el producto: {str(e)}'}
            }, status=400)

    return JsonResponse({
        'success': False,
        'errors': {'general': 'Método no permitido'}
    }, status=405)
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
    worksheet_data = workbook.add_worksheet('Productos')
    worksheet_materiales = workbook.add_worksheet('Materiales Usados')
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

    # Definir encabezados para la hoja de productos
    headers = [
        'ID',
        'Nombre Producto',
        'Stock Inicial',
        'Stock Actual',
        'Precio Unitario',
        'Precio Total',
        'Categoría',
        'Cantidad Vendida',
        'Cantidad Desechada',
        'Fecha Creación',
        'Días Transcurridos',
        'Estado',
        'Ubicación',
        '% Stock Disponible'
    ]
    
    # Escribir encabezados en hoja de datos
    for col, header in enumerate(headers):
        worksheet_data.write(0, col, header, header_format)
        worksheet_data.set_column(col, col, 15)

    # Obtener datos de productos
    productos = Producto.objects.all().select_related('Categoria').prefetch_related('materiales_usados__Material')

    # Escribir datos de productos
    for row, producto in enumerate(productos, start=1):
        worksheet_data.write(row, 0, producto.id)
        worksheet_data.write(row, 1, producto.NombreProducto)
        worksheet_data.write(row, 2, producto.StockProductoInicial)
        worksheet_data.write(row, 3, producto.StockProductoActual)
        worksheet_data.write(row, 4, float(producto.PrecioUnitarioProducto))
        worksheet_data.write(row, 5, float(producto.PrecioTotalProducto))
        worksheet_data.write(row, 6, producto.Categoria.NombreCategoria)
        worksheet_data.write(row, 7, producto.CantidadProductoVendido)
        worksheet_data.write(row, 8, producto.CantidadProductoDesechado)
        worksheet_data.write_datetime(row, 9, producto.FechaProducto, date_format)
        worksheet_data.write(row, 10, producto.DiasProducto)
        worksheet_data.write(row, 11, producto.EstadoProducto or 'No especificado')
        worksheet_data.write(row, 12, producto.UbicacionProducto or 'No especificada')
        worksheet_data.write(row, 13, producto.porcentaje_stock_disponible)

    # Escribir datos de materiales usados
    materiales_headers = ['ID Producto', 'Nombre Producto', 'Material', 'Cantidad Usada', 'Descripción Uso']
    for col, header in enumerate(materiales_headers):
        worksheet_materiales.write(0, col, header, header_format)
        worksheet_materiales.set_column(col, col, 20)

    row_materiales = 1
    for producto in productos:
        for material in producto.materiales_usados.all():
            worksheet_materiales.write(row_materiales, 0, producto.id)
            worksheet_materiales.write(row_materiales, 1, producto.NombreProducto)
            worksheet_materiales.write(row_materiales, 2, material.Material.NombreMaterial)
            worksheet_materiales.write(row_materiales, 3, material.CantidadUsada)
            worksheet_materiales.write(row_materiales, 4, material.DescripcionUso or '')
            row_materiales += 1

    # Preparar datos para los gráficos
    categorias_dict = {}
    estados_dict = {}
    for producto in productos:
        # Conteo por categoría
        categoria = producto.Categoria.NombreCategoria
        categorias_dict[categoria] = categorias_dict.get(categoria, 0) + 1
        
        # Conteo por estado
        estado = producto.EstadoProducto or 'No especificado'
        estados_dict[estado] = estados_dict.get(estado, 0) + 1

    # Escribir datos para gráficos
    worksheet_charts.write_row('A1', ['Categoría', 'Cantidad'], header_format)
    for i, (categoria, cantidad) in enumerate(categorias_dict.items(), start=2):
        worksheet_charts.write(f'A{i}', categoria)
        worksheet_charts.write(f'B{i}', cantidad)

    worksheet_charts.write_row('D1', ['Estado', 'Cantidad'], header_format)
    for i, (estado, cantidad) in enumerate(estados_dict.items(), start=2):
        worksheet_charts.write(f'D{i}', estado)
        worksheet_charts.write(f'E{i}', cantidad)

    # Crear gráficos
    # 1. Gráfico de columnas (Productos por Categoría)
    column_chart = workbook.add_chart({'type': 'column'})
    column_chart.add_series({
        'name': 'Productos por Categoría',
        'categories': f'=Gráficos!$A$2:$A${len(categorias_dict)+1}',
        'values': f'=Gráficos!$B$2:$B${len(categorias_dict)+1}',
        'data_labels': {'value': True},
    })
    column_chart.set_title({'name': 'Distribución de Productos por Categoría'})
    column_chart.set_size({'width': 500, 'height': 300})
    worksheet_charts.insert_chart('G2', column_chart)

    # 2. Gráfico de pie (Estados de Productos)
    pie_chart = workbook.add_chart({'type': 'pie'})
    pie_chart.add_series({
        'name': 'Estados de Productos',
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
    filename = f'Productos_{timezone.localtime().strftime("%Y%m%d_%H%M%S")}.xlsx'
    
    response = HttpResponse(
        output.read(),
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    
    return response
@login_required(login_url='login')
def obtener_detalles_producto(request, producto_id):
    if request.method == 'GET':
        try:
            producto = Producto.objects.select_related('Categoria').get(id=producto_id)
            
            data = {
                # Campos básicos
                'id': producto.id,
                'NombreProducto': producto.NombreProducto,
                
                # Campos de stock
                'StockProductoInicial': producto.StockProductoInicial,
                'StockProductoActual': producto.StockProductoActual,
                'PrecioUnitarioProducto': str(producto.PrecioUnitarioProducto),
                'PrecioTotalProducto': str(producto.PrecioTotalProducto),
                'porcentaje_stock_disponible': producto.porcentaje_stock_disponible,
                
                # Campos de control de stock
                'CantidadProductoVendido': producto.CantidadProductoVendido,
                'CantidadProductoDesechado': producto.CantidadProductoDesechado,
                
                # Campos descriptivos
                'DescripcionProducto': producto.DescripcionProducto or "Sin descripción",
                'UbicacionProducto': producto.UbicacionProducto or "No especificada",
                'EstadoProducto': producto.EstadoProducto or "No especificado",
                
                # Campos de tiempo
                'FechaProducto': producto.FechaProducto.isoformat() if producto.FechaProducto else None,
                'DiasProducto': producto.DiasProducto,
                'HoraCreacion': producto.HoraCreacion.isoformat() if producto.HoraCreacion else None,
                
                # Estado de venta
                'ProductoVendido': producto.ProductoVendido,
                
                # Campos multimedia
                'FotoProducto': producto.FotoProducto.url if producto.FotoProducto else None,
                
                # Relaciones
                'Categoria': {
                    'id': producto.Categoria.id,
                    'NombreCategoria': producto.Categoria.NombreCategoria,
                    'DescripcionCategoria': producto.Categoria.DescripcionCategoria or "Sin descripción",
                    'StockCategoria': producto.Categoria.StockCategoria
                } if producto.Categoria else None
            }

            return JsonResponse({
                'success': True,
                'producto': data
            })
            
        except Producto.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Producto no encontrado'
            }, status=404)
        except Exception as e:
            logger.error(f"Error al obtener detalles del producto: {str(e)}")
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=500)
            
    return JsonResponse({
        'success': False, 
        'message': 'Método no permitido'
    }, status=405)