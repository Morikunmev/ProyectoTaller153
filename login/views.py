# views.py
from django.shortcuts import render, redirect
from .forms import FormularioRecuperar
from django.core.mail import send_mail
from django.urls import reverse

def login(request):
    return render(request, 'login.html')

def recuperar_contraseña(request):
    if request.method == 'POST':
        form = FormularioRecuperar(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            
            # Construir la URL absoluta
            recuperacion_url = request.build_absolute_uri(
                reverse('contraseña_recuperacion')
            )
            
            # Modificar el mensaje del correo para incluir el enlace
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
            return render(request, 'correo_recuperacion.html', {'form': form, 'message': message})
    else:
        form = FormularioRecuperar()

    return render(request, 'correo_recuperacion.html', {'form': form})

def mostrar_template_recuperacion(request):
    return render(request, 'contraseña_recuperacion.html')