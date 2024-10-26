from django.shortcuts import render, redirect
from .forms import ProductoForm
from .models import Producto  # Asegúrate de importar tu modelo de productos

def dashboard(request):
    # Procesa el formulario de creación de producto
    if request.method == 'POST':
        form = ProductoForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('dashboard')
    else:
        form = ProductoForm()

    # Recupera todos los productos para mostrarlos en el dashboard
    productos = Producto.objects.all()

    return render(request, 'home/dashboard.html', {'form': form, 'productos': productos})
