from django.urls import path
from dashboard import views

urlpatterns = [
    path('dashboard/', views.dashboard, name="dashboard"),
    path('logout/', views.logout, name='logout'),  # Ruta para cerrar sesión
    
    #RUTA PARA PROVEEDORES
    # Rutas para el módulo de Proveedores
    path('proveedor/', views.mod_proveedor, name='mod_proveedor'),  # Vista principal de proveedores
    path('factura/', views.mod_factura, name='mod_factura'),     # Vista de facturas
    path('envio/', views.mod_envio, name='mod_envio'),          # Vista de envíos
    
]
