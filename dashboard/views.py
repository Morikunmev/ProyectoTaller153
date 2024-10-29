from django.shortcuts import render, redirect
from django.contrib.auth import logout as auth_logout
from django.contrib.auth.decorators import login_required  # Importa el decorador

#--------------------------LOGICA DE LOGIN --------------------------------
@login_required(login_url='login')
def dashboard(request):
    return render(request, 'home/dashboard.html')

def logout(request):
    auth_logout(request)  # Cerrar la sesión del usuario
    return redirect('login')  # Redirigir al usuario a la página de inicio de sesión
#--------------------------LOGICA DE LOGIN --------------------------------