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
    
    path('api/consultar_proveedores_detalle/', views.consultar_proveedores_detalle, name='consultar_proveedores_detalle'),




    #--------------------RUTA PARA FACTURA--------------------
    path('factura/', views.mod_factura, name='mod_factura'),     # Vista de facturas
    
    path('api/factura/listar/', views.listar_facturas, name='listar_facturas'),
    path('api/factura/crear/', views.crear_factura, name='crear_factura'),
    path('api/factura/<int:factura_id>/eliminar/', views.eliminar_factura, name='eliminar_factura'),
    path('api/factura/<int:factura_id>/actualizar/', views.actualizar_factura, name='actualizar_factura'),
    path('api/facturas/exportar-excel/', views.exportar_facturas_excel, name='exportar_facturas_excel'),
    path('api/factura/<int:factura_id>/ver-documento/', views.ver_documento_factura,  name='ver_documento_factura'),
    path('api/consultar_facturas_detalle/', views.consultar_facturas_detalle, name='consultar_facturas_detalle'),



    
    #--------------------RUTA PARA ENVIO--------------------
    path('envio/', views.mod_envio, name='mod_envio'),          # Vista de envíos
    path('api/envio/listar/', views.listar_envios, name='listar_envios'),
    path('api/envio/crear/', views.crear_envio, name='crear_envio'),
    path('api/envio/<int:envio_id>/eliminar/', views.eliminar_envio, name='eliminar_envio'),
    path('api/envio/<int:envio_id>/actualizar/', views.actualizar_envio, name='actualizar_envio'),
    path('api/envios/exportar-excel/', views.exportar_envios_excel, name='exportar_envios_excel'),
    path('api/envio/tiempo-detallado/<int:envio_id>/', 
         views.obtener_tiempo_detallado, 
         name='obtener_tiempo_detallado'),
    path('api/envios/<int:envio_id>/toggle-status/', views.toggle_envio_status, name='toggle-envio-status'),
    
    
    #-------------------RUTA PARA MATERIAL-----------------
    path('material/', views.mod_material, name='mod_material'),
    # APIs de material
    path('api/material/listar/', views.listar_materiales, name='listar_materiales'),
    path('api/material/crear/', views.crear_material, name='crear_material'),
    path('api/material/<int:material_id>/eliminar/', views.eliminar_material, name='eliminar_material'),
    path('api/material/<int:material_id>/actualizar/', views.actualizar_material, name='actualizar_material'),
    path('api/materiales/exportar-excel/', views.exportar_materiales_excel, name='exportar_materiales_excel'),
    path('api/materiales/<int:material_id>/detalles/', views.obtener_detalles_material, name='obtener_detalles_material'),
    
    
        #-------------------RUTA PARA HERRAMIENTA-----------------
    path('herramienta/', views.mod_herramienta, name='mod_herramienta'),
    path('api/herramientas/listar/', views.listar_herramientas, name='listar_herramientas'),
    path('api/herramientas/crear/', views.crear_herramienta, name='crear_herramienta'),
    path('api/herramientas/<int:herramienta_id>/actualizar/', views.actualizar_herramienta, name='actualizar_herramienta'),
    path('api/herramientas/<int:herramienta_id>/eliminar/', views.eliminar_herramienta, name='eliminar_herramienta'),
    path('api/herramientas/exportar-excel/', views.exportar_herramientas_excel, name='exportar_herramientas_excel'),
    path('api/herramientas/<int:herramienta_id>/detalles/', views.obtener_detalles_herramienta, name='obtener_detalles_herramienta'),
    
    
#-------------------RUTA PARA PRODUCTO-----------------
    path('producto/', views.mod_producto, name='mod_producto'),  # Vista principal
# APIs de producto
    path('api/producto/listar/', views.listar_productos, name='listar_productos'),
    path('api/producto/crear/', views.crear_producto, name='crear_producto'),
    path('api/producto/<int:producto_id>/eliminar/', views.eliminar_producto, name='eliminar_producto'),
    path('api/producto/<int:producto_id>/actualizar/', views.actualizar_producto, name='actualizar_producto'),
    path('api/productos/exportar-excel/', views.exportar_productos_excel, name='exportar_productos_excel'),
    
    path('api/producto/<int:producto_id>/venta/', views.registrar_venta, name='registrar_venta'),
    
    
    path('api/producto/<int:producto_id>/perdida/', views.registrar_perdida, name='registrar_perdida'),    
    path('api/categorias/listar/', views.listar_categorias, name='listar_categorias'),

    path('api/materiales/producto/', views.listar_materiales_producto, name='listar_materiales_producto'),
    
    #-------------------RUTAS PARA VENTAS Y CLIENTES-----------------
    path('api/clientes/listar/', views.listar_clientes, name='listar_clientes'),
    
    
    #-------------------RUTAS PARA CATEGORIAS-----------------
    path('categoria/', views.mod_categoria, name='mod_categoria'),  # Vista principal
    path('api/categoria/listar-completo/', views.listar_categorias_completo, name='listar_categorias_completo'),
    path('api/categoria/crear/', views.crear_categoria, name='crear_categoria'),
    path('api/categoria/<int:categoria_id>/eliminar/', views.eliminar_categoria, name='eliminar_categoria'),
    path('api/categoria/<int:categoria_id>/actualizar/', views.actualizar_categoria, name='actualizar_categoria'),
    path('api/categorias/exportar-excel/', views.exportar_categorias_excel, name='exportar_categorias_excel'),
    
    path('api/categoria/<int:categoria_id>/solicitar-eliminacion/', 
         views.solicitar_eliminacion_categoria, 
         name='solicitar_eliminacion_categoria'),
    
    path('api/categoria/confirmar-eliminacion/<str:token>/', 
         views.confirmar_eliminacion_categoria, 
         name='confirmar_eliminacion_categoria'),

    #-------------------RUTAS PARA USUARIOS-----------------
    path('api/usuario/actualizar/', views.actualizar_usuario, name='actualizar_usuario'),

    #-------------------RUTAS PARA CORREO-----------------
    path('api/enviar-reporte/', views.enviar_reporte, name='enviar_reporte'),
    
    #-------------------RUTAS PARA PERDIDA-----------------
    # APIs de pérdidas
    path('perdida/', views.mod_perdida, name='mod_perdida'),  # Vista principal
    path('api/perdidas/listar/', views.listar_perdidas, name='listar_perdidas'),
    path('api/perdida/<int:perdida_id>/actualizar/', views.actualizar_perdida, name='actualizar_perdida'),
    path('api/perdidas/exportar-excel/', views.exportar_perdidas_excel, name='exportar_perdidas_excel'),
    path('api/perdida/<int:perdida_id>/eliminar/', views.eliminar_perdida, name='eliminar_perdida'),
    
    
    #-------------------RUTAS PARA VENTAS-----------------
    # Vista principal de ventas
    path('venta/', views.mod_venta, name='mod_venta'),

    # APIs de ventas
    path('api/ventas/listar/', views.listar_ventas, name='listar_ventas'),
    path('api/venta/<int:venta_id>/actualizar/', views.actualizar_venta, name='actualizar_venta'),
    path('api/ventas/exportar-excel/', views.exportar_ventas_excel, name='exportar_ventas_excel'),
    path('api/venta/<int:venta_id>/eliminar/', views.eliminar_venta, name='eliminar_venta'),
    
    
    #-------------------RUTAS PARA CLIENTE-----------------
    # URL principal del módulo cliente
    path('cliente/', views.mod_cliente, name='mod_cliente'),

    # APIs de clientes
    path('api/clientes/listar/', views.listar_clientes, name='listar_clientes'),
    path('api/cliente/<int:cliente_id>/actualizar/', views.actualizar_cliente, name='actualizar_cliente'),
    path('api/clientes/exportar-excel/', views.exportar_clientes_excel, name='exportar_clientes_excel'),
    path('api/cliente/<int:cliente_id>/eliminar/', views.eliminar_cliente, name='eliminar_cliente'),
    path('api/cliente/crear/', views.crear_cliente, name='crear_cliente'),




    
    
]





