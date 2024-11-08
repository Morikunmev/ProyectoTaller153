from django.shortcuts import render, redirect
from django.contrib.auth import logout as auth_logout
from django.contrib.auth.decorators import login_required  # Importa el decorador
from django.http import JsonResponse # Importa JsonResponse para enviar respuestas JSON en vistas de Django.
from django.views.decorators.csrf import csrf_exempt #Importa el decorador csrf_exempt para deshabilitar la verificación CSRF en una vista específica.
import json #Importa la biblioteca json para trabajar con datos en formato JSON.
from .models import Proveedor
from django.core.exceptions import ValidationError #Importa ValidationError, que se usa para manejar errores de validacion en los modelos de Django
from django.views.decorators.csrf import ensure_csrf_cookie

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
            # Obtenemos los datos del formulario
            data = request.POST
            
            # Creamos el proveedor sin la foto primero
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
            
            # Si hay una foto, la subimos a Cloudinary
            if 'FotoProveedor' in request.FILES:
                foto = request.FILES['FotoProveedor']
                # La foto se subirá automáticamente a Cloudinary gracias al CloudinaryField
                nuevo_proveedor.FotoProveedor = foto
            
            # Validamos el modelo
            nuevo_proveedor.full_clean()
            # Guardamos el proveedor
            nuevo_proveedor.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Proveedor creado exitosamente',
                'proveedor_id': nuevo_proveedor.id
            })
            
        except ValidationError as e:
            return JsonResponse({
                'success': False,
                'message': dict(e)
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            }, status=400)
    
    return JsonResponse({
        'success': False,
        'message': 'Método no permitido'
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



#--------------------------GESTOR FACTURA --------------------------------
@login_required(login_url='login')
def mod_factura(request):
    return render(request, 'proveedor/factura.html')





#--------------------------GESTOR ENVIO --------------------------------
@login_required(login_url='login')
def mod_envio(request):
    return render(request, 'proveedor/envio.html')