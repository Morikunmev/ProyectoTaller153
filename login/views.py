# views.py
from django.shortcuts import render, redirect
from .forms import FormularioRecuperar
from django.core.mail import send_mail
from django.urls import reverse
from django.contrib import messages
from django.contrib.auth import authenticate, login as auth_login  # Renombramos login para evitar conflicto
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from .models import Usuario  # Asegúrate de importar el modelo Usuario



def login(request):
    # Verificar si el usuario está autenticado
    if request.user.is_authenticated:
        # Si el usuario ya está autenticado, redirigir al dashboard
        return redirect('dashboard')
    # Si no está autenticado, mostrar la página de login
    return render(request, 'login.html')


def login_view(request):
    # Verificar si ya hay una sesión activa
    if request.user.is_authenticated:
        # Si el usuario ya está autenticado, redirigir al dashboard
        return redirect('dashboard')
    
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        remember_me = request.POST.get("remember_me")
        # Intentar autenticar el usuario
        user = authenticate(request, username=username, password=password)
        if user is not None:
            # Verificar si el user.id es 1
            if user.id == 1:
                auth_login(request, user)
                # Configurar la duración de la sesión según el checkbox "recordarme"
                if remember_me:
                    request.session.set_expiry(1209600)  # 2 semanas
                else:
                    request.session.set_expiry(0)  # Expirar al cerrar el navegador
                return redirect("dashboard")
            else:
                try:
                    usuario = Usuario.objects.get(user=user)
                    if usuario.TipoUsuario == "Administrador":
                        auth_login(request, user)
                        # Configurar la duración de la sesión según el checkbox "recordarme"
                        if remember_me:
                            request.session.set_expiry(1209600)  # 2 semanas
                        else:
                            request.session.set_expiry(0)  # Expirar al cerrar el navegador
                        return redirect("dashboard")
                    else:
                        messages.error(request, "Solo el administrador puede iniciar sesión.")
                except Usuario.DoesNotExist:
                    messages.error(request, "Nombre de usuario o contraseña incorrectos.")
        else:
            messages.error(request, "Nombre de usuario o contraseña incorrectos.")
    return render(request, "login.html")
def recuperar_contraseña(request):
    message = None
    message_type = None
    show_captcha = True  # Variable para controlar la visibilidad del captcha
    if request.method == 'POST':
        #se crea una instancia del formulario
        form = FormularioRecuperar(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            
            #Se obtiene el modelo de usuario configurado en la aplicación (esto puede ser el modelo de usuario por defecto de Django o uno personalizado).
            
            # Verificar si existe el usuario con ese email
            User = get_user_model()
            try:
                user = User.objects.get(email=email)
                
                # Se genera un token de recuperación de contraseña utilizando el generador de tokens por defecto de Django. Este token es único y se vincula al usuario.
                
                token = default_token_generator.make_token(user)
                
                #Se codifica el ID del usuario (user.pk) en un formato seguro para URLs, usando urlsafe_base64_encode. Esto es útil para enviar el ID del usuario de manera segura en un enlace, por ejemplo, en un correo electrónico.
                
                uid = urlsafe_base64_encode(force_bytes(user.pk))

                # URL de recuperación
                recuperacion_url = request.build_absolute_uri(
                    reverse('cambiar_contraseña', kwargs={'uidb64': uid, 'token': token})
                )
                
                mensaje_correo = f'''
                Para recuperar tu contraseña, haz clic en el siguiente enlace:
                {recuperacion_url}
                '''
                send_mail(
                    'Recuperación de Contraseña',
                    mensaje_correo,
                    'ricky201325@gmail.com',
                    [email],
                    fail_silently=False,
                )
                message = f'Correo enviado a {email} con instrucciones para recuperar la contraseña.'
                message_type = 'success'
                show_captcha = False  # Ocultar captcha después de envío exitoso
            except User.DoesNotExist:
                message = 'No existe ninguna cuenta asociada a este correo electrónico.'
                message_type = 'error'
                show_captcha = False  # Ocultar captcha después de error
                
    else:
        form = FormularioRecuperar()

    return render(request, 'correo_recuperacion.html', {
        'form': form,
        'RECAPTCHA_SITE_KEY': settings.RECAPTCHA_SITE_KEY,
        'message': message,
        'message_type': message_type,
        'show_captcha': show_captcha
    })

def cambiar_contraseña(request, uidb64, token):
    User = get_user_model()
    message = None
    message_type = None
    redirect_to_login = False

    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
        
        if default_token_generator.check_token(user, token):
            if request.method == 'POST':
                nueva_contraseña = request.POST['nueva_contraseña']
                confirmar_contraseña = request.POST['confirmar_contraseña']
                
                if nueva_contraseña == confirmar_contraseña:
                    user.set_password(nueva_contraseña)
                    user.save()
                    message = 'Tu contraseña ha sido cambiada con éxito.'  # Mensaje modificado
                    message_type = 'success'
                    redirect_to_login = True
                else:
                    message = 'Las contraseñas no coinciden. Por favor, intenta nuevamente.'
                    message_type = 'error'
        else:
            message = 'El enlace de recuperación de contraseña es inválido.'
            message_type = 'error'
    
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None
        message = 'El enlace de recuperación de contraseña es inválido.'
        message_type = 'error'
        
    return render(request, 'cambiar_contraseña.html', {
        'message': message,
        'message_type': message_type,
        'redirect_to_login': redirect_to_login,
    })