from django.urls import path
from dashboard import views

urlpatterns = [
    path('dashboard/', views.dashboard, name="dashboard"),
    path('logout/', views.logout, name='logout'),  # Ruta para cerrar sesión
    
    #--------------------RUTA PARA EL MUESTREO DEL NAVBAR--------------------

    path('api/user/current/', views.get_current_user, name='current-user'),

    
    #--------------------RUTA PARA PROVEEDORES--------------------
    # Rutas para el módulo de Proveedores
    path('proveedor/', views.mod_proveedor, name='mod_proveedor'),  # Vista principal de proveedores
    #Nuevas URLS para la API
    path('api/proveedor/crear/', views.crear_proveedor, name='crear_proveedor'),
    
    path('api/proveedor/listar/', views.listar_proveedores, name='listar_proveedores'),
    path('api/proveedor/<int:proveedor_id>/eliminar/', views.eliminar_proveedor, name='eliminar_proveedor'),
    path('api/proveedores/<int:proveedor_id>/actualizar', views.actualizar_proveedor, name='actualizar_proveedor'),
    path('api/proveedores/exportar-excel/', views.exportar_proveedores_excel, name='exportar_proveedores_excel'),



    #--------------------RUTA PARA FACTURA--------------------
    path('factura/', views.mod_factura, name='mod_factura'),     # Vista de facturas
    
    path('api/factura/listar/', views.listar_facturas, name='listar_facturas'),
    path('api/factura/crear/', views.crear_factura, name='crear_factura'),
    path('api/factura/<int:factura_id>/eliminar/', views.eliminar_factura, name='eliminar_factura'),
    path('api/factura/<int:factura_id>/actualizar/', views.actualizar_factura, name='actualizar_factura'),
    path('api/facturas/exportar-excel/', views.exportar_facturas_excel, name='exportar_facturas_excel'),
    
    #--------------------RUTA PARA ENVIO--------------------
    path('envio/', views.mod_envio, name='mod_envio'),          # Vista de envíos
    
]
