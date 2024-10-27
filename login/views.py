# views.py
from django.shortcuts import render, redirect
from .forms import FormularioRecuperar
from django.core.mail import send_mail
from django.urls import reverse
from django.contrib import messages
from django.contrib.auth import authenticate, login as auth_login  # Renombramos login para evitar conflicto
from django.conf import settings
from django.contrib.auth import get_user_model


def login(request):
    return render(request, 'login.html')


def login_view(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            auth_login(request, user)  # Usamos auth_login en lugar de login
            return redirect("dashboard")
        else:
            messages.error(request, "Nombre de usuario o contraseña incorrectos")
            
    return render(request, "login.html")

def recuperar_contraseña(request):
    message = None
    message_type = None
    show_captcha = True  # Variable para controlar la visibilidad del captcha
    
    if request.method == 'POST':
        form = FormularioRecuperar(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            
            # Verificar si existe el usuario con ese email
            User = get_user_model()
            try:
                user = User.objects.get(email=email)
                
                # Si existe el usuario, envía el correo
                recuperacion_url = request.build_absolute_uri(
                    reverse('contraseña_recuperacion')
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
def mostrar_template_recuperacion(request):
    return render(request, 'contraseña_recuperacion.html')


