from django.shortcuts import render, redirect
from django.contrib.auth import logout as auth_logout
from django.contrib.auth.decorators import login_required  # Importa el decorador
from django.http import JsonResponse # Importa JsonResponse para enviar respuestas JSON en vistas de Django.
from django.views.decorators.csrf import csrf_exempt #Importa el decorador csrf_exempt para deshabilitar la verificación CSRF en una vista específica.
import json #Importa la biblioteca json para trabajar con datos en formato JSON.
from .models import Proveedor
from django.core.exceptions import ValidationError #Importa ValidationError, que se usa para manejar errores de validacion en los modelos de Django
from django.views.decorators.csrf import ensure_csrf_cookie
from django.db import IntegrityError
from django.shortcuts import render, redirect, get_object_or_404
import cloudinary
import cloudinary.uploader
from cloudinary_storage.storage import MediaCloudinaryStorage
import os





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
            
            # Verificar si ya existe un proveedor con el mismo nombre
            if Proveedor.objects.filter(NombreProveedor=data.get('NombreProveedor')).exists():
                return JsonResponse({
                    'success': False,
                    'errors': {
                        'NombreProveedor': 'Este nombre de proveedor ya existe'
                    }
                }, status=400)
            
            # Verificar si ya existe un proveedor con el mismo RUT
            if Proveedor.objects.filter(RutProveedor=data.get('RutProveedor')).exists():
                return JsonResponse({
                    'success': False,
                    'errors': {
                        'RutProveedor': 'Este RUT ya existe'
                    }
                }, status=400)
            
            # Verificar si ya existe un proveedor con la misma marca
            if Proveedor.objects.filter(MarcaProveedor=data.get('MarcaProveedor')).exists():
                return JsonResponse({
                    'success': False,
                    'errors': {
                        'MarcaProveedor': 'Esta marca ya existe'
                    }
                }, status=400)
            
            # Si no hay duplicados, crear el proveedor
            nuevo_proveedor = Proveedor(
                NombreProveedor=data.get('NombreProveedor'),
                RutProveedor=data.get('RutProveedor'),
                MarcaProveedor=data.get('MarcaProveedor'),
                ComentarioProveedor=data.get('ComentarioProveedor'),
                CiudadProveedor=data.get('CiudadProveedor'),
                RegionProveedor=data.get('RegionProveedor'),
                PaisProveedor=data.get('PaisProveedor'),
                TelefonoProveedor=data.get('TelefonoProveedor')
            )
            
            # Manejar la foto si existe
            if 'FotoProveedor' in request.FILES:
                foto = request.FILES['FotoProveedor']
                nuevo_proveedor.FotoProveedor = foto
            
            # Validar el modelo
            try:
                nuevo_proveedor.full_clean()
            except ValidationError as e:
                # Formatear errores de validación con la misma estructura
                errores_formateados = {}
                for campo, errores in e.message_dict.items():
                    # Convertir lista de errores a un solo string
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
                }
            })
            
        except Exception as e:
            # Manejar otros errores inesperados
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
                    'FotoProveedor': proveedor.FotoProveedor.url if proveedor.FotoProveedor else None
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
    return JsonResponse({'success': False, 'message': 'Método no permitido'}, status=405)

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
#--------------------------GESTOR FACTURA --------------------------------
@login_required(login_url='login')
def mod_factura(request):
    return render(request, 'proveedor/factura.html')





#--------------------------GESTOR ENVIO --------------------------------
@login_required(login_url='login')
def mod_envio(request):
    return render(request, 'proveedor/envio.html')