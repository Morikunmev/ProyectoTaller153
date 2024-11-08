from django.urls import path
from dashboard import views

urlpatterns = [
    path('dashboard/', views.dashboard, name="dashboard"),
    path('logout/', views.logout, name='logout'),  # Ruta para cerrar sesión
    
    #--------------------RUTA PARA PROVEEDORES--------------------
    # Rutas para el módulo de Proveedores
    path('proveedor/', views.mod_proveedor, name='mod_proveedor'),  # Vista principal de proveedores
    #Nuevas URLS para la API
    path('api/proveedor/crear/', views.crear_proveedor, name='crear_proveedor'),
    
    path('api/proveedor/listar/', views.listar_proveedores, name='listar_proveedores'),
    path('api/proveedor/<int:proveedor_id>/eliminar/', views.eliminar_proveedor, name='eliminar_proveedor'),


    #--------------------RUTA PARA FACTURA--------------------
    path('factura/', views.mod_factura, name='mod_factura'),     # Vista de facturas
    
    #--------------------RUTA PARA ENVIO--------------------
    path('envio/', views.mod_envio, name='mod_envio'),          # Vista de envíos
    
]
