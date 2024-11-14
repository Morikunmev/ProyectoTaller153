import json
import logging
import os
import re
import requests
from datetime import datetime
from io import BytesIO
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

# Excel imports
import xlsxwriter

# Local imports
from .models import Proveedor, Factura
from login.models import Usuario
from django.http import FileResponse, HttpResponse
from django.shortcuts import get_object_or_404
import requests
from urllib.parse import urlparse
import os
import mimetypes

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
    worksheet = workbook.add_worksheet('Facturas')
    
    # Agregar formatos
    header_format = workbook.add_format({
        'bold': True,
        'bg_color': '#000000',
        'font_color': 'white',
        'border': 1
    })
    
    date_format = workbook.add_format({
        'num_format': 'dd/mm/yyyy',  # Solo fecha sin hora para FechaEmision
    })
    
    # Definir encabezados
    headers = [
        'Fecha Emisión', 
        'Nombre Proveedor', 
        'RUT Proveedor', 
        'Marca Proveedor'
    ]
    
    # Escribir encabezados
    for col, header in enumerate(headers):
        worksheet.write(0, col, header, header_format)
        worksheet.set_column(col, col, 15)  # Establecer ancho de columna
    
    # Obtener datos de facturas con sus proveedores relacionados
    facturas = Factura.objects.all().select_related('Proveedor').order_by('-FechaEmision')
    
    # Escribir datos
    for row, factura in enumerate(facturas, start=1):
        worksheet.write_datetime(row, 0, factura.FechaEmision, date_format)
        worksheet.write(row, 1, factura.Proveedor.NombreProveedor)
        worksheet.write(row, 2, factura.Proveedor.RutProveedor)
        worksheet.write(row, 3, factura.Proveedor.MarcaProveedor)

    # Ajustar anchos de columna automáticamente basado en el contenido
    for col, header in enumerate(headers):
        worksheet.set_column(col, col, len(header) + 2)
    
    workbook.close()
    
    # Preparar la respuesta
    output.seek(0)
    
    # Generar nombre del archivo con la fecha actual
    filename = f'Facturas_{timezone.localtime().strftime("%Y%m%d_%H%M%S")}.xlsx'
    
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
            
            # Validaciones de campos requeridos
            campos_requeridos = ['FechaEmision', 'Proveedor']
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
            
            nueva_factura = Factura(
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
            facturas = Factura.objects.all().select_related('Proveedor')
            data = []
            for factura in facturas:
                data.append({
                    'id': factura.id,
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
                'message': f'Factura del {fecha_emision} del proveedor {nombre_proveedor} y sus archivos asociados fueron eliminados exitosamente'
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
            
            campos_requeridos = ['FechaEmision', 'Proveedor']
            errores = {}
            
            for campo in campos_requeridos:
                if not data.get(campo):
                    errores[campo] = f'El campo {campo} es requerido'
            
            if errores:
                return JsonResponse({'success': False, 'errors': errores}, status=400)
            
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