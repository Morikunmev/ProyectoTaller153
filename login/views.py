from django.shortcuts import render, redirect
from .forms import FormularioRecuperar
from django.core.mail import send_mail

def login(request):
    return render(request, 'login.html')

def recuperar_contraseña(request):
    if request.method == 'POST':
        form = FormularioRecuperar(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            # Lógica para enviar el correo electrónico
            send_mail(
                'Recuperación de Contraseña',
                'Instrucciones para restablecer tu contraseña.',
                'ricky201325@gmail.com',  # Cambia esto por tu correo
                [email],
                fail_silently=False,
            )
            message = f'Correo enviado a {email} con instrucciones para recuperar la contraseña.'
            return render(request, 'correo_recuperacion.html', {'form': form, 'message': message})
    else:
        form = FormularioRecuperar()

    return render(request, 'correo_recuperacion.html', {'form': form})
